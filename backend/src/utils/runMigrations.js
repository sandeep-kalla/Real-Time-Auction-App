const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Initialize Sequelize with PostgreSQL connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false, // Disabled query logging for cleaner migration output
});

// Run migrations
const runMigrations = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    // console.log('Database connection has been established successfully.'); // Commented out for cleaner logs

    // Get migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));
      await migration.up(sequelize.getQueryInterface(), Sequelize);
      console.log(`Migration ${file} completed successfully.`);
    }

    console.log('All migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

// Run migrations
runMigrations();