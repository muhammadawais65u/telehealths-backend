import express from 'express';
import {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryValidation
} from '../controllers/blogCategoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @route   GET /api/blog-categories
// @desc    Get all blog categories with pagination
// @access  Public
router.get('/', getAllCategories);

// @route   GET /api/blog-categories/:slug
// @desc    Get single category by slug
// @access  Public
router.get('/:slug', getCategoryBySlug);

// @route   GET /api/blog-categories/id/:id
// @desc    Get single category by ID (for editing)
// @access  Private
router.get('/id/:id', protect, getCategoryById);

// @route   POST /api/blog-categories
// @desc    Create new category
// @access  Private (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadSingle('image'),
  categoryValidation,
  validate,
  createCategory
);

// @route   PUT /api/blog-categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadSingle('image'),
  categoryValidation,
  validate,
  updateCategory
);

// @route   DELETE /api/blog-categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
