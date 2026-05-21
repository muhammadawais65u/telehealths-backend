import express from 'express';
import {
  getAllServices,
  getServiceBySlug,
  getServiceById,
  createService,
  updateService,
  deleteService,
  serviceValidation
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services with pagination and search
// @access  Public
router.get('/', getAllServices);

// @route   GET /api/services/id/:id
// @desc    Get single service by ID (for editing)
// @access  Private
router.get('/id/:id', protect, getServiceById);

// @route   GET /api/services/:slug
// @desc    Get single service by slug
// @access  Public
router.get('/:slug', getServiceBySlug);

// @route   POST /api/services
// @desc    Create new service
// @access  Private
router.post(
  '/',
  protect,
  uploadSingle('image'),
  serviceValidation,
  validate,
  createService
);

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Private
router.put(
  '/:id',
  protect,
  uploadSingle('image'),
  serviceValidation,
  validate,
  updateService
);

// @route   DELETE /api/services/:id
// @desc    Delete service
// @access  Private
router.delete('/:id', protect, deleteService);

export default router;
