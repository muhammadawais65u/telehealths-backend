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
  eligibilityTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'eligibility_tag'
  },
  eligibilityTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'eligibility_title'
  },
  eligibilityDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'eligibility_description'
  },
  eligibility: {
    type: DataTypes.JSON,
    allowNull: true
  },
  processTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'process_tag'
  },
  processTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'process_title'
  },
  processDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'process_description'
  },
  process: {
    type: DataTypes.JSON,
    allowNull: true
  },
  platformTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'platform_tag'
  },
  platformTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'platform_title'
  },
  platformDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'platform_description'
  },
  platform: {
    type: DataTypes.JSON,
    allowNull: true
  },
  keyStatsTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'key_stats_tag'
  },
  keyStatsTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'key_stats_title'
  },
  keyStatsDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'key_stats_description'
  },
  keyStats: {
    type: DataTypes.JSON,
    allowNull: true
  },
  billingTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'billing_tag'
  },
  billingTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'billing_title'
  },
  billingDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'billing_description'
  },
  billingCodes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  whyCCNTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'why_ccn_tag'
  },
  whyCCNTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'why_ccn_title'
  },
  whyCCNDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'why_ccn_description'
  },
  whyCCN: {
    type: DataTypes.JSON,
    allowNull: true
  },
  complianceTag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'compliance_tag'
  },
  complianceTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'compliance_title'
  },
  complianceDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'compliance_description'
  },
  complianceNotes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  commonMistakes: {
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
