'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class InventoryItem extends Model {
    static associate(models) {
      InventoryItem.belongsTo(models.User, {
        foreignKey: 'mechanicId',
        as: 'mechanic',
      });
    }
  }
  InventoryItem.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    sku: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    costPrice: DataTypes.FLOAT,
    sellingPrice: DataTypes.FLOAT,
    location: DataTypes.STRING,
    mechanicId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'InventoryItem',
  });
  return InventoryItem;
};