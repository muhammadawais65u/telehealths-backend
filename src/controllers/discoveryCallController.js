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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #334155;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Health Shield</h1>
          <p style="color: #bfdbfe; margin: 4px 0 0 0; font-size: 14px;">Better health at home, every day.</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Thank you, ${name}!</h2>
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; color: #475569;">
            We have successfully received your request for a free discovery call. Our clinical care team is reviewing your details, and a dedicated care advisor will reach out to you within 24 hours.
          </p>
          
          <!-- Details Card -->
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Request Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 120px; font-weight: 500;">Full Name:</td>
                <td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Email Address:</td>
                <td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Phone Number:</td>
                <td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${phone}</td>
              </tr>
              ${message ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Your Message:</td>
                <td style="padding: 6px 0; color: #475569; font-style: italic;">"${message}"</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- Benefits Box -->
          <div style="border-left: 4px solid #10b981; padding-left: 16px; margin: 0 0 24px 0;">
            <p style="font-size: 14px; font-weight: 600; color: #065f46; margin: 0 0 4px 0;">What happens next?</p>
            <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.5;">
              We will call or text you at <strong>${phone}</strong> to pick a time that works best for your schedule. No phone trees, no waiting rooms — just helpful, personalized support.
            </p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #475569;">
            If you have any questions in the meantime, feel free to reply directly to this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 8px 0;">This is an automated confirmation of your booking request.</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Health Shield. All rights reserved.</p>
        </div>
      </div>
    `;

    const resendTestEmail = process.env.RESEND_TEST_EMAIL || process.env.ADMIN_EMAIL;
    try {
      console.log('📤 Attempting to send user email to:', resendTestEmail);
      await sendEmail({
        to: resendTestEmail,
        subject: `[For: ${email}] Your Discovery Call is Confirmed! 🩺 Health Shield`,
        html: userEmailHtml
      });
      console.log('✅ User email sent successfully');
    } catch (emailError) {
      console.error('❌ User email failed:', emailError.message, emailError.code);
    }

    // Send email to admin (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ccnhealth.com';
    const adminEmailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #334155;">
        <!-- Header -->
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">🚨 New Discovery Lead</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Health Shield Administration</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <p style="font-size: 15px; margin: 0 0 20px 0; color: #334155;">
            A new discovery call has been successfully submitted from the funnel. Here are the prospect's details:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 500; width: 130px;">Name:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Email:</td>
              <td style="padding: 10px 0; color: #2563eb; font-weight: 600;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Phone:</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Submitted At:</td>
              <td style="padding: 10px 0; color: #475569;">${new Date().toLocaleString()}</td>
            </tr>
            ${message ? `
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-weight: 500; vertical-align: top;">Message:</td>
              <td style="padding: 10px 0; color: #334155; line-height: 1.5; background-color: #f8fafc; border-radius: 8px; padding: 12px; margin-top: 6px; display: block;">${message}</td>
            </tr>` : ''}
          </table>

          <div style="text-align: center; margin-top: 32px;">
            <a href="tel:${phone}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
              Call Prospect Now
            </a>
          </div>
        </div>
      </div>
    `;

    try {
      console.log('📤 Attempting to send admin email to:', adminEmail);
      await sendEmail({
        to: adminEmail,
        subject: `New Lead: ${name} - Health Shield`,
        html: adminEmailHtml
      });
      console.log('✅ Admin email sent successfully');
    } catch (emailError) {
      console.error('❌ Admin email failed:', emailError.message, emailError.code);
    }

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
