import express from 'express';
import {
  getAppPasswords,
  createAppPassword,
  deleteAppPassword,
  toggleAppPassword,
  appPasswordValidation
} from '../controllers/appPasswordController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// @route   GET /api/app-passwords
// @desc    Get all app passwords for user
// @access  Private
router.get('/', protect, getAppPasswords);

// @route   POST /api/app-passwords
// @desc    Create new app password
// @access  Private
router.post('/', protect, appPasswordValidation, validate, createAppPassword);

// @route   DELETE /api/app-passwords/:id
// @desc    Delete app password
// @access  Private
router.delete('/:id', protect, deleteAppPassword);

// @route   PUT /api/app-passwords/:id/toggle
// @desc    Toggle app password status
// @access  Private
router.put('/:id/toggle', protect, toggleAppPassword);

export default router;
