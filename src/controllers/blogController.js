import { body, validationResult } from 'express-validator';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import { generateUniqueSlug } from '../utils/generateSlug.js';
import { successResponse, createdResponse, notFoundResponse, errorResponse, paginatedResponse } from '../utils/responseHandler.js';

// @desc    Get all blogs with pagination and search
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = async (req, res) => {
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

    // Get blogs with pagination
    const { count, rows: blogs } = await Blog.findAndCountAll({
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

    return paginatedResponse(res, blogs, {
      page,
      limit,
      total: count
    }, 'Blogs retrieved successfully');
  } catch (error) {
    console.error('Get all blogs error:', error);
    return errorResponse(res, error.message || 'Error retrieving blogs', 500);
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!blog) {
      return notFoundResponse(res, 'Blog not found');
    }

    return successResponse(res, blog, 'Blog retrieved successfully');
  } catch (error) {
    console.error('Get blog by slug error:', error);
    return errorResponse(res, error.message || 'Error retrieving blog', 500);
  }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/id/:id
// @access  Private
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!blog) {
      return notFoundResponse(res, 'Blog not found');
    }

    return successResponse(res, blog, 'Blog retrieved successfully');
  } catch (error) {
    console.error('Get blog by ID error:', error);
    return errorResponse(res, error.message || 'Error retrieving blog', 500);
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { title, metaTitle, metaDescription, keywords, shortDescription, content, status } = req.body;
    const featuredImage = req.file ? req.file.filename : null;

    // Get existing slugs to ensure uniqueness
    const existingBlogs = await Blog.findAll({ attributes: ['slug'] });
    const existingSlugs = existingBlogs.map(blog => blog.slug);

    // Generate unique slug
    const slug = generateUniqueSlug(title, existingSlugs);

    // Create blog
    const blog = await Blog.create({
      title,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      featuredImage,
      shortDescription,
      content,
      status: status || 'draft',
      userId: req.user.id
    });

    // Fetch the created blog with author
    const createdBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return createdResponse(res, createdBlog, 'Blog created successfully');
  } catch (error) {
    console.error('Create blog error:', error);
    return errorResponse(res, error.message || 'Error creating blog', 500);
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { id } = req.params;
    const { title, metaTitle, metaDescription, keywords, shortDescription, content, status } = req.body;

    // Find blog
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return notFoundResponse(res, 'Blog not found');
    }

    // Check if user is the author or admin
    if (blog.userId !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to update this blog', 403);
    }

    // Update slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      const existingBlogs = await Blog.findAll({
        where: { id: { [Op.ne]: id } },
        attributes: ['slug']
      });
      const existingSlugs = existingBlogs.map(b => b.slug);
      slug = generateUniqueSlug(title, existingSlugs);
    }

    // Update blog
    await blog.update({
      title: title || blog.title,
      slug,
      metaTitle: metaTitle !== undefined ? metaTitle : blog.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : blog.metaDescription,
      keywords: keywords !== undefined ? keywords : blog.keywords,
      featuredImage: req.file ? req.file.filename : blog.featuredImage,
      shortDescription: shortDescription !== undefined ? shortDescription : blog.shortDescription,
      content: content || blog.content,
      status: status || blog.status
    });

    // Fetch updated blog with author
    const updatedBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return successResponse(res, updatedBlog, 'Blog updated successfully');
  } catch (error) {
    console.error('Update blog error:', error);
    return errorResponse(res, error.message || 'Error updating blog', 500);
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find blog
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return notFoundResponse(res, 'Blog not found');
    }

    // Check if user is the author or admin
    if (blog.userId !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to delete this blog', 403);
    }

    // Delete blog
    await blog.destroy();

    return successResponse(res, null, 'Blog deleted successfully');
  } catch (error) {
    console.error('Delete blog error:', error);
    return errorResponse(res, error.message || 'Error deleting blog', 500);
  }
};

// Validation rules
export const blogValidation = [
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
