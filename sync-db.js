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
    
    console.log('Seeding roles and permissions...');
    await seedRolesAndPermissions();
    console.log('Roles and permissions seeded successfully!');
    
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database or sync:', error);
    process.exit(1);
  }
};

sync();
