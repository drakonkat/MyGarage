import db from '../database/models/index.js';
const { User, Quote, Invoice, Car } = db;

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
                return res.status(404).json({ message: "Client with this email not found." });
            }
            if (client.id === mechanicId) {
                return res.status(400).json({ message: "You cannot add yourself as a client." });
            }

            const mechanic = await User.findByPk(mechanicId);
            await mechanic.addClient(client);

            res.status(201).json({ message: "Client added successfully." });

        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                 return res.status(409).json({ message: 'This user is already your client.' });
            }
            console.error(error);
            res.status(500).json({ message: "Error adding client." });
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
            res.status(500).json({ message: "Error fetching clients." });
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
                return res.status(404).json({ message: "Client not found" });
            }
            // Qui si potrebbe aggiungere un controllo per assicurarsi che il richiedente sia il meccanico di questo cliente
            res.status(200).json(client);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching client details." });
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
            res.status(500).json({ message: "Error creating quote." });
         }
    },

    getQuotes: async (req, res) => {
        const mechanicId = req.user.id;
        try {
            const quotes = await Quote.findAll({ where: { mechanicId }});
            res.status(200).json(quotes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching quotes." });
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
            res.status(500).json({ message: "Error creating invoice." });
        }
    },

    getInvoices: async (req, res) => {
        const mechanicId = req.user.id;
        try {
            const invoices = await Invoice.findAll({ where: { mechanicId }});
            res.status(200).json(invoices);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching invoices." });
        }
    }
};

export default mechanicController;
