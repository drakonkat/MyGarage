'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Car extends Model {
    static associate(models) {
      Car.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner',
      });
      Car.hasMany(models.MaintenanceRecord, {
        foreignKey: 'carId',
        as: 'maintenance',
      });
      Car.hasMany(models.KnownIssue, {
        foreignKey: 'carId',
        as: 'knownIssues',
      });
      Car.hasMany(models.Reminder, {
        foreignKey: 'carId',
        as: 'reminders',
      });
      Car.hasMany(models.Quote, {
        foreignKey: 'carId',
        as: 'quotes',
      });
      Car.hasMany(models.Invoice, {
        foreignKey: 'carId',
        as: 'invoices',
      });
    }
  }
  Car.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    make: DataTypes.STRING,
    model: DataTypes.STRING,
    year: DataTypes.INTEGER,
    ownerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Car',
  });
  return Car;
};