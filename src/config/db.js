import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Helper to ignore un-evaluated Railway template strings
const getEnvVal = (val, fallback) => {
  return (val && !val.includes('${{')) ? val : fallback;
};

const connectionString = 
  getEnvVal(process.env.MYSQL_PUBLIC_URL, null) || 
  getEnvVal(process.env.MYSQL_URL, null) || 
  getEnvVal(process.env.DATABASE_URL, null);

const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize(
      getEnvVal(process.env.MYSQL_DATABASE, process.env.DB_NAME) || 'railway',
      getEnvVal(process.env.MYSQLUSER, process.env.DB_USER) || 'root',
      getEnvVal(process.env.MYSQLPASSWORD, process.env.DB_PASSWORD) || null,
      {
        host: getEnvVal(process.env.MYSQLHOST, process.env.DB_HOST) || '127.0.0.1',
        port: getEnvVal(process.env.MYSQLPORT, process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

// Sync database models
const syncDatabase = async (forceSync = false) => {
  try {
    // If forceSync is true, we use alter: true to update schema without dropping data.
    // If you explicitly want to drop tables, use force: true, but it's dangerous!
    await sequelize.sync({ alter: forceSync, force: false });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error.message);
  }
};

export { sequelize, testConnection, syncDatabase };
