import express from 'express';
import {
  getUsers,
  getUserById
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get all users
router.get('/', getUsers);

// Get user by ID
router.get('/:id', getUserById);

export default router;
