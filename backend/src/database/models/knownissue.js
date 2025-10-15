'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class KnownIssue extends Model {
    static associate(models) {
       KnownIssue.belongsTo(models.Car, {
        foreignKey: 'carId',
        as: 'car',
      });
    }
  }
  KnownIssue.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    description: DataTypes.STRING,
    dateAdded: DataTypes.STRING,
    isResolved: DataTypes.BOOLEAN,
    carId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'KnownIssue',
  });
  return KnownIssue;
};