'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Quote extends Model {
    static associate(models) {
      Quote.belongsTo(models.User, { as: 'mechanic', foreignKey: 'mechanicId' });
      Quote.belongsTo(models.User, { as: 'client', foreignKey: 'clientId' });
      Quote.belongsTo(models.Car, { as: 'car', foreignKey: 'carId' });
      Quote.hasOne(models.Invoice, { as: 'invoice', foreignKey: 'quoteId' });
    }
  }
  Quote.init({
    quoteNumber: DataTypes.STRING,
    mechanicId: DataTypes.INTEGER,
    clientId: DataTypes.INTEGER,
    carId: DataTypes.UUID,
    quoteDate: DataTypes.DATE,
    expiryDate: DataTypes.DATE,
    totalAmount: DataTypes.FLOAT,
    status: DataTypes.ENUM('draft', 'sent', 'accepted', 'rejected', 'invoiced'),
    items: DataTypes.JSONB,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Quote',
  });
  return Quote;
};