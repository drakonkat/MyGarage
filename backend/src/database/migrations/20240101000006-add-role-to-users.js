'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('personal', 'mechanic'),
      allowNull: false,
      defaultValue: 'personal'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'role');
    // Se stai usando PostgreSQL, potresti dover rimuovere anche il tipo ENUM manualmente.
    // await queryInterface.sequelize.query('DROP TYPE "enum_Users_role";');
  }
};