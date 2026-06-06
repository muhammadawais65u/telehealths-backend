import { body, validationResult } from 'express-validator';
import { DiscoveryCall } from '../models/index.js';
import { successResponse, createdResponse, errorResponse, paginatedResponse, notFoundResponse } from '../utils/responseHandler.js';
import { sendEmail } from '../utils/email.js';

export const discoveryCallValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
];

export const getAllDiscoveryCalls = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { count, rows: calls } = await DiscoveryCall.findAndCountAll({ limit, offset, order: [['createdAt', 'DESC']] });
    return paginatedResponse(res, calls, { page, limit, total: count }, 'Discovery calls retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error retrieving discovery calls', 500);
  }
};

export const getDiscoveryCallById = async (req, res) => {
  try {
    const call = await DiscoveryCall.findByPk(req.params.id);
    if (!call) return notFoundResponse(res, 'Discovery call not found');
    return successResponse(res, call, 'Discovery call retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error retrieving discovery call', 500);
  }
};

export const createDiscoveryCall = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());

    const { name, email, phone, message } = req.body;

    const call = await DiscoveryCall.create({ name, email, phone, message: message || null });

    const adminEmail = process.env.ADMIN_EMAIL;

    const userHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:28px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Health Shield</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Better health at home, every day.</p>
        </div>
        <div style="padding:28px 24px;background:#fff;">
          <h2 style="color:#1e293b;margin:0 0 12px;font-size:18px;">Thank you, ${name}!</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;">We received your discovery call request. A care advisor will reach out within 24 hours.</p>
          <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:4px 0;font-size:13px;color:#64748b;">Name: <strong style="color:#1e293b;">${name}</strong></p>
            <p style="margin:4px 0;font-size:13px;color:#64748b;">Email: <strong style="color:#1e293b;">${email}</strong></p>
            <p style="margin:4px 0;font-size:13px;color:#64748b;">Phone: <strong style="color:#1e293b;">${phone}</strong></p>
            ${message ? `<p style="margin:4px 0;font-size:13px;color:#64748b;">Message: <em style="color:#475569;">${message}</em></p>` : ''}
          </div>
        </div>
        <div style="background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;">
          &copy; ${new Date().getFullYear()} Health Shield. All rights reserved.
        </div>
      </div>`;

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#0f172a;padding:20px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:18px;">New Discovery Call Lead</h1>
        </div>
        <div style="padding:24px;background:#fff;">
          <p style="margin:6px 0;font-size:14px;color:#334155;">Name: <strong>${name}</strong></p>
          <p style="margin:6px 0;font-size:14px;color:#334155;">Email: <strong style="color:#2563eb;">${email}</strong></p>
          <p style="margin:6px 0;font-size:14px;color:#334155;">Phone: <strong>${phone}</strong></p>
          <p style="margin:6px 0;font-size:14px;color:#334155;">Submitted: ${new Date().toLocaleString()}</p>
          ${message ? `<p style="margin:6px 0;font-size:14px;color:#334155;">Message: ${message}</p>` : ''}
        </div>
      </div>`;

    sendEmail({ to: adminEmail, subject: `New Lead: ${name} - Health Shield`, html: adminHtml })
      .catch(err => console.error('❌ Admin email failed:', err.message));

    sendEmail({ to: adminEmail, subject: `[User Confirmation for: ${email}] Discovery Call Booked`, html: userHtml })
      .catch(err => console.error('❌ User email failed:', err.message));

    return createdResponse(res, call, 'Discovery call booked successfully');
  } catch (error) {
    console.error('Create discovery call error:', error);
    return errorResponse(res, error.message || 'Error booking discovery call', 500);
  }
};

export const deleteDiscoveryCall = async (req, res) => {
  try {
    const call = await DiscoveryCall.findByPk(req.params.id);
    if (!call) return notFoundResponse(res, 'Discovery call not found');
    await call.destroy();
    return successResponse(res, null, 'Discovery call deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error deleting discovery call', 500);
  }
};
