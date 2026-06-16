import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret);
    console.log("=== Auth Middleware Debug ===");
    console.log("Token:", token.substring(0, 15) + "...");
    console.log("Decoded JWT payload:", decoded);
    
    const userId = decoded.id || decoded.userId;
    console.log("Looking up user with ID:", userId);
    
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ]
    });
    if (user) {
      console.log("User found:", user.name, "ID:", user.id, "Role:", user.role?.name);
    } else {
      console.log("User NOT found in database with ID:", userId);
      const allUsers = await User.findAll({ attributes: ['id', 'name', 'email'] });
      console.log("Available user IDs in DB:", allUsers.map(u => u.id));
    }
    console.log("=============================");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (roles.length === 0) {
      return next();
    }

    const userRole = req.user.role?.name;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admins have all permissions
    if (req.user.role?.name === 'admin') {
      return next();
    }

    const permissions = req.user.role?.permissions || [];
    const hasPermission = permissions.some(p => p.name === permissionName);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Permission required: ${permissionName}`
      });
    }

    next();
  };
};
