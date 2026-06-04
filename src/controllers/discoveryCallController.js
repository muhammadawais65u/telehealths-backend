import { body, validationResult } from 'express-validator';
import { DiscoveryCall } from '../models/index.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  notFoundResponse
} from '../utils/responseHandler.js';

export const discoveryCallValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('phone').notEmpty().withMessage('Phone number is required')
];

// @desc    Get all discovery calls with pagination
// @route   GET /api/discovery-calls
// @access  Private
export const getAllDiscoveryCalls = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: calls } = await DiscoveryCall.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return paginatedResponse(res, calls, {
      page,
      limit,
      total: count
    }, 'Discovery calls retrieved successfully');
  } catch (error) {
    console.error('Get all discovery calls error:', error);
    return errorResponse(res, error.message || 'Error retrieving discovery calls', 500);
  }
};

// @desc    Get single discovery call by ID
// @route   GET /api/discovery-calls/:id
// @access  Private
export const getDiscoveryCallById = async (req, res) => {
  try {
    const { id } = req.params;
    const call = await DiscoveryCall.findByPk(id);

    if (!call) {
      return notFoundResponse(res, 'Discovery call not found');
    }

    return successResponse(res, call, 'Discovery call retrieved successfully');
  } catch (error) {
    console.error('Get discovery call by ID error:', error);
    return errorResponse(res, error.message || 'Error retrieving discovery call', 500);
  }
};

// @desc    Create new discovery call
// @route   POST /api/discovery-calls
// @access  Public
export const createDiscoveryCall = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { name, email, phone, message } = req.body;

    const call = await DiscoveryCall.create({
      name,
      email,
      phone,
      message: message || null
    });

    return createdResponse(res, call, 'Discovery call booked successfully');
  } catch (error) {
    console.error('Create discovery call error:', error);
    return errorResponse(res, error.message || 'Error booking discovery call', 500);
  }
};

// @desc    Delete discovery call
// @route   DELETE /api/discovery-calls/:id
// @access  Private
export const deleteDiscoveryCall = async (req, res) => {
  try {
    const { id } = req.params;
    const call = await DiscoveryCall.findByPk(id);

    if (!call) {
      return notFoundResponse(res, 'Discovery call not found');
    }

    await call.destroy();
    return successResponse(res, null, 'Discovery call deleted successfully');
  } catch (error) {
    console.error('Delete discovery call error:', error);
    return errorResponse(res, error.message || 'Error deleting discovery call', 500);
  }
};
