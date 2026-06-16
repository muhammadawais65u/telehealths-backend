import express from 'express';
import {
  getAllDevices,
  getDeviceBySlug,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  deviceValidation
} from '../controllers/deviceController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validationMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllDevices);
router.get('/:slug', getDeviceBySlug);

// Private routes (require authentication)
router.get('/id/:id', authenticate, getDeviceById);
router.post('/', authenticate, authorize(['admin']), uploadSingle('image'), deviceValidation, validate, createDevice);
router.put('/:id', authenticate, authorize(['admin']), uploadSingle('image'), deviceValidation, validate, updateDevice);
router.delete('/:id', authenticate, authorize(['admin']), deleteDevice);

export default router;
