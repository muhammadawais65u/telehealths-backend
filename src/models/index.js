import User from './User.js';
import Blog from './Blog.js';
import Service from './Service.js';
import Partnership from './Partnership.js';
import BlogCategory from './BlogCategory.js';
import Lead from './Lead.js';
import Role from './Role.js';
import Permission from './Permission.js';
import RolePermission from './RolePermission.js';
import Device from './Device.js';
import EmailConfig from './EmailConfig.js';
import AppPassword from './AppPassword.js';

// Define associations
User.hasMany(Blog, {
  foreignKey: 'userId',
  as: 'blogs',
  onDelete: 'CASCADE'
});

Blog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

User.hasMany(Service, {
  foreignKey: 'userId',
  as: 'services',
  onDelete: 'CASCADE'
});

Service.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

User.hasMany(Device, {
  foreignKey: 'userId',
  as: 'devices',
  onDelete: 'CASCADE'
});

Device.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

BlogCategory.hasMany(Blog, {
  foreignKey: 'categoryId',
  as: 'blogs',
  onDelete: 'SET NULL'
});

Blog.belongsTo(BlogCategory, {
  foreignKey: 'categoryId',
  as: 'category'
});

// Role associations
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  as: 'roles'
});

export { User, Blog, Service, Partnership, BlogCategory, Lead, Role, Permission, RolePermission, Device, EmailConfig, AppPassword };
