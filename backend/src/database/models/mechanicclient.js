'use strict';
// This model file was created by mistake and is intentionally structured
// to avoid breaking the model loader in `index.js`.
// The correct model for clients is defined in `client.js`.
export default (sequelize, DataTypes) => {
  // Return a dummy object that looks like a model class to satisfy the loader.
  // It will not be added to the db context in a meaningful way.
  return {
    name: 'MechanicClient_IGNORE',
    associate: (models) => {
      // No associations needed for this placeholder.
    },
  };
};
