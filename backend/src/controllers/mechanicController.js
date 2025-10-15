import db from '../database/models/index.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

const { User, Client, Car, Quote, Invoice, InventoryItem, MaintenanceRecord, sequelize } = db;

const mechanicController = {
  getDashboardStats: async (req, res) => {
    try {
      const mechanicId = req.user.id;

      const clientCount = await Client.count({ where: { mechanicId } });
      
      const totalRevenueResult = await Invoice.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue']],
        where: { mechanicId, status: 'paid' },
        raw: true
      });
      const totalRevenue = totalRevenueResult.totalRevenue || 0;

      const pendingQuotes = await Quote.count({ where: { mechanicId, status: { [Op.in]: ['sent', 'draft'] } } });
      const overdueInvoices = await Invoice.count({ where: { mechanicId, status: 'overdue' } });
      
      const thisYear = new Date().getFullYear();
      
      // Dialect-specific date formatting
      const dialect = sequelize.options.dialect;
      let dateFunction;
      if (dialect === 'mysql') {
        dateFunction = sequelize.fn('DATE_FORMAT', sequelize.col('invoiceDate'), '%Y-%m');
      } else if (dialect === 'postgres') {
        dateFunction = sequelize.fn('to_char', sequelize.col('invoiceDate'), 'YYYY-MM');
      } else { // Default to sqlite
        dateFunction = sequelize.fn('strftime', '%Y-%m', sequelize.col('invoiceDate'));
      }

      const monthlyRevenueRaw = await Invoice.findAll({
         attributes: [
            [dateFunction, 'month'],
            [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
        ],
        where: {
            mechanicId,
            status: 'paid',
            invoiceDate: {
                [Op.gte]: new Date(`${thisYear}-01-01`),
                [Op.lt]: new Date(`${thisYear + 1}-01-01`)
            }
        },
        group: ['month'],
        order: [[sequelize.col('month'), 'ASC']],
        raw: true
      });

      res.status(200).json({
        clientCount,
        totalRevenue,
        pendingQuotes,
        overdueInvoices,
        monthlyRevenue: monthlyRevenueRaw
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Error fetching dashboard stats." });
    }
  },

  getClients: async (req, res) => {
    try {
      const clients = await Client.findAll({
        where: { mechanicId: req.user.id },
        order: [['lastName', 'ASC'], ['firstName', 'ASC']],
      });
      res.status(200).json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Error fetching clients." });
    }
  },

  createClient: async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    const mechanicId = req.user.id;
    const transaction = await sequelize.transaction();

    try {
      let newUserId = null;
      if (email) {
        const existingUser = await User.findOne({ where: { email }, transaction });
        if (existingUser) {
          throw new Error("Un utente con questa email esiste già.");
        }
        if (!password || password.length < 6) {
          throw new Error("La password è obbligatoria e deve essere di almeno 6 caratteri per creare un account cliente.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: 'personal'
        }, { transaction });
        newUserId = newUser.id;
      }

      const newClient = await Client.create({
        firstName,
        lastName,
        email,
        phone,
        mechanicId,
        userId: newUserId
      }, { transaction });

      await transaction.commit();
      res.status(201).json(newClient);
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating client:", error);
      res.status(500).json({ message: error.message || "Error creating client." });
    }
  },

  getClientDetails: async (req, res) => {
      try {
          const { id } = req.params;
          const client = await Client.findOne({
              where: { id, mechanicId: req.user.id },
              include: [{ model: Car, as: 'cars' }]
          });
          if (!client) {
              return res.status(404).json({ message: "Client not found." });
          }
          res.status(200).json(client);
      } catch (error) {
          console.error("Error fetching client details:", error);
          res.status(500).json({ message: "Error fetching client details." });
      }
  },

  addCarToClient: async (req, res) => {
    try {
      const { clientId } = req.params;
      const { make, model, year, licensePlate, mileage } = req.body;

      const client = await Client.findOne({ where: { id: clientId, mechanicId: req.user.id }});
      if (!client) {
        return res.status(404).json({ message: "Client not found."});
      }

      const newCar = await Car.create({
        make,
        model,
        year: parseInt(year, 10),
        licensePlate,
        clientId: client.id,
        ownerId: client.userId,
      });

      if (mileage) {
        await MaintenanceRecord.create({
          carId: newCar.id,
          date: new Date().toISOString().split('T')[0],
          mileage: parseInt(mileage, 10),
          description: 'Veicolo aggiunto al sistema',
          cost: 0,
          notes: `Chilometraggio iniziale registrato dall'officina.`
        });
      }

      res.status(201).json(newCar);
    } catch (error) {
      console.error("Error adding car to client:", error);
      res.status(500).json({ message: "Error adding car to client." });
    }
  },

  addMaintenanceRecord: async (req, res) => {
    try {
        const { carId } = req.params;
        // TODO: verify car belongs to a client of this mechanic
        const newRecord = await MaintenanceRecord.create({ carId, ...req.body });
        res.status(201).json(newRecord);
    } catch(error) {
        console.error("Error adding maintenance record:", error);
        res.status(500).json({ message: "Error adding maintenance record." });
    }
  },

  deleteMaintenanceRecord: async (req, res) => {
    try {
        const { recordId } = req.params;
        // TODO: verify record belongs to a car of a client of this mechanic
        const record = await MaintenanceRecord.findByPk(recordId);
        if (!record) return res.status(404).json({ message: "Record not found" });
        await record.destroy();
        res.status(204).send();
    } catch(error) {
        console.error("Error deleting maintenance record:", error);
        res.status(500).json({ message: "Error deleting maintenance record." });
    }
  },

  getQuotes: async (req, res) => {
    try {
        const quotes = await Quote.findAll({
            where: { mechanicId: req.user.id },
            include: ['client', 'car'],
            order: [['quoteDate', 'DESC']]
        });
        res.status(200).json(quotes);
    } catch(error) {
        console.error("Error fetching quotes:", error);
        res.status(500).json({ message: "Error fetching quotes." });
    }
  },
  createQuote: async (req, res) => {
    try {
        const quoteNumber = `PREV-${Date.now()}`;
        const newQuote = await Quote.create({ ...req.body, mechanicId: req.user.id, quoteNumber });
        res.status(201).json(newQuote);
    } catch (error) {
        console.error("Error creating quote:", error);
        res.status(500).json({ message: "Error creating quote." });
    }
  },
  getInvoices: async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            where: { mechanicId: req.user.id },
            include: ['client', 'car'],
            order: [['invoiceDate', 'DESC']]
        });
        res.status(200).json(invoices);
    } catch(error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ message: "Error fetching invoices." });
    }
  },
  createInvoice: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const invoiceNumber = `FATT-${Date.now()}`;
        const { quoteId } = req.body;

        const newInvoice = await Invoice.create({ ...req.body, mechanicId: req.user.id, invoiceNumber }, { transaction });

        if (quoteId) {
            await Quote.update({ status: 'invoiced' }, { where: { id: quoteId, mechanicId: req.user.id }, transaction });
        }
        
        await transaction.commit();
        res.status(201).json(newInvoice);
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating invoice:", error);
        res.status(500).json({ message: "Error creating invoice." });
    }
  },
  getInventory: async (req, res) => {
    try {
        const items = await InventoryItem.findAll({ where: { mechanicId: req.user.id }});
        res.status(200).json(items);
    } catch(error) {
        console.error("Error fetching inventory:", error);
        res.status(500).json({ message: "Error fetching inventory." });
    }
  },
  addInventoryItem: async (req, res) => {
    try {
        const newItem = await InventoryItem.create({ ...req.body, mechanicId: req.user.id });
        res.status(201).json(newItem);
    } catch(error) {
        console.error("Error adding inventory item:", error);
        res.status(500).json({ message: "Error adding inventory item." });
    }
  },
  updateInventoryItem: async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await InventoryItem.update(req.body, { where: { id, mechanicId: req.user.id }});
        if (!updated) return res.status(404).json({ message: "Item not found" });
        const updatedItem = await InventoryItem.findByPk(id);
        res.status(200).json(updatedItem);
    } catch(error) {
        console.error("Error updating inventory item:", error);
        res.status(500).json({ message: "Error updating inventory item." });
    }
  },
  deleteInventoryItem: async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await InventoryItem.destroy({ where: { id, mechanicId: req.user.id }});
        if (!deleted) return res.status(404).json({ message: "Item not found" });
        res.status(204).send();
    } catch(error) {
        console.error("Error deleting inventory item:", error);
        res.status(500).json({ message: "Error deleting inventory item." });
    }
  },
};

export default mechanicController;