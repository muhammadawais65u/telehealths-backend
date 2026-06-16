import { body, validationResult } from 'express-validator';
import Lead from '../models/Lead.js';
import { successResponse, createdResponse, errorResponse, paginatedResponse, notFoundResponse } from '../utils/responseHandler.js';
import { sendEmail } from '../utils/email.js';

export const leadValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('source').optional().isIn(['landing_page', 'contact_us', 'funnel', 'eligibility']).withMessage('Invalid source'),
];

export const getAllLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;
    const where = req.query.source ? { source: req.query.source } : {};

    const { count, rows: leads } = await Lead.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return paginatedResponse(res, leads, { page, limit, total: count }, 'Leads retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error retrieving leads', 500);
  }
};

export const createLead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, errors.array());

    const { name, email, phone, company, message, source, state, insuranceCarrier } = req.body;

    const lead = await Lead.create({
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      message: message || null,
      source: source || 'landing_page',
      state: state || null,
      insuranceCarrier: insuranceCarrier || null
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    let sourceLabel = 'Landing Page';
    if (source === 'contact_us') {
      sourceLabel = 'Contact Us';
    } else if (source === 'funnel') {
      sourceLabel = 'Funnel (Discovery Call)';
    } else if (source === 'eligibility') {
      sourceLabel = 'Eligibility Check';
    }

    const userHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:28px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Health Shield</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Better health at home, every day.</p>
        </div>
        <div style="padding:28px 24px;background:#fff;">
          <h2 style="color:#1e293b;margin:0 0 12px;font-size:18px;">Thank you, ${name}!</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;">We received your information. A care advisor will reach out within 24 hours.</p>
          <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:4px 0;font-size:13px;color:#64748b;">Name: <strong style="color:#1e293b;">${name}</strong></p>
            ${email ? `<p style="margin:4px 0;font-size:13px;color:#64748b;">Email: <strong style="color:#1e293b;">${email}</strong></p>` : ''}
            ${phone ? `<p style="margin:4px 0;font-size:13px;color:#64748b;">Phone: <strong style="color:#1e293b;">${phone}</strong></p>` : ''}
            ${state ? `<p style="margin:4px 0;font-size:13px;color:#64748b;">State: <strong style="color:#1e293b;">${state}</strong></p>` : ''}
            ${insuranceCarrier ? `<p style="margin:4px 0;font-size:13px;color:#64748b;">Insurance: <strong style="color:#1e293b;">${insuranceCarrier}</strong></p>` : ''}
            ${company ? `<p style="margin:4px 0;font-size:13px;color:#64748b;">Company: <strong style="color:#1e293b;">${company}</strong></p>` : ''}
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
          <h1 style="color:#fff;margin:0;font-size:18px;">New Lead — ${sourceLabel}</h1>
        </div>
        <div style="padding:24px;background:#fff;">
          <p style="margin:6px 0;font-size:14px;color:#334155;">Name: <strong>${name}</strong></p>
          ${email ? `<p style="margin:6px 0;font-size:14px;color:#334155;">Email: <strong style="color:#2563eb;">${email}</strong></p>` : ''}
          ${phone ? `<p style="margin:6px 0;font-size:14px;color:#334155;">Phone: <strong>${phone}</strong></p>` : ''}
          ${state ? `<p style="margin:6px 0;font-size:14px;color:#334155;">State: <strong>${state}</strong></p>` : ''}
          ${insuranceCarrier ? `<p style="margin:6px 0;font-size:14px;color:#334155;">Insurance Carrier: <strong>${insuranceCarrier}</strong></p>` : ''}
          ${company ? `<p style="margin:6px 0;font-size:14px;color:#334155;">Company: <strong>${company}</strong></p>` : ''}
          <p style="margin:6px 0;font-size:14px;color:#334155;">Source: <strong>${sourceLabel}</strong></p>
          <p style="margin:6px 0;font-size:14px;color:#334155;">Submitted: ${new Date().toLocaleString()}</p>
          ${message ? `<p style="margin:6px 0;font-size:14px;color:#334155;">Message: ${message}</p>` : ''}
        </div>
      </div>`;

    if (email) {
      sendEmail({ to: email, subject: 'Thank you for contacting Health Shield 🩺', html: userHtml })
        .catch(err => console.error('❌ User email failed:', err.message));
    }

    sendEmail({ to: adminEmail, subject: `New ${sourceLabel} Lead: ${name} — Health Shield`, html: adminHtml })
      .catch(err => console.error('❌ Admin email failed:', err.message));

    return createdResponse(res, lead, 'Lead submitted successfully');
  } catch (error) {
    console.error('Create lead error:', error);
    return errorResponse(res, error.message || 'Error submitting lead', 500);
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return notFoundResponse(res, 'Lead not found');

    const { leadStatus, contactOwner, primaryContact } = req.body;

    await lead.update({
      leadStatus: leadStatus !== undefined ? leadStatus : lead.leadStatus,
      contactOwner: contactOwner !== undefined ? contactOwner : lead.contactOwner,
      primaryContact: primaryContact !== undefined ? primaryContact : lead.primaryContact
    });

    return successResponse(res, lead, 'Lead updated successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error updating lead', 500);
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return notFoundResponse(res, 'Lead not found');
    await lead.destroy();
    return successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Error deleting lead', 500);
  }
};
