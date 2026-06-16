import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Device = sequelize.define('Device', {
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
    allowNull: true
  },
  // Device-specific fields
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
  price: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: true
  },
  statsTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'stats_tag'
  },
  statsTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stats_title'
  },
  statsDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'stats_description'
  },
  overviewTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'overview_tag'
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
  specificationsTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'specifications_tag'
  },
  specificationsTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'specifications_title'
  },
  specificationsDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'specifications_description'
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true
  },
  featuresTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'features_tag'
  },
  featuresTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'features_title'
  },
  featuresDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'features_description'
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true
  },
  benefitsTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'benefits_tag'
  },
  benefitsTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'benefits_title'
  },
  benefitsDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'benefits_description'
  },
  benefits: {
    type: DataTypes.JSON,
    allowNull: true
  },
  pricingTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'pricing_tag'
  },
  pricingTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'pricing_title'
  },
  pricingDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'pricing_description'
  },
  pricingPlans: {
    type: DataTypes.JSON,
    allowNull: true
  },
  faqTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'faq_tag'
  },
  faqTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'faq_title'
  },
  faqDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'faq_description'
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
  tableName: 'devices',
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

export default Device;
