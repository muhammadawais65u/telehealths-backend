import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(25),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  insuranceCarrier: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'insurance_carrier'
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  source: {
    type: DataTypes.ENUM('landing_page', 'contact_us', 'funnel', 'eligibility'),
    allowNull: false,
    defaultValue: 'landing_page'
  },
  leadStatus: {
    type: DataTypes.ENUM('new', 'contacted', 'qualified', 'closed'),
    allowNull: false,
    defaultValue: 'new',
    field: 'lead_status'
  },
  contactOwner: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'contact_owner'
  },
  primaryContact: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'primary_contact'
  }
}, {
  tableName: 'leads',
  timestamps: true
});

export default Lead;
