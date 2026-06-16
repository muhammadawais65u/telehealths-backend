import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import RolePermission from '../models/RolePermission.js';

export async function seedRolesAndPermissions() {
  try {
    console.log('Seeding roles and permissions...');

    // Create default roles
    await Role.bulkCreate([
      {
        name: 'admin',
        description: 'Full system access with all permissions'
      },
      {
        name: 'employee',
        description: 'Employee with limited access to specific modules'
      },
      {
        name: 'client',
        description: 'Client with basic access to their own data'
      }
    ], { ignoreDuplicates: true });

    // Fetch roles to get their IDs
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const employeeRole = await Role.findOne({ where: { name: 'employee' } });
    const clientRole = await Role.findOne({ where: { name: 'client' } });

    // Create default permissions
    await Permission.bulkCreate([
      // User management
      { name: 'user.create', description: 'Create new users', module: 'users' },
      { name: 'user.read', description: 'View users', module: 'users' },
      { name: 'user.update', description: 'Update user information', module: 'users' },
      { name: 'user.delete', description: 'Delete users', module: 'users' },
      
      // Role management
      { name: 'role.create', description: 'Create new roles', module: 'roles' },
      { name: 'role.read', description: 'View roles', module: 'roles' },
      { name: 'role.update', description: 'Update roles', module: 'roles' },
      { name: 'role.delete', description: 'Delete roles', module: 'roles' },
      { name: 'role.assign', description: 'Assign roles to users', module: 'roles' },
      
      // Permission management
      { name: 'permission.create', description: 'Create new permissions', module: 'permissions' },
      { name: 'permission.read', description: 'View permissions', module: 'permissions' },
      { name: 'permission.update', description: 'Update permissions', module: 'permissions' },
      { name: 'permission.delete', description: 'Delete permissions', module: 'permissions' },
      { name: 'permission.assign', description: 'Assign permissions to roles', module: 'permissions' },
      
      // Employee management
      { name: 'employee.create', description: 'Create employee accounts', module: 'employees' },
      { name: 'employee.read', description: 'View employees', module: 'employees' },
      { name: 'employee.update', description: 'Update employee information', module: 'employees' },
      { name: 'employee.delete', description: 'Delete employees', module: 'employees' },
      
      // Lead management
      { name: 'lead.create', description: 'Create new leads', module: 'leads' },
      { name: 'lead.read', description: 'View leads', module: 'leads' },
      { name: 'lead.update', description: 'Update lead information', module: 'leads' },
      { name: 'lead.delete', description: 'Delete leads', module: 'leads' },
      
      // Dashboard access
      { name: 'dashboard.admin', description: 'Access admin dashboard', module: 'dashboard' },
      { name: 'dashboard.employee', description: 'Access employee dashboard', module: 'dashboard' },
      { name: 'dashboard.client', description: 'Access client dashboard', module: 'dashboard' },
      
      // Reports
      { name: 'report.view', description: 'View reports', module: 'reports' },
      { name: 'report.export', description: 'Export reports', module: 'reports' },
      
      // Settings
      { name: 'settings.view', description: 'View system settings', module: 'settings' },
      { name: 'settings.update', description: 'Update system settings', module: 'settings' }
    ], { ignoreDuplicates: true });

    // Fetch all permissions
    const allPermissions = await Permission.findAll();

    // Assign all permissions to admin
    if (adminRole) {
      await adminRole.setPermissions(allPermissions);
    }

    // Assign limited permissions to employee
    if (employeeRole) {
      const employeePermissions = allPermissions.filter(p => 
        p.name.startsWith('user.read') ||
        p.name.startsWith('employee.') ||
        p.name.startsWith('lead.') ||
        p.name === 'dashboard.employee' ||
        p.name === 'report.view'
      );
      await employeeRole.setPermissions(employeePermissions);
    }

    // Assign basic permissions to client
    if (clientRole) {
      const clientPermissions = allPermissions.filter(p => 
        p.name === 'dashboard.client'
      );
      await clientRole.setPermissions(clientPermissions);
    }

    console.log('Roles and permissions seeded successfully!');
  } catch (error) {
    console.error('Error seeding roles and permissions:', error);
    throw error;
  }
}
