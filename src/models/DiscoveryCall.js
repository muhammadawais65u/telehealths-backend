import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const DiscoveryCall = sequelize.define('DiscoveryCall', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Name is required'
      },
      len: {
        args: [1, 100],
        msg: 'Name must be between 1 and 100 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Email is required'
      },
      isEmail: {
        msg: 'Please provide a valid email address'
      }
    }
  },
  phone: {
    type: DataTypes.STRING(25),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Phone number is required'
      },
      len: {
        args: [1, 25],
        msg: 'Phone number must be between 1 and 25 characters'
      }
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'discovery_calls',
  timestamps: true
});

export default DiscoveryCall;
