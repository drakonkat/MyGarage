'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.User, { as: 'mechanic', foreignKey: 'mechanicId' });
      Invoice.belongsTo(models.User, { as: 'client', foreignKey: 'clientId' });
      Invoice.belongsTo(models.Car, { as: 'car', foreignKey: 'carId' });
      Invoice.belongsTo(models.Quote, { as: 'quote', foreignKey: 'quoteId' });
    }
  }
  Invoice.init({
    invoiceNumber: DataTypes.STRING,
    quoteId: DataTypes.INTEGER,
    mechanicId: DataTypes.INTEGER,
    clientId: DataTypes.INTEGER,
    carId: DataTypes.UUID,
    invoiceDate: DataTypes.DATE,
    dueDate: DataTypes.DATE,
    totalAmount: DataTypes.FLOAT,
    status: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
    items: DataTypes.JSONB,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};