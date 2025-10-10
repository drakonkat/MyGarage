'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Un utente (personale o meccanico) può possedere più auto
      User.hasMany(models.Car, {
        foreignKey: 'ownerId',
        as: 'cars',
      });

      // Associazioni per il ruolo 'mechanic'
      User.belongsToMany(models.User, {
        as: 'clients',
        through: models.MechanicClient,
        foreignKey: 'mechanicId',
        otherKey: 'clientId',
      });
      User.hasMany(models.Quote, { foreignKey: 'mechanicId', as: 'issuedQuotes' });
      User.hasMany(models.Invoice, { foreignKey: 'mechanicId', as: 'issuedInvoices' });

      // Associazioni per un utente come 'client'
      User.belongsToMany(models.User, {
        as: 'mechanics',
        through: models.MechanicClient,
        foreignKey: 'clientId',
        otherKey: 'mechanicId',
      });
      User.hasMany(models.Quote, { foreignKey: 'clientId', as: 'receivedQuotes' });
      User.hasMany(models.Invoice, { foreignKey: 'clientId', as: 'receivedInvoices' });
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
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};