import { body, validationResult } from 'express-validator';
import BlogCategory from '../models/BlogCategory.js';
import { Op } from 'sequelize';
import { generateUniqueSlug } from '../utils/generateSlug.js';
import { successResponse, createdResponse, notFoundResponse, errorResponse, paginatedResponse } from '../utils/responseHandler.js';

// @desc    Get all blog categories with pagination
// @route   GET /api/blog-categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'active';
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {
      status: status === 'all' ? ['active', 'inactive'] : status
    };

    // Add search condition if search term provided
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get categories with pagination
    const { count, rows: categories } = await BlogCategory.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return paginatedResponse(res, categories, {
      page,
      limit,
      total: count
    }, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Get all categories error:', error);
    return errorResponse(res, error.message || 'Error retrieving categories', 500);
  }
};

// @desc    Get single category by slug
// @route   GET /api/blog-categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await BlogCategory.findOne({
      where: { slug }
    });

    if (!category) {
      return notFoundResponse(res, 'Category not found');
    }

    return successResponse(res, category, 'Category retrieved successfully');
  } catch (error) {
    console.error('Get category by slug error:', error);
    return errorResponse(res, error.message || 'Error retrieving category', 500);
  }
};

// @desc    Get single category by ID
// @route   GET /api/blog-categories/id/:id
// @access  Private
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await BlogCategory.findByPk(id);

    if (!category) {
      return notFoundResponse(res, 'Category not found');
    }

    return successResponse(res, category, 'Category retrieved successfully');
  } catch (error) {
    console.error('Get category by ID error:', error);
    return errorResponse(res, error.message || 'Error retrieving category', 500);
  }
};

// @desc    Create new category
// @route   POST /api/blog-categories
// @access  Private (Admin only)
export const createCategory = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { name, description, metaTitle, metaDescription, status } = req.body;
    const image = req.file ? req.file.filename : null;

    // Get existing slugs to ensure uniqueness
    const existingCategories = await BlogCategory.findAll({ attributes: ['slug'] });
    const existingSlugs = existingCategories.map(category => category.slug);

    // Generate unique slug
    const slug = generateUniqueSlug(name, existingSlugs);

    // Create category
    const category = await BlogCategory.create({
      name,
      slug,
      description,
      metaTitle,
      metaDescription,
      image,
      status: status || 'active'
    });

    return createdResponse(res, category, 'Category created successfully');
  } catch (error) {
    console.error('Create category error:', error);
    return errorResponse(res, error.message || 'Error creating category', 500);
  }
};

// @desc    Update category
// @route   PUT /api/blog-categories/:id
// @access  Private (Admin only)
export const updateCategory = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { id } = req.params;
    const { name, description, metaTitle, metaDescription, status } = req.body;

    // Find category
    const category = await BlogCategory.findByPk(id);

    if (!category) {
      return notFoundResponse(res, 'Category not found');
    }

    // Update slug if name changed
    let slug = category.slug;
    if (name && name !== category.name) {
      const existingCategories = await BlogCategory.findAll({
        where: { id: { [Op.ne]: id } },
        attributes: ['slug']
      });
      const existingSlugs = existingCategories.map(c => c.slug);
      slug = generateUniqueSlug(name, existingSlugs);
    }

    // Update category
    await category.update({
      name: name || category.name,
      slug,
      description: description !== undefined ? description : category.description,
      metaTitle: metaTitle !== undefined ? metaTitle : category.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : category.metaDescription,
      image: req.file ? req.file.filename : category.image,
      status: status || category.status
    });

    return successResponse(res, category, 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    return errorResponse(res, error.message || 'Error updating category', 500);
  }
};

// @desc    Delete category
// @route   DELETE /api/blog-categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find category
    const category = await BlogCategory.findByPk(id);

    if (!category) {
      return notFoundResponse(res, 'Category not found');
    }

    // Delete category
    await category.destroy();

    return successResponse(res, null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    return errorResponse(res, error.message || 'Error deleting category', 500);
  }
};

// Validation rules
export const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive')
];
