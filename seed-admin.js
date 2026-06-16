import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './src/config/db.js';
import Role from './src/models/Role.js';
import Permission from './src/models/Permission.js';
import RolePermission from './src/models/RolePermission.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // Define all permissions in action_module format for grid layout
    const permissions = [
      // User Management
      { name: 'create_users', description: 'Create new user', module: 'users' },
      { name: 'read_users', description: 'View all users', module: 'users' },
      { name: 'update_users', description: 'Edit user details', module: 'users' },
      { name: 'delete_users', description: 'Delete user', module: 'users' },
      
      // Role Management
      { name: 'create_roles', description: 'Create new role', module: 'roles' },
      { name: 'read_roles', description: 'View all roles', module: 'roles' },
      { name: 'update_roles', description: 'Edit role details', module: 'roles' },
      { name: 'delete_roles', description: 'Delete role', module: 'roles' },
      
      // Permission Management
      { name: 'create_permissions', description: 'Create new permission', module: 'permissions' },
      { name: 'read_permissions', description: 'View all permissions', module: 'permissions' },
      { name: 'update_permissions', description: 'Edit permission details', module: 'permissions' },
      { name: 'delete_permissions', description: 'Delete permission', module: 'permissions' },
      
      // Employee Management
      { name: 'create_employees', description: 'Create new employee', module: 'employees' },
      { name: 'read_employees', description: 'View all employees', module: 'employees' },
      { name: 'update_employees', description: 'Edit employee details', module: 'employees' },
      { name: 'delete_employees', description: 'Delete employee', module: 'employees' },
      
      // Dashboard
      { name: 'read_dashboard', description: 'Access admin dashboard', module: 'dashboard' },
      
      // Reports
      { name: 'create_reports', description: 'Generate reports', module: 'reports' },
      { name: 'read_reports', description: 'View reports', module: 'reports' },
      { name: 'update_reports', description: 'Edit reports', module: 'reports' },
      { name: 'delete_reports', description: 'Delete reports', module: 'reports' },
      
      // Settings
      { name: 'read_settings', description: 'View system settings', module: 'settings' },
      { name: 'update_settings', description: 'Edit system settings', module: 'settings' },
      
      // Articles
      { name: 'create_articles', description: 'Create new article', module: 'articles' },
      { name: 'read_articles', description: 'View all articles', module: 'articles' },
      { name: 'update_articles', description: 'Edit article details', module: 'articles' },
      { name: 'delete_articles', description: 'Delete article', module: 'articles' },
      
      // Categories
      { name: 'create_categories', description: 'Create new category', module: 'categories' },
      { name: 'read_categories', description: 'View all categories', module: 'categories' },
      { name: 'update_categories', description: 'Edit category details', module: 'categories' },
      { name: 'delete_categories', description: 'Delete category', module: 'categories' },
      
      // Services
      { name: 'create_services', description: 'Create new service', module: 'services' },
      { name: 'read_services', description: 'View all services', module: 'services' },
      { name: 'update_services', description: 'Edit service details', module: 'services' },
      { name: 'delete_services', description: 'Delete service', module: 'services' },
      
      // Partnerships
      { name: 'create_partnerships', description: 'Create new partnership', module: 'partnerships' },
      { name: 'read_partnerships', description: 'View all partnerships', module: 'partnerships' },
      { name: 'update_partnerships', description: 'Edit partnership details', module: 'partnerships' },
      { name: 'delete_partnerships', description: 'Delete partnership', module: 'partnerships' },
      
      // Leads - Funnel
      { name: 'create_leads_funnel', description: 'Create funnel lead', module: 'leads_funnel' },
      { name: 'read_leads_funnel', description: 'View funnel leads', module: 'leads_funnel' },
      { name: 'update_leads_funnel', description: 'Edit funnel lead details', module: 'leads_funnel' },
      { name: 'delete_leads_funnel', description: 'Delete funnel lead', module: 'leads_funnel' },
      
      // Leads - Landing Page
      { name: 'create_leads_landing_page', description: 'Create landing page lead', module: 'leads_landing_page' },
      { name: 'read_leads_landing_page', description: 'View landing page leads', module: 'leads_landing_page' },
      { name: 'update_leads_landing_page', description: 'Edit landing page lead details', module: 'leads_landing_page' },
      { name: 'delete_leads_landing_page', description: 'Delete landing page lead', module: 'leads_landing_page' },
      
      // Leads - Contact Us
      { name: 'create_leads_contact_us', description: 'Create contact us lead', module: 'leads_contact_us' },
      { name: 'read_leads_contact_us', description: 'View contact us leads', module: 'leads_contact_us' },
      { name: 'update_leads_contact_us', description: 'Edit contact us lead details', module: 'leads_contact_us' },
      { name: 'delete_leads_contact_us', description: 'Delete contact us lead', module: 'leads_contact_us' },
      
      // Leads - Eligibility
      { name: 'create_leads_eligibility', description: 'Create eligibility lead', module: 'leads_eligibility' },
      { name: 'read_leads_eligibility', description: 'View eligibility leads', module: 'leads_eligibility' },
      { name: 'update_leads_eligibility', description: 'Edit eligibility lead details', module: 'leads_eligibility' },
      { name: 'delete_leads_eligibility', description: 'Delete eligibility lead', module: 'leads_eligibility' },
      
      // Devices
      { name: 'create_devices', description: 'Create new device', module: 'devices' },
      { name: 'read_devices', description: 'View all devices', module: 'devices' },
      { name: 'update_devices', description: 'Edit device details', module: 'devices' },
      { name: 'delete_devices', description: 'Delete device', module: 'devices' },
    ];

    console.log('Creating permissions...');
    const createdPermissions = await Permission.bulkCreate(permissions, { 
      ignoreDuplicates: true,
      updateOnDuplicate: ['name', 'description', 'module']
    });

    console.log(`Created ${createdPermissions.length} permissions.`);

    // Create or get Admin role
    console.log('Creating Admin role...');
    let adminRole = await Role.findOne({ where: { name: 'admin' } });
    
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'admin',
        description: 'Administrator with full access to all features'
      });
      console.log('Admin role created.');
    } else {
      console.log('Admin role already exists.');
    }

    // Assign all permissions to Admin role
    console.log('Assigning all permissions to Admin role...');
    const allPermissions = await Permission.findAll();
    
    for (const permission of allPermissions) {
      await RolePermission.findOrCreate({
        where: {
          roleId: adminRole.id,
          permissionId: permission.id
        },
        defaults: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      });
    }

    console.log(`Assigned ${allPermissions.length} permissions to Admin role.`);

    // Create default admin user
    console.log('Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@telehealth.com' },
      defaults: {
        name: 'Super Admin',
        email: 'admin@telehealth.com',
        phone: '+1234567890',
        password: hashedPassword,
        roleId: adminRole.id,
        isActive: true
      }
    });

    if (adminUser) {
      console.log('Default admin user created.');
      console.log('Email: admin@telehealth.com');
      console.log('Password: admin123');
      console.log('Please change the password after first login!');
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedAdmin();
