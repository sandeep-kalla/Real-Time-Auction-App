const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Initialize Sequelize with PostgreSQL connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Disabled query logging for cleaner output
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 3
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    // console.log('Database connection has been established successfully.'); // Commented out for cleaner logs
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Define models
const db = {
  sequelize,
  Sequelize,
};

// Import all model files and add them to the db object
fs.readdirSync(__dirname)
  .filter(file => {
    return file.indexOf('.') !== 0 && 
           file !== 'index.js' && 
           file.slice(-3) === '.js';
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Set up associations between models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Initialize database connection
testConnection();

// Export the db object
module.exports = db;