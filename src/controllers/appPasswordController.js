import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import AppPassword from '../models/AppPassword.js';
import { successResponse, createdResponse, errorResponse } from '../utils/responseHandler.js';

export const appPasswordValidation = [
  body('name').notEmpty().withMessage('App password name is required'),
];

// @desc    Get all app passwords for user
// @route   GET /api/app-passwords
// @access  Private
export const getAppPasswords = async (req, res) => {
  try {
    const userId = req.user.id;

    const passwords = await AppPassword.findAll({
      where: { userId },
      attributes: ['id', 'name', 'isActive', 'lastUsed', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, passwords, 'App passwords retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error retrieving app passwords', 500);
  }
};

// @desc    Create new app password
// @route   POST /api/app-passwords
// @access  Private
export const createAppPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const userId = req.user.id;
    const { name } = req.body;

    // Generate random app password
    const generatedPassword = Math.random().toString(36).slice(-16).toUpperCase();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    const appPassword = await AppPassword.create({
      userId,
      name,
      password: hashedPassword,
      isActive: true
    });

    // Return only the newly created password once (won't be retrievable again)
    return createdResponse(res, {
      id: appPassword.id,
      name: appPassword.name,
      password: generatedPassword,
      isActive: appPassword.isActive,
      createdAt: appPassword.createdAt,
      message: 'Save this password now. You won\'t be able to see it again!'
    }, 'App password created successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error creating app password', 500);
  }
};

// @desc    Delete app password
// @route   DELETE /api/app-passwords/:id
// @access  Private
export const deleteAppPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appPassword = await AppPassword.findOne({
      where: { id, userId }
    });

    if (!appPassword) {
      return errorResponse(res, 'App password not found', 404);
    }

    await appPassword.destroy();

    return successResponse(res, {}, 'App password deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error deleting app password', 500);
  }
};

// @desc    Toggle app password status
// @route   PUT /api/app-passwords/:id/toggle
// @access  Private
export const toggleAppPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appPassword = await AppPassword.findOne({
      where: { id, userId }
    });

    if (!appPassword) {
      return errorResponse(res, 'App password not found', 404);
    }

    await appPassword.update({
      isActive: !appPassword.isActive
    });

    return successResponse(res, appPassword, 'App password status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error updating app password', 500);
  }
};
