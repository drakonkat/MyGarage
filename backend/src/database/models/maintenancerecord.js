'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MaintenanceRecord extends Model {
    static associate(models) {
      MaintenanceRecord.belongsTo(models.Car, {
        foreignKey: 'carId',
        as: 'car',
      });
    }
  }
  MaintenanceRecord.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    date: DataTypes.STRING,
    mileage: DataTypes.INTEGER,
    description: DataTypes.STRING,
    cost: DataTypes.FLOAT,
    notes: DataTypes.TEXT,
    isRecommendation: DataTypes.BOOLEAN,
    diyCost: DataTypes.FLOAT,
    carId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'MaintenanceRecord',
  });
  return MaintenanceRecord;
};
