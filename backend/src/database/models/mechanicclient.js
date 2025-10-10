'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MechanicClient extends Model {
    static associate(models) {
      // define association here
    }
  }
  MechanicClient.init({
    mechanicId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'MechanicClient',
  });
  return MechanicClient;
};