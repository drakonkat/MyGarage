'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Car, {
        foreignKey: 'ownerId',
        as: 'cars',
      });
      User.hasMany(models.Quote, { foreignKey: 'mechanicId', as: 'issuedQuotes' });
      User.hasMany(models.Invoice, { foreignKey: 'mechanicId', as: 'issuedInvoices' });
      User.hasMany(models.Quote, { foreignKey: 'clientId', as: 'receivedQuotes' });
      User.hasMany(models.Invoice, { foreignKey: 'clientId', as: 'receivedInvoices' });
      
      // Un meccanico ha molti clienti
      User.hasMany(models.Client, {
        foreignKey: 'mechanicId',
        as: 'clients'
      });
      
      // Un utente può essere un cliente (per il collegamento opzionale)
      User.hasOne(models.Client, {
          foreignKey: 'userId',
          as: 'clientProfile'
      });

      // Un meccanico ha molti articoli in inventario
      User.hasMany(models.InventoryItem, {
        foreignKey: 'mechanicId',
        as: 'inventoryItems'
      });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('personal', 'mechanic'),
      allowNull: false,
      defaultValue: 'personal'
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};