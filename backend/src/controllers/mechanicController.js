import bcrypt from 'bcryptjs';
import db from '../database/models/index.js';
const { User, Quote, Invoice, Car, Client } = db;

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
    createClient: async (req, res) => {
        const mechanicId = req.user.id;
        const { firstName, lastName, phone, email, password } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'Nome e cognome sono obbligatori.' });
        }

        const t = await db.sequelize.transaction();

        try {
            let newUserId = null;
            // Se vengono forniti email e password, crea anche un account utente
            if (email && password) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    await t.rollback();
                    return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = await User.create({
                    email,
                    password: hashedPassword,
                    role: 'personal',
                    firstName,
                    lastName,
                    phone
                }, { transaction: t });
                newUserId = newUser.id;
            }

            // Crea il record del cliente
            const newClient = await Client.create({
                firstName,
                lastName,
                phone,
                email, // Salva l'email anche qui per riferimento
                mechanicId,
                userId: newUserId,
            }, { transaction: t });

            await t.commit();

            res.status(201).json({ 
                message: "Cliente creato con successo.",
                client: newClient
            });

        } catch (error) {
            await t.rollback();
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ message: 'Un cliente con questa email esiste già.' });
            }
            console.error('Errore nella creazione del cliente:', error);
            res.status(500).json({ message: 'Errore interno del server durante la creazione del cliente.' });
        }
    },

    getClients: async (req, res) => {
        const mechanicId = req.user.id;
        try {
            const clients = await Client.findAll({
                where: { mechanicId },
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'createdAt'],
                order: [['lastName', 'ASC'], ['firstName', 'ASC']]
            });
            res.status(200).json(clients);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel recupero dei clienti." });
        }
    },

    getClientDetails: async(req, res) => {
         const { clientId } = req.params;
         const mechanicId = req.user.id;
         try {
            const client = await Client.findOne({
                where: { id: clientId, mechanicId }, // Assicura che il meccanico possa vedere solo i suoi clienti
                // TODO: Includere le auto associate al cliente
            });
            if (!client) {
                return res.status(404).json({ message: "Cliente non trovato o non associato a questo account." });
            }
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
                clientId, // Qui clientId si riferirà all'ID della tabella Client
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