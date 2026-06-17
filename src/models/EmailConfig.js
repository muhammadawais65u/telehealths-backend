import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';  // ✅ Named import use karo

const EmailConfig = sequelize.define('EmailConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  smtpHost: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'smtp.gmail.com'
  },
  smtpPort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 587
  },
  smtpSecure: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  smtpUser: {
    type: DataTypes.STRING,
    allowNull: true
  },
  smtpPassword: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailFrom: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Health Shield <noreply@healthshield.com>'
  },
  adminEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    isEmail: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'email_configs',
  timestamps: true
});

export default EmailConfig;