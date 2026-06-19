import { body, validationResult } from 'express-validator';
import { Device, User } from '../models/index.js';
import { Op } from 'sequelize';
import { generateUniqueSlugFromModel } from '../utils/generateSlug.js';
import { successResponse, createdResponse, notFoundResponse, errorResponse, paginatedResponse } from '../utils/responseHandler.js';

// @desc    Get all devices with pagination and search
// @route   GET /api/devices
// @access  Public
export const getAllDevices = async (req, res) => {
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

    // Get devices with pagination
    const { count, rows: devices } = await Device.findAndCountAll({
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

    return paginatedResponse(res, devices, {
      page,
      limit,
      total: count
    }, 'Devices retrieved successfully');
  } catch (error) {
    console.error('Get all devices error:', error);
    return errorResponse(res, error.message || 'Error retrieving devices', 500);
  }
};

// @desc    Get single device by slug
// @route   GET /api/devices/:slug
// @access  Public
export const getDeviceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const device = await Device.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!device) {
      return notFoundResponse(res, 'Device not found');
    }

    return successResponse(res, device, 'Device retrieved successfully');
  } catch (error) {
    console.error('Get device by slug error:', error);
    return errorResponse(res, error.message || 'Error retrieving device', 500);
  }
};

// @desc    Get single device by ID
// @route   GET /api/devices/id/:id
// @access  Private
export const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!device) {
      return notFoundResponse(res, 'Device not found');
    }

    return successResponse(res, device, 'Device retrieved successfully');
  } catch (error) {
    console.error('Get device by ID error:', error);
    return errorResponse(res, error.message || 'Error retrieving device', 500);
  }
};

// Helper to parse JSON fields that may arrive as strings via FormData
const parseJsonField = (value) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
};

// @desc    Create new device
// @route   POST /api/devices
// @access  Private
export const createDevice = async (req, res) => {
  try {
    console.log('=== Create Device Request ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user);
    console.log('============================');

    // Manual validation for FormData
    if (!req.body.title || req.body.title.trim().length < 3) {
      return errorResponse(res, 'Title is required and must be at least 3 characters', 400);
    }
    if (req.body.slug && req.body.slug.length < 3) {
      return errorResponse(res, 'Slug must be at least 3 characters', 400);
    }
    if (req.body.status && !['draft', 'published'].includes(req.body.status)) {
      return errorResponse(res, 'Status must be either draft or published', 400);
    }

    const userId = req.user.id;
    const deviceData = { ...req.body };

    console.log('=== Device Data Before Processing ===');
    console.log('All fields:', Object.keys(deviceData));
    console.log('=====================================');

    // Handle uploaded files
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        deviceData.image = req.files.image[0].filename;
      }
      if (req.files.images && req.files.images.length > 0) {
        deviceData.images = req.files.images.map(file => file.filename);
      }
      if (req.files.specificationsImage && req.files.specificationsImage[0]) {
        deviceData.specificationsImage = req.files.specificationsImage[0].filename;
      }
      if (req.files.featuresImage && req.files.featuresImage[0]) {
        deviceData.featuresImage = req.files.featuresImage[0].filename;
      }
    }

    // Parse JSON fields that come as strings from FormData
    if (deviceData.specifications !== undefined) {
      deviceData.specifications = parseJsonField(deviceData.specifications);
    }
    if (deviceData.features !== undefined) {
      deviceData.features = parseJsonField(deviceData.features);
    }
    if (deviceData.faqs !== undefined) {
      deviceData.faqs = parseJsonField(deviceData.faqs);
    }
    if (deviceData.relatedDevices !== undefined) {
      deviceData.relatedDevices = parseJsonField(deviceData.relatedDevices);
    }

    // Generate unique slug if not provided
    if (!deviceData.slug) {
      deviceData.slug = await generateUniqueSlugFromModel(Device, deviceData.title);
    }

    // Add user ID
    deviceData.userId = userId;

    console.log('=== Creating Device with Data ===');
    console.log('Device data keys:', Object.keys(deviceData));
    console.log('==================================');

    const device = await Device.create(deviceData);

    return createdResponse(res, device, 'Device created successfully');
  } catch (error) {
    console.error('Create device error:', error);
    console.error('Error details:', error.errors);
    return errorResponse(res, error.message || 'Error creating device', 500);
  }
};

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private
export const updateDevice = async (req, res) => {
  try {
    // Manual validation for FormData
    if (req.body.title && req.body.title.trim().length < 3) {
      return errorResponse(res, 'Title must be at least 3 characters', 400);
    }
    if (req.body.slug && req.body.slug.length < 3) {
      return errorResponse(res, 'Slug must be at least 3 characters', 400);
    }
    if (req.body.status && !['draft', 'published'].includes(req.body.status)) {
      return errorResponse(res, 'Status must be either draft or published', 400);
    }

    const { id } = req.params;
    const deviceData = { ...req.body };

    const device = await Device.findByPk(id);

    if (!device) {
      return notFoundResponse(res, 'Device not found');
    }

    // Handle uploaded files
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        deviceData.image = req.files.image[0].filename;
      }
      if (req.files.images && req.files.images.length > 0) {
        deviceData.images = req.files.images.map(file => file.filename);
      }
      if (req.files.specificationsImage && req.files.specificationsImage[0]) {
        deviceData.specificationsImage = req.files.specificationsImage[0].filename;
      }
      if (req.files.featuresImage && req.files.featuresImage[0]) {
        deviceData.featuresImage = req.files.featuresImage[0].filename;
      }
    }

    // Parse JSON fields that come as strings from FormData
    if (deviceData.specifications !== undefined) {
      deviceData.specifications = parseJsonField(deviceData.specifications);
    }
    if (deviceData.features !== undefined) {
      deviceData.features = parseJsonField(deviceData.features);
    }
    if (deviceData.faqs !== undefined) {
      deviceData.faqs = parseJsonField(deviceData.faqs);
    }
    if (deviceData.relatedDevices !== undefined) {
      deviceData.relatedDevices = parseJsonField(deviceData.relatedDevices);
    }

    // Generate new slug if title changed and slug not provided
    if (deviceData.title && deviceData.title !== device.title && !deviceData.slug) {
      deviceData.slug = await generateUniqueSlugFromModel(Device, deviceData.title);
    }

    await device.update(deviceData);

    return successResponse(res, device, 'Device updated successfully');
  } catch (error) {
    console.error('Update device error:', error);
    return errorResponse(res, error.message || 'Error updating device', 500);
  }
};

// @desc    Delete device
// @route   DELETE /api/devices/:id
// @access  Private
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findByPk(id);

    if (!device) {
      return notFoundResponse(res, 'Device not found');
    }

    await device.destroy();

    return successResponse(res, null, 'Device deleted successfully');
  } catch (error) {
    console.error('Delete device error:', error);
    return errorResponse(res, error.message || 'Error deleting device', 500);
  }
};

// Validation rules
export const deviceValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('slug')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Slug must be between 3 and 255 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published')
];
