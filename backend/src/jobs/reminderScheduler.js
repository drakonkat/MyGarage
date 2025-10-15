import cron from 'node-cron';
import { Op } from 'sequelize';
import db from '../database/models/index.js';
import emailService from '../services/emailService.js';

const { Reminder, Car, User } = db;

const checkReminders = async () => {
  console.log('Running reminder check job...');
  
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  try {
    const upcomingReminders = await Reminder.findAll({
      where: {
        nextDueDate: {
          [Op.between]: [today.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0]],
        },
      },
      include: [{
        model: Car,
        as: 'car',
        include: [{
          model: User,
          as: 'user'
        }]
      }],
    });

    if (upcomingReminders.length === 0) {
        console.log('No upcoming reminders found.');
        return;
    }

    console.log(`Found ${upcomingReminders.length} upcoming reminders to process.`);

    for (const reminder of upcomingReminders) {
      const user = reminder.car.user;
      const car = reminder.car;
      
      const subject = `Promemoria Scadenza: ${reminder.description}`;
      const text = `Ciao! Ti ricordiamo che la scadenza per "${reminder.description}" relativa alla tua ${car.year} ${car.make} ${car.model} è il ${reminder.nextDueDate}.`;
      const html = `<p>Ciao!</p><p>Ti ricordiamo che la scadenza per <strong>${reminder.description}</strong> relativa alla tua ${car.year} ${car.make} ${car.model} è il <strong>${reminder.nextDueDate}</strong>.</p>`;

      await emailService.sendMail(user.email, subject, text, html);
    }

  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

// Esegue il task ogni giorno a mezzanotte.
// La logica è pronta ma il job è disabilitato di default.
// Per abilitarlo, decommentare la linea `cron.schedule`.
const reminderJob = {
    start: () => {
        // cron.schedule('0 0 * * *', checkReminders);
        console.log('Reminder scheduler is set up but currently disabled. Uncomment the line in reminderScheduler.js to enable it.');
    }
};


export default reminderJob;