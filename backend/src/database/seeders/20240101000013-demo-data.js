'use strict';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Crea Utente Meccanico e Utente Cliente
      const hashedPassword = bcrypt.hashSync('password', 10);
      const userEmails = ['admin@mygarage.com', 'mario.rossi@email.com'];
      
      await queryInterface.bulkInsert('Users', [
        {
          email: userEmails[0],
          password: hashedPassword,
          role: 'mechanic',
          firstName: 'Admin',
          lastName: 'Meccanico',
          phone: '1234567890',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: userEmails[1],
          password: hashedPassword,
          role: 'personal',
          firstName: 'Mario',
          lastName: 'Rossi',
          phone: '0987654321',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ], { transaction });

      // Recupera gli utenti appena inseriti per ottenere i loro ID, poiché bulkInsert non li restituisce in modo affidabile su tutti i DB
      const users = await queryInterface.sequelize.query(
        `SELECT id, email FROM Users WHERE email IN (:userEmails)`,
        {
          replacements: { userEmails },
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      const mechanicId = users.find(u => u.email === 'admin@mygarage.com').id;
      const userClientId = users.find(u => u.email === 'mario.rossi@email.com').id;

      // 2. Crea Clienti (uno con account, uno senza)
      const clientEmails = ['mario.rossi@email.com', 'laura.bianchi@email.com'];
      await queryInterface.bulkInsert('Clients', [
        {
          firstName: 'Mario',
          lastName: 'Rossi',
          email: clientEmails[0],
          phone: '0987654321',
          mechanicId: mechanicId,
          userId: userClientId, // Cliente con account
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: 'Laura',
          lastName: 'Bianchi',
          email: clientEmails[1],
          phone: '1122334455',
          mechanicId: mechanicId,
          userId: null, // Cliente senza account
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ], { transaction });

      // Recupera i clienti appena inseriti
      const clients = await queryInterface.sequelize.query(
         `SELECT id, email FROM Clients WHERE email IN (:clientEmails)`,
         {
           replacements: { clientEmails },
           type: Sequelize.QueryTypes.SELECT,
           transaction
         }
      );

      const clientWithAccountId = clients.find(c => c.email === 'mario.rossi@email.com').id;
      const clientWithoutAccountId = clients.find(c => c.email === 'laura.bianchi@email.com').id;


      // 3. Crea Auto per i clienti
      const carId1 = uuidv4();
      const carId2 = uuidv4();
      const carId3 = uuidv4();

      await queryInterface.bulkInsert('Cars', [
        {
          id: carId1,
          make: 'Fiat',
          model: 'Panda',
          year: 2018,
          licensePlate: 'AA123BB',
          ownerId: userClientId, // Associato all'utente
          clientId: clientWithAccountId, // E al record cliente
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: carId2,
          make: 'Volkswagen',
          model: 'Golf',
          year: 2020,
          licensePlate: 'CC456DD',
          ownerId: null,
          clientId: clientWithoutAccountId, // Associato solo al record cliente
          createdAt: new Date(),
          updatedAt: new Date(),
        },
         {
          id: carId3,
          make: 'Alfa Romeo',
          model: 'Giulia',
          year: 2021,
          licensePlate: 'EE789FF',
          ownerId: userClientId,
          clientId: clientWithAccountId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ], { transaction });

      // 4. Aggiungi Manutenzione per le auto
      await queryInterface.bulkInsert('MaintenanceRecords', [
        // Manutenzione Fiat Panda
        { id: uuidv4(), date: '2023-05-10', mileage: 60000, description: 'Cambio olio e filtro', cost: 120, carId: carId1, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), date: '2024-01-15', mileage: 75000, description: 'Sostituzione pastiglie freni anteriori', cost: 250, carId: carId1, createdAt: new Date(), updatedAt: new Date() },
        
        // Manutenzione VW Golf
        { id: uuidv4(), date: '2023-11-20', mileage: 45000, description: 'Tagliando completo', cost: 350, carId: carId2, createdAt: new Date(), updatedAt: new Date() },

        // Manutenzione Alfa Romeo Giulia
        { id: uuidv4(), date: '2023-09-01', mileage: 30000, description: 'Cambio pneumatici', cost: 600, carId: carId3, createdAt: new Date(), updatedAt: new Date() },
      ], { transaction });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      console.error('Seeding failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
     const transaction = await queryInterface.sequelize.transaction();
    try {
        // Rimuovi in ordine inverso per rispettare le foreign key
        await queryInterface.bulkDelete('MaintenanceRecords', null, { transaction });
        await queryInterface.bulkDelete('Cars', null, { transaction });
        await queryInterface.bulkDelete('Clients', null, { transaction });
        await queryInterface.bulkDelete('Users', null, { transaction });
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
  }
};
