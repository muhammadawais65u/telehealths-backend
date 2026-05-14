import User from './User.js';
import Blog from './Blog.js';
import Service from './Service.js';
import BlogCategory from './BlogCategory.js';

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

BlogCategory.hasMany(Blog, {
  foreignKey: 'categoryId',
  as: 'blogs',
  onDelete: 'SET NULL'
});

Blog.belongsTo(BlogCategory, {
  foreignKey: 'categoryId',
  as: 'category'
});

export { User, Blog, Service, BlogCategory };
