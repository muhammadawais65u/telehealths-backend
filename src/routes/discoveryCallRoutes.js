import express from 'express';
import {
  getAllDiscoveryCalls,
  getDiscoveryCallById,
  createDiscoveryCall,
  deleteDiscoveryCall,
  discoveryCallValidation
} from '../controllers/discoveryCallController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllDiscoveryCalls);
router.get('/:id', protect, getDiscoveryCallById);
router.post('/', discoveryCallValidation, validate, createDiscoveryCall);
router.delete('/:id', protect, deleteDiscoveryCall);

export default router;
