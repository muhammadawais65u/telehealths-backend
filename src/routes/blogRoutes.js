import express from 'express';
import {
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  blogValidation
} from '../controllers/blogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @route   GET /api/blogs
// @desc    Get all blogs with pagination and search
// @access  Public
router.get('/', getAllBlogs);

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', getBlogBySlug);

// @route   GET /api/blogs/id/:id
// @desc    Get single blog by ID (for editing)
// @access  Private
router.get('/id/:id', protect, getBlogById);

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Private
router.post(
  '/',
  protect,
  uploadSingle('featuredImage'),
  blogValidation,
  validate,
  createBlog
);

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Private
router.put(
  '/:id',
  protect,
  uploadSingle('featuredImage'),
  blogValidation,
  validate,
  updateBlog
);

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Private
router.delete('/:id', protect, deleteBlog);

export default router;
