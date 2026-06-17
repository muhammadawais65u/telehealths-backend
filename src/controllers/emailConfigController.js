import { body, validationResult } from 'express-validator';
import EmailConfig from '../models/EmailConfig.js';
import { successResponse, createdResponse, errorResponse, notFoundResponse } from '../utils/responseHandler.js';
import nodemailer from 'nodemailer';

export const emailConfigValidation = [
  body('smtpHost').notEmpty().withMessage('SMTP Host is required'),
  body('smtpPort').isInt().withMessage('SMTP Port must be a number'),
  body('smtpUser').notEmpty().withMessage('SMTP User is required'),
  body('smtpPassword').notEmpty().withMessage('SMTP Password is required'),
  body('emailFrom').notEmpty().withMessage('Email From is required'),
  body('adminEmail').isEmail().withMessage('Valid Admin Email is required'),
];

// @desc    Get email configuration
// @route   GET /api/email-config
// @access  Private
export const getEmailConfig = async (req, res) => {
  try {
    let config = await EmailConfig.findOne();
    
    if (!config) {
      config = await EmailConfig.create({
        smtpHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
        smtpPort: process.env.EMAIL_PORT || 587,
        smtpSecure: process.env.EMAIL_SECURE === 'true' ? true : false,
        smtpUser: process.env.EMAIL_USER || '',
        smtpPassword: process.env.EMAIL_PASS || '',
        emailFrom: process.env.EMAIL_FROM || 'Health Shield <noreply@healthshield.com>',
        adminEmail: process.env.ADMIN_EMAIL || ''
      });
    }

    return successResponse(res, config, 'Email configuration retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error retrieving email configuration', 500);
  }
};

// @desc    Update email configuration
// @route   PUT /api/email-config
// @access  Private (Admin only)
export const updateEmailConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword, emailFrom, adminEmail } = req.body;

    let config = await EmailConfig.findOne();

    if (!config) {
      config = await EmailConfig.create({
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword: smtpPassword ? smtpPassword.trim() : '',
        emailFrom,
        adminEmail
      });
    } else {
      // Only keep old password if the new password is explicitly empty string
      const updateData = {
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        emailFrom,
        adminEmail
      };
      
      // Only update password if it's provided (not undefined or empty)
      if (smtpPassword !== undefined && smtpPassword !== '') {
        updateData.smtpPassword = smtpPassword.trim();
      }
      
      await config.update(updateData);
    }

    return successResponse(res, config, 'Email configuration updated successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error updating email configuration', 500);
  }
};

// @desc    Test email configuration
// @route   POST /api/email-config/test
// @access  Private (Admin only)
export const testEmailConfig = async (req, res) => {
  try {
    console.log('Test email request body:', req.body);
    const { testEmail } = req.body;

    if (!testEmail || !testEmail.trim()) {
      console.log('Validation failed: testEmail is empty');
      return errorResponse(res, 'Test email is required', 400);
    }

    const recipient = testEmail.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      console.log('Validation failed: invalid email format ->', recipient);
      return errorResponse(res, 'Please enter a valid email address', 400);
    }

    let config = await EmailConfig.findOne();

    // If no config exists, create one from environment variables
    if (!config) {
      console.log('No email config found, creating from environment variables');
      config = await EmailConfig.create({
        smtpHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
        smtpPort: parseInt(process.env.EMAIL_PORT) || 587,
        smtpSecure: process.env.EMAIL_SECURE === 'true' ? true : false,
        smtpUser: process.env.EMAIL_USER || '',
        smtpPassword: process.env.EMAIL_PASS || '',
        emailFrom: process.env.EMAIL_FROM || 'Health Shield <noreply@healthshield.com>',
        adminEmail: process.env.ADMIN_EMAIL || ''
      });
    }

    if (!config.smtpUser || !config.smtpPassword) {
      console.log('Validation failed: missing SMTP credentials. User:', config.smtpUser, 'Has password:', !!config.smtpPassword);
      return errorResponse(res, 'Email configuration is not set up properly. Please configure SMTP credentials.', 400);
    }

    console.log('Sending test email to:', recipient, 'via', config.smtpHost, config.smtpPort);

    // Port 465 uses SSL (secure: true), port 587 uses STARTTLS (secure: false)
    const port = parseInt(config.smtpPort);
    const isSecure = port === 465;

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: port,
      secure: isSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
      },
      connectionTimeout: 60000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // Verify connection first
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    await transporter.sendMail({
      from: config.emailFrom,
      to: recipient,
      subject: 'Email Configuration Test - Health Shield',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify your SMTP configuration is working correctly.</p>
          <p>If you received this email, your email configuration is properly set up!</p>
          <br/>
          <p>Best regards,<br/>Health Shield Admin System</p>
        </div>
      `
    });

    console.log('Test email sent successfully to:', testEmail);
    return successResponse(res, { success: true }, 'Test email sent successfully');
  } catch (error) {
    console.error('Error sending test email:', error);
    return errorResponse(res, error.message || 'Error sending test email', 500);
  }
};
