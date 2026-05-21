import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Title is required'
      },
      len: {
        args: [3, 255],
        msg: 'Title must be between 3 and 255 characters'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Slug is required'
      }
    }
  },
  metaTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_description'
  },
  keywords: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'short_description'
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Content is required'
      }
    }
  },
  // Service-specific fields
  badge: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  heroDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'hero_description'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: true
  },
  overviewTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'overview_title'
  },
  overview: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  overviewFeatures: {
    type: DataTypes.JSON,
    allowNull: true
  },
  eligibility: {
    type: DataTypes.JSON,
    allowNull: true
  },
  process: {
    type: DataTypes.JSON,
    allowNull: true
  },
  platform: {
    type: DataTypes.JSON,
    allowNull: true
  },
  keyStats: {
    type: DataTypes.JSON,
    allowNull: true
  },
  billingCodes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  whyCCN: {
    type: DataTypes.JSON,
    allowNull: true
  },
  complianceNotes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  commonMistakes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  faqs: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft',
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'services',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['status']
    },
    {
      fields: ['user_id']
    }
  ]
});

export default Service;
