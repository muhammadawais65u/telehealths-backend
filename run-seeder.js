import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './src/config/db.js';
import './src/models/index.js';
import { seedRolesAndPermissions } from './src/seeders/rolePermissionSeeder.js';

const sync = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    console.log('Dropping tables with foreign key constraints...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS blogs');
    await sequelize.query('DROP TABLE IF EXISTS blog_categories');
    
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Seeding roles and permissions...');
    await seedRolesAndPermissions();
    console.log('Roles and permissions seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database or sync:', error);
    process.exit(1);
  }
};

sync();
