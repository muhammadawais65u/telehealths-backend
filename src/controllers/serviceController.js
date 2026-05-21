import { body, validationResult } from 'express-validator';
import { Service, User } from '../models/index.js';
import { Op } from 'sequelize';
import { generateUniqueSlug } from '../utils/generateSlug.js';
import { successResponse, createdResponse, notFoundResponse, errorResponse, paginatedResponse } from '../utils/responseHandler.js';

// @desc    Get all services with pagination and search
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'published';
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {
      status: status === 'all' ? ['draft', 'published'] : status
    };

    // Add search condition if search term provided
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { keywords: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get services with pagination
    const { count, rows: services } = await Service.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return paginatedResponse(res, services, {
      page,
      limit,
      total: count
    }, 'Services retrieved successfully');
  } catch (error) {
    console.error('Get all services error:', error);
    return errorResponse(res, error.message || 'Error retrieving services', 500);
  }
};

// @desc    Get single service by slug
// @route   GET /api/services/:slug
// @access  Public
export const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await Service.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    return successResponse(res, service, 'Service retrieved successfully');
  } catch (error) {
    console.error('Get service by slug error:', error);
    return errorResponse(res, error.message || 'Error retrieving service', 500);
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/id/:id
// @access  Private
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    return successResponse(res, service, 'Service retrieved successfully');
  } catch (error) {
    console.error('Get service by ID error:', error);
    return errorResponse(res, error.message || 'Error retrieving service', 500);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private
export const createService = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { 
      title, 
      slug: reqSlug,
      metaTitle, 
      metaDescription, 
      keywords, 
      shortDescription, 
      content, 
      status,
      badge,
      heroDescription,
      tags,
      stats,
      overviewTitle,
      overview,
      overviewFeatures,
      eligibility,
      process,
      platform,
      keyStats,
      billingCodes,
      whyCCN,
      complianceNotes,
      commonMistakes,
      faqs
    } = req.body;
    const image = req.file ? req.file.filename : null;

    // Get existing slugs to ensure uniqueness
    const existingServices = await Service.findAll({ attributes: ['slug'] });
    const existingSlugs = existingServices.map(service => service.slug);

    // Generate unique slug
    const slug = generateUniqueSlug(reqSlug || title, existingSlugs);

    // Create service
    const service = await Service.create({
      title,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      image,
      shortDescription,
      content,
      status: status || 'draft',
      userId: req.user.id,
      badge,
      heroDescription,
      tags,
      stats: stats ? JSON.parse(stats) : null,
      overviewTitle,
      overview,
      overviewFeatures: overviewFeatures ? JSON.parse(overviewFeatures) : null,
      eligibility: eligibility ? JSON.parse(eligibility) : null,
      process: process ? JSON.parse(process) : null,
      platform: platform ? JSON.parse(platform) : null,
      keyStats: keyStats ? JSON.parse(keyStats) : null,
      billingCodes: billingCodes ? JSON.parse(billingCodes) : null,
      whyCCN: whyCCN ? JSON.parse(whyCCN) : null,
      complianceNotes: complianceNotes ? JSON.parse(complianceNotes) : null,
      commonMistakes: commonMistakes ? JSON.parse(commonMistakes) : null,
      faqs: faqs ? JSON.parse(faqs) : null
    });

    // Fetch the created service with author
    const createdService = await Service.findByPk(service.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return createdResponse(res, createdService, 'Service created successfully');
  } catch (error) {
    console.error('Create service error:', error);
    return errorResponse(res, error.message || 'Error creating service', 500);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
export const updateService = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { id } = req.params;
    const { 
      title, 
      slug: reqSlug,
      metaTitle, 
      metaDescription, 
      keywords, 
      shortDescription, 
      content, 
      status,
      badge,
      heroDescription,
      tags,
      stats,
      overviewTitle,
      overview,
      overviewFeatures,
      eligibility,
      process,
      platform,
      keyStats,
      billingCodes,
      whyCCN,
      complianceNotes,
      commonMistakes,
      faqs
    } = req.body;

    // Find service
    const service = await Service.findByPk(id);

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    // Check if user is the author or admin
    if (service.userId !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to update this service', 403);
    }

    // Update slug if title or slug changed
    let slug = service.slug;
    if (reqSlug && reqSlug !== service.slug) {
      const existingServices = await Service.findAll({
        where: { id: { [Op.ne]: id } },
        attributes: ['slug']
      });
      const existingSlugs = existingServices.map(s => s.slug);
      slug = generateUniqueSlug(reqSlug, existingSlugs);
    } else if (title && title !== service.title && !reqSlug) {
      const existingServices = await Service.findAll({
        where: { id: { [Op.ne]: id } },
        attributes: ['slug']
      });
      const existingSlugs = existingServices.map(s => s.slug);
      slug = generateUniqueSlug(title, existingSlugs);
    }

    // Update service
    await service.update({
      title: title || service.title,
      slug,
      metaTitle: metaTitle !== undefined ? metaTitle : service.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : service.metaDescription,
      keywords: keywords !== undefined ? keywords : service.keywords,
      image: req.file ? req.file.filename : service.image,
      shortDescription: shortDescription !== undefined ? shortDescription : service.shortDescription,
      content: content || service.content,
      status: status || service.status,
      badge: badge !== undefined ? badge : service.badge,
      heroDescription: heroDescription !== undefined ? heroDescription : service.heroDescription,
      tags: tags !== undefined ? tags : service.tags,
      stats: stats !== undefined ? JSON.parse(stats) : service.stats,
      overviewTitle: overviewTitle !== undefined ? overviewTitle : service.overviewTitle,
      overview: overview !== undefined ? overview : service.overview,
      overviewFeatures: overviewFeatures !== undefined ? JSON.parse(overviewFeatures) : service.overviewFeatures,
      eligibility: eligibility !== undefined ? JSON.parse(eligibility) : service.eligibility,
      process: process !== undefined ? JSON.parse(process) : service.process,
      platform: platform !== undefined ? JSON.parse(platform) : service.platform,
      keyStats: keyStats !== undefined ? JSON.parse(keyStats) : service.keyStats,
      billingCodes: billingCodes !== undefined ? JSON.parse(billingCodes) : service.billingCodes,
      whyCCN: whyCCN !== undefined ? JSON.parse(whyCCN) : service.whyCCN,
      complianceNotes: complianceNotes !== undefined ? JSON.parse(complianceNotes) : service.complianceNotes,
      commonMistakes: commonMistakes !== undefined ? JSON.parse(commonMistakes) : service.commonMistakes,
      faqs: faqs !== undefined ? JSON.parse(faqs) : service.faqs
    });

    // Fetch updated service with author
    const updatedService = await Service.findByPk(service.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return successResponse(res, updatedService, 'Service updated successfully');
  } catch (error) {
    console.error('Update service error:', error);
    return errorResponse(res, error.message || 'Error updating service', 500);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Find service
    const service = await Service.findByPk(id);

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    // Check if user is the author or admin
    if (service.userId !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to delete this service', 403);
    }

    // Delete service
    await service.destroy();

    return successResponse(res, null, 'Service deleted successfully');
  } catch (error) {
    console.error('Delete service error:', error);
    return errorResponse(res, error.message || 'Error deleting service', 500);
  }
};

// Validation rules
export const serviceValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
  body('content')
    .notEmpty().withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Status must be either draft or published')
];
