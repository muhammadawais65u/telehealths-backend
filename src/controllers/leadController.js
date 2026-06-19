import { body, validationResult } from 'express-validator';
import Lead from '../models/Lead.js';
import { successResponse, createdResponse, errorResponse, paginatedResponse, notFoundResponse } from '../utils/responseHandler.js';
import { sendEmail, getAdminEmail } from '../utils/email.js';

export const leadValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('source').optional().isIn(['landing_page', 'contact_us', 'funnel', 'eligibility', 'device']).withMessage('Invalid source'),
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

    const { name, email, phone, company, message, source, state, insuranceCarrier, deviceName } = req.body;

    const lead = await Lead.create({
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      message: message || null,
      source: source || 'landing_page',
      state: state || null,
      insuranceCarrier: insuranceCarrier || null,
      deviceName: deviceName || null
    });

    // Get admin email from database config, not from .env
    let adminEmail;
    try {
      adminEmail = await getAdminEmail();
    } catch (err) {
      console.error('❌ Could not get admin email from config:', err.message);
      return errorResponse(res, 'Email configuration not set up. Please configure email in admin panel.', 500);
    }

    let sourceLabel = 'Landing Page';
    if (source === 'contact_us') {
      sourceLabel = 'Contact Us';
    } else if (source === 'funnel') {
      sourceLabel = 'Funnel (Discovery Call)';
    } else if (source === 'eligibility') {
      sourceLabel = 'Eligibility Check';
    } else if (source === 'device') {
      sourceLabel = 'Device Inquiry';
    }

    const userHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#f8fafc;padding:28px 24px;text-align:center;">
          <img src="http://gethealthshield.com/_next/static/media/logo.03q05efrl.zpx.png" alt="Health Shield Logo" style="max-width:200px;height:auto;margin:0 auto;display:block;" />
        </div>
        <div style="padding:28px 24px;background:#fff;">
          <h2 style="color:#1e293b;margin:0 0 12px;font-size:18px;">Hello ${name},</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;">Thank you for your interest in Health Shield.</p>
          <p style="color:#475569;font-size:14px;line-height:1.6;">We're honored that you're considering us as part of your healthcare journey.</p>
          <p style="color:#475569;font-size:14px;line-height:1.6;">At Health Shield, we help Medicare beneficiaries stay healthier, safer, and more independent at home through personalized care coordination, remote monitoring, and ongoing support between doctor visits.</p>
          
          <h3 style="color:#1e293b;margin:20px 0 12px;font-size:16px;">What Happens Next?</h3>
          <p style="color:#475569;font-size:14px;line-height:1.6;">A Health Shield Enrollment Specialist will contact you shortly to:</p>
          <ul style="color:#475569;font-size:14px;line-height:1.6;padding-left:20px;">
            <li>Verify your eligibility and insurance coverage</li>
            <li>Answer any questions you may have</li>
            <li>Explain how our programs work</li>
            <li>Review potential Medicare coverage and costs</li>
            <li>Schedule your initial consultation, if appropriate</li>
          </ul>
          <p style="color:#475569;font-size:14px;line-height:1.6;">Please keep an eye out for a phone call from our team over the next 1–2 business days.</p>
          
          <h3 style="color:#1e293b;margin:20px 0 12px;font-size:16px;">How Health Shield Can Help</h3>
          <p style="color:#475569;font-size:14px;line-height:1.6;">Our care team works alongside your existing healthcare providers to help:</p>
        <ul style="color:#475569;font-size:14px;line-height:1.6;padding-left:20px;list-style:none;">
    <li style="margin-bottom:6px;">✓ Monitor chronic conditions</li>
    <li style="margin-bottom:6px;">✓ Coordinate appointments and care plans</li>
    <li style="margin-bottom:6px;">✓ Identify problems before they become emergencies</li>
    <li style="margin-bottom:6px;">✓ Support medication adherence</li>
    <li style="margin-bottom:6px;">✓ Reduce avoidable hospitalizations and ER visits</li>
    <li style="margin-bottom:6px;">✓ Provide peace of mind through regular check-ins</li>
</ul>
          <p style="color:#475569;font-size:14px;line-height:1.6;">Most importantly, you keep your current doctors. We simply provide additional support between visits.</p>
          
       
          
          <p style="color:#475569;font-size:14px;line-height:1.6;">If you have any immediate questions, simply reply to this email or call us at our support number.</p>
          <p style="color:#475569;font-size:14px;line-height:1.6;">We look forward to speaking with you soon.</p>
          
          <p style="color:#475569;font-size:14px;line-height:1.6;">Warm regards,</p>
          <p style="color:#1e293b;font-size:14px;font-weight:bold;">The Health Shield Team</p>
          <p style="color:#475569;font-size:13px;margin-top:20px;">Continuous Care. Better Outcomes. Greater Peace of Mind.</p>
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
          ${deviceName ? `<p style="margin:6px 0;font-size:14px;color:#334155;">Device: <strong>${deviceName}</strong></p>` : ''}
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

export const sendEmailToLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, recipientEmail, ccEmail } = req.body;

    if (!subject || !message) {
      return errorResponse(res, 'Subject and message are required', 400);
    }

    const lead = await Lead.findByPk(id);
    if (!lead) return notFoundResponse(res, 'Lead not found');

    const emailTo = recipientEmail || lead.email;
    if (!emailTo) {
      return errorResponse(res, 'Lead does not have a valid email address', 400);
    }

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:28px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Health Shield</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Better health at home, every day.</p>
        </div>
        <div style="padding:28px 24px;background:#fff;">
          <p style="color:#475569;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
        </div>
        <div style="background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;">
          &copy; ${new Date().getFullYear()} Health Shield. All rights reserved.
        </div>
      </div>`;

    const mailOptions = {
      to: emailTo,
      subject: subject,
      html: emailHtml
    };

    // Add CC if provided
    if (ccEmail) {
      mailOptions.cc = ccEmail;
    }

    await sendEmail(mailOptions);

    return successResponse(res, { leadId: id, sentTo: emailTo, ccEmail: ccEmail || null }, 'Email sent successfully');
  } catch (error) {
    console.error('Send email error:', error);
    return errorResponse(res, error.message || 'Error sending email', 500);
  }
};
