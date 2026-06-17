import express from 'express';
import {
  getEmailConfig,
  updateEmailConfig,
  testEmailConfig,
  emailConfigValidation
} from '../controllers/emailConfigController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// @route   GET /api/email-config
// @desc    Get email configuration
// @access  Private
router.get('/', protect, getEmailConfig);

// @route   PUT /api/email-config
// @desc    Update email configuration
// @access  Private (Admin)
router.put('/', protect, emailConfigValidation, validate, updateEmailConfig);

// @route   POST /api/email-config/test
// @desc    Test email configuration
// @access  Private (Admin)
router.post('/test', protect, testEmailConfig);

export default router;
