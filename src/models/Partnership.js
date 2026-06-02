import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Partnership = sequelize.define('Partnership', {
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
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    allowNull: false,
    defaultValue: 'draft'
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
  heroSubtitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'hero_subtitle'
  },
  heroDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'hero_description'
  },
  highlightText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'highlight_text'
  },
  ctaPrimaryLabel: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'cta_primary_label'
  },
  ctaPrimaryUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cta_primary_url'
  },
  ctaSecondaryLabel: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'cta_secondary_label'
  },
  ctaSecondaryUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cta_secondary_url'
  },
  challengeTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'challenge_title'
  },
  challengeIntro: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'challenge_intro'
  },
  challengePoints: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'challenge_points'
  },
  challengeBadgeText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'challenge_badge_text'
  },
  solutionTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'solution_title'
  },
  solutionIntro: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'solution_intro'
  },
  solutionFeatures: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'solution_features'
  },
  solutionBadgeText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'solution_badge_text'
  },
  whyPartnerTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'why_partner_title'
  },
  whyPartnerBadgeText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'why_partner_badge_text'
  },
  resultsMetric: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'results_metric'
  },
  resultsTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'results_title'
  },
  resultsDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'results_description'
  },
  resultsBadgeText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'results_badge_text'
  },
  reasons: {
    type: DataTypes.JSON,
    allowNull: true
  },
  whyScales: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'why_scales'
  },
  scalabilityTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'scalability_title'
  },
  scalabilityBadgeText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'scalability_badge_text'
  },
  partnersGetTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'partners_get_title'
  },
  partnersGet: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'partners_get'
  },
  partnersGetBadgeText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'partners_get_badge_text'
  },
  finalCtaTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'final_cta_title'
  },
  finalCtaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'final_cta_description'
  },
  finalCtaPrimaryLabel: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'final_cta_primary_label'
  },
  finalCtaPrimaryUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'final_cta_primary_url'
  },
  finalCtaSecondaryLabel: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'final_cta_secondary_label'
  },
  finalCtaSecondaryUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'final_cta_secondary_url'
  },
  finalCtaBadgeText: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'final_cta_badge_text'
  },
  trustFounder: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'trust_founder'
  },
  trustMarketProjection: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'trust_market_projection'
  },
  trustRPMProjection: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'trust_rpm_projection'
  },
  trustFooterText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'trust_footer_text'
  }
});

export default Partnership;
