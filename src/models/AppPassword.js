import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';  // ✅ Named import

const AppPassword = sequelize.define('AppPassword', {  // ✅ sequelize use karo
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name/description of the app password'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Hashed app password'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'app_passwords',
  timestamps: true
});

export default AppPassword;