'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add password column to users table
    await queryInterface.addColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true, // Set to true initially to allow existing users
      after: 'email'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove password column from users table
    await queryInterface.removeColumn('users', 'password');
  }
};
