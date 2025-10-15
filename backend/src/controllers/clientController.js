import db from '../database/models/index.js';
const { Car, Quote, Invoice } = db;

const clientController = {

    getMyCars: async (req, res) => {
        const ownerId = req.user.id;
        try {
            const cars = await Car.findAll({
                where: { ownerId },
                order: [['year', 'DESC']]
            });
            res.status(200).json(cars);
        } catch (error) {
            console.error("Error fetching client's cars:", error);
            res.status(500).json({ message: "Error fetching cars." });
        }
    },

    getMyQuotes: async (req, res) => {
        const clientId = req.user.id;
        try {
            const quotes = await Quote.findAll({
                where: { clientId },
                order: [['quoteDate', 'DESC']]
            });
            res.status(200).json(quotes);
        } catch (error) {
            console.error("Error fetching client's quotes:", error);
            res.status(500).json({ message: "Error fetching quotes." });
        }
    },

    getMyInvoices: async (req, res) => {
        const clientId = req.user.id;
        try {
            const invoices = await Invoice.findAll({
                where: { clientId },
                order: [['invoiceDate', 'DESC']]
            });
            res.status(200).json(invoices);
        } catch (error) {
            console.error("Error fetching client's invoices:", error);
            res.status(500).json({ message: "Error fetching invoices." });
        }
    }
};

export default clientController;