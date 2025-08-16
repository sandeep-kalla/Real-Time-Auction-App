const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log
});

async function addPasswordColumn() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    await sequelize.getQueryInterface().addColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    console.log('Password column added successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Password column already exists');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

addPasswordColumn();
