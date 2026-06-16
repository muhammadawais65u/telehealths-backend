import { body, validationResult } from 'express-validator';
import { Device, User } from '../models/index.js';
import { Op } from 'sequelize';
import { generateUniqueSlug } from '../utils/generateSlug.js';
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const userId = req.user.id;
    const deviceData = { ...req.body };

    // Handle uploaded image
    if (req.file) {
      deviceData.image = req.file.filename;
    }

    // Parse JSON fields that come as strings from FormData
    if (deviceData.specifications !== undefined) {
      deviceData.specifications = parseJsonField(deviceData.specifications);
    }
    if (deviceData.features !== undefined) {
      deviceData.features = parseJsonField(deviceData.features);
    }

    // Generate unique slug if not provided
    if (!deviceData.slug) {
      deviceData.slug = await generateUniqueSlug(Device, deviceData.title);
    }

    // Add user ID
    deviceData.userId = userId;

    const device = await Device.create(deviceData);

    return createdResponse(res, device, 'Device created successfully');
  } catch (error) {
    console.error('Create device error:', error);
    return errorResponse(res, error.message || 'Error creating device', 500);
  }
};

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private
export const updateDevice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { id } = req.params;
    const deviceData = { ...req.body };

    const device = await Device.findByPk(id);

    if (!device) {
      return notFoundResponse(res, 'Device not found');
    }

    // Handle uploaded image
    if (req.file) {
      deviceData.image = req.file.filename;
    }

    // Parse JSON fields that come as strings from FormData
    if (deviceData.specifications !== undefined) {
      deviceData.specifications = parseJsonField(deviceData.specifications);
    }
    if (deviceData.features !== undefined) {
      deviceData.features = parseJsonField(deviceData.features);
    }

    // Generate new slug if title changed and slug not provided
    if (deviceData.title && deviceData.title !== device.title && !deviceData.slug) {
      deviceData.slug = await generateUniqueSlug(Device, deviceData.title);
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
