import { body, validationResult } from 'express-validator';
import { DiscoveryCall } from '../models/index.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  notFoundResponse
} from '../utils/responseHandler.js';
import { sendEmail } from '../utils/email.js';

export const discoveryCallValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('phone').notEmpty().withMessage('Phone number is required')
];

// @desc    Get all discovery calls with pagination
// @route   GET /api/discovery-calls
// @access  Private
export const getAllDiscoveryCalls = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: calls } = await DiscoveryCall.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return paginatedResponse(res, calls, {
      page,
      limit,
      total: count
    }, 'Discovery calls retrieved successfully');
  } catch (error) {
    console.error('Get all discovery calls error:', error);
    return errorResponse(res, error.message || 'Error retrieving discovery calls', 500);
  }
};

// @desc    Get single discovery call by ID
// @route   GET /api/discovery-calls/:id
// @access  Private
export const getDiscoveryCallById = async (req, res) => {
  try {
    const { id } = req.params;
    const call = await DiscoveryCall.findByPk(id);

    if (!call) {
      return notFoundResponse(res, 'Discovery call not found');
    }

    return successResponse(res, call, 'Discovery call retrieved successfully');
  } catch (error) {
    console.error('Get discovery call by ID error:', error);
    return errorResponse(res, error.message || 'Error retrieving discovery call', 500);
  }
};

// @desc    Create new discovery call
// @route   POST /api/discovery-calls
// @access  Public
export const createDiscoveryCall = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { name, email, phone, message } = req.body;

    const call = await DiscoveryCall.create({
      name,
      email,
      phone,
      message: message || null
    });

    // Send email to user (non-blocking)
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Thank you for your interest in Health Shield</h2>
        <p>Hi ${name},</p>
        <p>Thank you for booking a discovery call with us. We have received your information and our care team will reach out to you shortly.</p>
        <p><strong>Your Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          ${message ? `<li><strong>Message:</strong> ${message}</li>` : ''}
        </ul>
        <p>One of our care advisors will contact you within 24-48 hours to schedule your free 15-minute discovery call.</p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>The Health Shield Team</p>
      </div>
    `;

    sendEmail({
      to: email,
      subject: 'Your Discovery Call Request - Health Shield',
      html: userEmailHtml
    }).catch(emailError => {
      console.error('Error sending user email:', emailError);
    });

    // Send email to admin (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ccnhealth.com';
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">New Discovery Call Request</h2>
        <p>A new discovery call has been requested on the website.</p>
        <p><strong>User Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          ${message ? `<li><strong>Message:</strong> ${message}</li>` : ''}
          <li><strong>Submitted At:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Please reach out to the user to schedule their discovery call.</p>
      </div>
    `;

    sendEmail({
      to: adminEmail,
      subject: `New Discovery Call Request - ${name}`,
      html: adminEmailHtml
    }).catch(emailError => {
      console.error('Error sending admin email:', emailError);
    });

    return createdResponse(res, call, 'Discovery call booked successfully');
  } catch (error) {
    console.error('Create discovery call error:', error);
    return errorResponse(res, error.message || 'Error booking discovery call', 500);
  }
};

// @desc    Delete discovery call
// @route   DELETE /api/discovery-calls/:id
// @access  Private
export const deleteDiscoveryCall = async (req, res) => {
  try {
    const { id } = req.params;
    const call = await DiscoveryCall.findByPk(id);

    if (!call) {
      return notFoundResponse(res, 'Discovery call not found');
    }

    await call.destroy();
    return successResponse(res, null, 'Discovery call deleted successfully');
  } catch (error) {
    console.error('Delete discovery call error:', error);
    return errorResponse(res, error.message || 'Error deleting discovery call', 500);
  }
};
