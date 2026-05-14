import { validationResult } from 'express-validator';

// Validation middleware to check for errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg
      }))
    });
  }
  
  next();
};

// Custom validation rules
export const validationRules = {
  // Signup validation
  signup: [
    { 
      field: 'name',
      rules: {
        notEmpty: { errorMessage: 'Name is required' },
        isLength: { options: { min: 2, max: 100 }, errorMessage: 'Name must be between 2 and 100 characters' }
      }
    },
    {
      field: 'email',
      rules: {
        notEmpty: { errorMessage: 'Email is required' },
        isEmail: { errorMessage: 'Please provide a valid email' },
        normalizeEmail: {}
      }
    },
    {
      field: 'phone',
      rules: {
        notEmpty: { errorMessage: 'Phone number is required' },
        isMobilePhone: { options: ['any'], errorMessage: 'Please provide a valid phone number' }
      }
    },
    {
      field: 'password',
      rules: {
        notEmpty: { errorMessage: 'Password is required' },
        isLength: { options: { min: 6 }, errorMessage: 'Password must be at least 6 characters' }
      }
    },
    {
      field: 'confirmPassword',
      rules: {
        notEmpty: { errorMessage: 'Please confirm your password' },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Passwords do not match');
            }
            return true;
          }
        }
      }
    }
  ],

  // Login validation
  login: [
    {
      field: 'email',
      rules: {
        notEmpty: { errorMessage: 'Email is required' },
        isEmail: { errorMessage: 'Please provide a valid email' }
      }
    },
    {
      field: 'password',
      rules: {
        notEmpty: { errorMessage: 'Password is required' }
      }
    }
  ],

  // Blog validation
  blog: [
    {
      field: 'title',
      rules: {
        notEmpty: { errorMessage: 'Title is required' },
        isLength: { options: { min: 3, max: 255 }, errorMessage: 'Title must be between 3 and 255 characters' }
      }
    },
    {
      field: 'content',
      rules: {
        notEmpty: { errorMessage: 'Content is required' }
      }
    },
    {
      field: 'status',
      rules: {
        optional: true,
        isIn: { options: [['draft', 'published']], errorMessage: 'Status must be either draft or published' }
      }
    }
  ],

  // Service validation
  service: [
    {
      field: 'title',
      rules: {
        notEmpty: { errorMessage: 'Title is required' },
        isLength: { options: { min: 3, max: 255 }, errorMessage: 'Title must be between 3 and 255 characters' }
      }
    },
    {
      field: 'content',
      rules: {
        notEmpty: { errorMessage: 'Content is required' }
      }
    },
    {
      field: 'status',
      rules: {
        optional: true,
        isIn: { options: [['draft', 'published']], errorMessage: 'Status must be either draft or published' }
      }
    }
  ]
};
