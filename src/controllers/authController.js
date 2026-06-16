import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import { successResponse, createdResponse, errorResponse } from '../utils/responseHandler.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { name, email, phone, password, roleId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with roleId (default to client role id 3 if not provided)
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      roleId: roleId || 3
    });

    // Fetch user with role
    const userWithRole = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    // Generate token
    const token = generateToken(user.id);

    return createdResponse(res, {
      user: userWithRole,
      token
    }, 'User registered successfully');
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse(res, error.message || 'Error registering user', 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { email, password } = req.body;

    // Check if user exists with role and permissions
    const user = await User.findOne({ 
      where: { email },
      include: [
        { 
          model: Role, 
          as: 'role',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ]
    });
    
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Extract permissions array
    const permissions = userResponse.role?.permissions?.map(p => p.name) || [];

    return successResponse(res, {
      user: userResponse,
      permissions,
      token
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, error.message || 'Error logging in', 500);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { 
          model: Role, 
          as: 'role',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ]
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const userResponse = user.toJSON();
    const permissions = userResponse.role?.permissions?.map(p => p.name) || [];

    return successResponse(res, {
      user: userResponse,
      permissions
    }, 'User retrieved successfully');
  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse(res, error.message || 'Error retrieving user', 500);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled on the client side
    // by removing the token. This endpoint is for consistency.
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, error.message || 'Error logging out', 500);
  }
};

// Validation rules
export const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]*$/).withMessage('Please provide a valid phone number'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

export const getAdminUsers = async (req, res) => {
  try {
    const admins = await User.findAll({
      include: [
        {
          model: Role,
          as: 'role',
          where: { name: 'admin' },
          attributes: []
        }
      ],
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });
    return successResponse(res, admins, 'Admin users retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error retrieving admin users', 500);
  }
};
