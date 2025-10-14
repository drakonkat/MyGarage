import bcrypt from 'bcryptjs';
import db from '../database/models/index.js';
const { User, Quote, Invoice, Car, MechanicClient } = db;

// Funzione di utilità per generare numeri sequenziali
async function generateNextNumber(model, field, prefix) {
    const lastRecord = await model.findOne({
        order: [[field, 'DESC']],
    });
    let nextNumber = 1;
    if (lastRecord && lastRecord[field]) {
        const lastNum = parseInt(lastRecord[field].replace(prefix, ''), 10);
        nextNumber = lastNum + 1;
    }
    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}


const mechanicController = {
    // --- Client Management ---
    addClient: async (req, res) => {
        const mechanicId = req.user.id;
        const { clientEmail } = req.body;

        try {
            const client = await User.findOne({ where: { email: clientEmail } });
            if (!client) {
                return res.status(404).json({ message: "Cliente con questa email non trovato." });
            }
            if (client.id === mechanicId) {
                return res.status(400).json({ message: "Non puoi aggiungere te stesso come cliente." });
            }

            const mechanic = await User.findByPk(mechanicId);
            // Uso l'associazione `addClient` generata da Sequelize
            await mechanic.addClient(client);

            res.status(201).json({ message: "Cliente aggiunto con successo." });

        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                 return res.status(409).json({ message: 'Questo utente è già un tuo cliente.' });
            }
            console.error(error);
            res.status(500).json({ message: "Errore nell'aggiunta del cliente." });
        }
    },
    
    createClient: async (req, res) => {
        const mechanicId = req.user.id;
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e password sono obbligatorie.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Un utente con questa email esiste già. Usa la funzione "Aggiungi Cliente" per associarlo.' });
        }

        const t = await db.sequelize.transaction();

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newClient = await User.create({
                email,
                password: hashedPassword,
                role: 'personal',
            }, { transaction: t });
            
            // L'associazione diretta tramite tabella di join
            await MechanicClient.create({
                mechanicId: mechanicId,
                clientId: newClient.id
            }, { transaction: t });

            await t.commit();

            res.status(201).json({ 
                message: "Cliente creato e aggiunto con successo.",
                client: { id: newClient.id, email: newClient.email }
            });

        } catch (error) {
            await t.rollback();
            console.error('Errore nella creazione del cliente:', error);
            res.status(500).json({ message: 'Errore interno del server durante la creazione del cliente.' });
        }
    },

    getClients: async (req, res) => {
        const mechanicId = req.user.id;
        try {
            const mechanic = await User.findByPk(mechanicId, {
                include: {
                    model: User,
                    as: 'clients',
                    attributes: ['id', 'email', 'createdAt'],
                    through: { attributes: [] } // Non mostrare i dettagli della tabella di join
                }
            });
            res.status(200).json(mechanic.clients);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel recupero dei clienti." });
        }
    },

    getClientDetails: async(req, res) => {
        const { clientId } = req.params;
         try {
            const client = await User.findByPk(clientId, {
                attributes: ['id', 'email'],
                include: [{
                    model: Car,
                    as: 'cars',
                    attributes: ['id', 'make', 'model', 'year']
                }]
            });
            if (!client) {
                return res.status(404).json({ message: "Cliente non trovato" });
            }
            // Qui si potrebbe aggiungere un controllo per assicurarsi che il richiedente sia il meccanico di questo cliente
            res.status(200).json(client);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel recupero dei dettagli del cliente." });
        }
    },

    // --- Quote & Invoice Management ---
    createQuote: async (req, res) => {
         const mechanicId = req.user.id;
         const { clientId, carId, quoteDate, expiryDate, totalAmount, items, notes } = req.body;
         try {
            const quoteNumber = await generateNextNumber(Quote, 'quoteNumber', 'PREV-');
            const quote = await Quote.create({
                mechanicId,
                clientId,
                carId,
                quoteDate,
                expiryDate,
                totalAmount,
                items,
                notes,
                quoteNumber,
                status: 'draft'
            });
            res.status(201).json(quote);
         } catch(error) {
            console.error(error);
            res.status(500).json({ message: "Errore nella creazione del preventivo." });
         }
    },

    getQuotes: async (req, res) => {
        const mechanicId = req.user.id;
        try {
            const quotes = await Quote.findAll({ where: { mechanicId }});
            res.status(200).json(quotes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel recupero dei preventivi." });
        }
    },

    createInvoice: async (req, res) => {
        const mechanicId = req.user.id;
        const { clientId, carId, invoiceDate, dueDate, totalAmount, items, notes, quoteId } = req.body;
        try {
            const invoiceNumber = await generateNextNumber(Invoice, 'invoiceNumber', 'FATT-');
             const invoice = await Invoice.create({
                mechanicId,
                clientId,
                carId,
                invoiceDate,
                dueDate,
                totalAmount,
                items,
                notes,
                quoteId,
                invoiceNumber,
                status: 'draft'
            });
             if (quoteId) {
                await Quote.update({ status: 'invoiced' }, { where: { id: quoteId, mechanicId }});
            }
            res.status(201).json(invoice);
        } catch(error) {
            console.error(error);
            res.status(500).json({ message: "Errore nella creazione della fattura." });
        }
    },

    getInvoices: async (req, res) => {
        const mechanicId = req.user.id;
        try {
            const invoices = await Invoice.findAll({ where: { mechanicId }});
            res.status(200).json(invoices);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel recupero delle fatture." });
        }
    }
};

export default mechanicController;
