'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Client extends Model {
    static associate(models) {
      // Un cliente appartiene a un meccanico (che è un User)
      Client.belongsTo(models.User, {
        foreignKey: 'mechanicId',
        as: 'mechanic',
      });

      // Un cliente può essere opzionalmente associato a un account User
      Client.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'userAccount',
      });

      // TODO: Associare auto, preventivi, etc. al Client invece che direttamente all'User
    }
  }
  Client.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mechanicId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Client',
  });
  return Client;
};