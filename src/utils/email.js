import nodemailer from "nodemailer";
import EmailConfig from '../models/EmailConfig.js';

// Create transporter dynamically from database config (database first, env fallback for initial setup)
const getTransporter = async () => {
  try {
    // Always fetch from database first
    let config = await EmailConfig.findOne();

    // If no config in database, try to create from .env for initial setup
    if (!config) {
      const envConfig = {
        smtpHost: process.env.EMAIL_HOST,
        smtpPort: process.env.EMAIL_PORT,
        smtpSecure: process.env.EMAIL_SECURE === 'true' ? true : false,
        smtpUser: process.env.EMAIL_USER,
        smtpPassword: process.env.EMAIL_PASS,
        emailFrom: process.env.EMAIL_FROM,
        adminEmail: process.env.ADMIN_EMAIL
      };

      // Only create if all required fields are present in .env
      if (envConfig.smtpHost && envConfig.smtpUser && envConfig.smtpPassword) {
        config = await EmailConfig.create(envConfig);
        console.log('📧 Email config created from .env variables');
      } else {
        throw new Error('No SMTP configuration found. Please configure email settings in admin panel.');
      }
    }

    console.log(`📧 Using SMTP: ${config.smtpHost}:${config.smtpPort} (from database)`);

    // Port 465 uses SSL (secure: true), port 587 uses STARTTLS (secure: false)
    const port = parseInt(config.smtpPort);
    const isSecure = port === 465;

    return nodemailer.createTransport({
      host: config.smtpHost,
      port: port,
      secure: isSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
      connectionTimeout: 60000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  } catch (error) {
    console.error('❌ Error getting email transporter:', error.message);
    throw error;
  }
};

// Get email from database config (not from .env)
const getEmailFrom = async () => {
  try {
    const config = await EmailConfig.findOne();
    if (!config || !config.emailFrom) {
      throw new Error('Email configuration not found. Please configure email settings in admin panel.');
    }
    return config.emailFrom;
  } catch (error) {
    console.error('❌ Error getting email from:', error.message);
    throw error;
  }
};

// Get admin email from database config
const getAdminEmail = async () => {
  try {
    const config = await EmailConfig.findOne();
    if (!config || !config.adminEmail) {
      throw new Error('Admin email not configured. Please configure email settings in admin panel.');
    }
    return config.adminEmail;
  } catch (error) {
    console.error('❌ Error getting admin email:', error.message);
    throw error;
  }
};

export const sendEmail = async ({ to, subject, html, cc }) => {
  try {
    const transporter = await getTransporter();
    const from = await getEmailFrom();

    const mailOptions = {
      from,
      to,
      subject,
      html,
    };

    // Add CC if provided
    if (cc) {
      mailOptions.cc = cc;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    throw error;
  }
};

export { getAdminEmail };
