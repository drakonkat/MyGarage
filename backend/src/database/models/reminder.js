'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Reminder extends Model {
    static associate(models) {
      Reminder.belongsTo(models.Car, {
        foreignKey: 'carId',
        as: 'car',
      });
    }
  }
  Reminder.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    description: DataTypes.STRING,
    nextDueDate: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    frequency: DataTypes.ENUM('monthly', 'annual', 'biennial'),
    paymentHistory: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    carId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Reminder',
  });
  return Reminder;
};