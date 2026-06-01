import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Partnership } from '../models/index.js';
import { generateUniqueSlug } from '../utils/generateSlug.js';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  errorResponse,
  paginatedResponse
} from '../utils/responseHandler.js';

export const partnershipValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('slug').optional().isString(),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published')
];

const parseJsonField = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

// @desc    Get all partnerships with pagination and search
// @route   GET /api/partnerships
// @access  Public
export const getAllPartnerships = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'published';
    const offset = (page - 1) * limit;

    const whereClause = {
      status: status === 'all' ? ['draft', 'published'] : status
    };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { heroSubtitle: { [Op.like]: `%${search}%` } },
        { metaDescription: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: partnerships } = await Partnership.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return paginatedResponse(res, partnerships, {
      page,
      limit,
      total: count
    }, 'Partnerships retrieved successfully');
  } catch (error) {
    console.error('Get all partnerships error:', error);
    return errorResponse(res, error.message || 'Error retrieving partnerships', 500);
  }
};

// @desc    Get single partnership by slug
// @route   GET /api/partnerships/:slug
// @access  Public
export const getPartnershipBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const partnership = await Partnership.findOne({ where: { slug } });

    if (!partnership) {
      return notFoundResponse(res, 'Partnership not found');
    }

    return successResponse(res, partnership, 'Partnership retrieved successfully');
  } catch (error) {
    console.error('Get partnership by slug error:', error);
    return errorResponse(res, error.message || 'Error retrieving partnership', 500);
  }
};

// @desc    Get single partnership by ID
// @route   GET /api/partnerships/id/:id
// @access  Private
export const getPartnershipById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnership = await Partnership.findByPk(id);

    if (!partnership) {
      return notFoundResponse(res, 'Partnership not found');
    }

    return successResponse(res, partnership, 'Partnership retrieved successfully');
  } catch (error) {
    console.error('Get partnership by ID error:', error);
    return errorResponse(res, error.message || 'Error retrieving partnership', 500);
  }
};

// @desc    Create new partnership
// @route   POST /api/partnerships
// @access  Private
export const createPartnership = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const {
      title,
      slug: reqSlug,
      status,
      metaTitle,
      metaDescription,
      heroSubtitle,
      heroDescription,
      highlightText,
      ctaPrimaryLabel,
      ctaPrimaryUrl,
      ctaSecondaryLabel,
      ctaSecondaryUrl,
      challengeIntro,
      challengePoints,
      solutionIntro,
      solutionFeatures,
      resultsMetric,
      resultsTitle,
      resultsDescription,
      reasons,
      whyScales,
      partnersGet,
      finalCtaTitle,
      finalCtaDescription,
      finalCtaPrimaryLabel,
      finalCtaPrimaryUrl,
      finalCtaSecondaryLabel,
      finalCtaSecondaryUrl,
      trustFounder,
      trustMarketProjection,
      trustRPMProjection,
      trustFooterText
    } = req.body;

    const existingSlugs = (await Partnership.findAll({ attributes: ['slug'] })).map((item) => item.slug);
    const slug = generateUniqueSlug(reqSlug || title, existingSlugs);

    const partnership = await Partnership.create({
      title,
      slug,
      status: status || 'draft',
      metaTitle,
      metaDescription,
      heroSubtitle,
      heroDescription,
      highlightText,
      ctaPrimaryLabel,
      ctaPrimaryUrl,
      ctaSecondaryLabel,
      ctaSecondaryUrl,
      challengeIntro,
      challengePoints: parseJsonField(challengePoints),
      solutionIntro,
      solutionFeatures: parseJsonField(solutionFeatures),
      resultsMetric,
      resultsTitle,
      resultsDescription,
      reasons: parseJsonField(reasons),
      whyScales: parseJsonField(whyScales),
      partnersGet: parseJsonField(partnersGet),
      finalCtaTitle,
      finalCtaDescription,
      finalCtaPrimaryLabel,
      finalCtaPrimaryUrl,
      finalCtaSecondaryLabel,
      finalCtaSecondaryUrl,
      trustFounder,
      trustMarketProjection,
      trustRPMProjection,
      trustFooterText
    });

    return createdResponse(res, partnership, 'Partnership created successfully');
  } catch (error) {
    console.error('Create partnership error:', error);
    return errorResponse(res, error.message || 'Error creating partnership', 500);
  }
};

// @desc    Update partnership
// @route   PUT /api/partnerships/:id
// @access  Private
export const updatePartnership = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { id } = req.params;
    const partnership = await Partnership.findByPk(id);

    if (!partnership) {
      return notFoundResponse(res, 'Partnership not found');
    }

    const {
      title,
      slug: reqSlug,
      status,
      metaTitle,
      metaDescription,
      heroSubtitle,
      heroDescription,
      highlightText,
      ctaPrimaryLabel,
      ctaPrimaryUrl,
      ctaSecondaryLabel,
      ctaSecondaryUrl,
      challengeIntro,
      challengePoints,
      solutionIntro,
      solutionFeatures,
      resultsMetric,
      resultsTitle,
      resultsDescription,
      reasons,
      whyScales,
      partnersGet,
      finalCtaTitle,
      finalCtaDescription,
      finalCtaPrimaryLabel,
      finalCtaPrimaryUrl,
      finalCtaSecondaryLabel,
      finalCtaSecondaryUrl,
      trustFounder,
      trustMarketProjection,
      trustRPMProjection,
      trustFooterText
    } = req.body;

    const existingSlugs = (await Partnership.findAll({
      where: { id: { [Op.ne]: id } },
      attributes: ['slug']
    })).map((item) => item.slug);
    const slug = generateUniqueSlug(reqSlug || title || partnership.title, existingSlugs);

    await partnership.update({
      title: title ?? partnership.title,
      slug,
      status: status ?? partnership.status,
      metaTitle,
      metaDescription,
      heroSubtitle,
      heroDescription,
      highlightText,
      ctaPrimaryLabel,
      ctaPrimaryUrl,
      ctaSecondaryLabel,
      ctaSecondaryUrl,
      challengeIntro,
      challengePoints: parseJsonField(challengePoints) ?? partnership.challengePoints,
      solutionIntro,
      solutionFeatures: parseJsonField(solutionFeatures) ?? partnership.solutionFeatures,
      resultsMetric,
      resultsTitle,
      resultsDescription,
      reasons: parseJsonField(reasons) ?? partnership.reasons,
      whyScales: parseJsonField(whyScales) ?? partnership.whyScales,
      partnersGet: parseJsonField(partnersGet) ?? partnership.partnersGet,
      finalCtaTitle,
      finalCtaDescription,
      finalCtaPrimaryLabel,
      finalCtaPrimaryUrl,
      finalCtaSecondaryLabel,
      finalCtaSecondaryUrl,
      trustFounder,
      trustMarketProjection,
      trustRPMProjection,
      trustFooterText
    });

    return successResponse(res, partnership, 'Partnership updated successfully');
  } catch (error) {
    console.error('Update partnership error:', error);
    return errorResponse(res, error.message || 'Error updating partnership', 500);
  }
};

// @desc    Delete partnership
// @route   DELETE /api/partnerships/:id
// @access  Private
export const deletePartnership = async (req, res) => {
  try {
    const { id } = req.params;
    const partnership = await Partnership.findByPk(id);

    if (!partnership) {
      return notFoundResponse(res, 'Partnership not found');
    }

    await partnership.destroy();
    return successResponse(res, null, 'Partnership deleted successfully');
  } catch (error) {
    console.error('Delete partnership error:', error);
    return errorResponse(res, error.message || 'Error deleting partnership', 500);
  }
};
