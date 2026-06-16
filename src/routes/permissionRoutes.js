import express from 'express';
import {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission
} from '../controllers/permissionController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Get all permissions - authenticated users can view
router.get('/', authenticate, getPermissions);

// Get permission by ID - authenticated users can view
router.get('/:id', authenticate, getPermissionById);

// Create permission - requires authentication
router.post('/', authenticate, createPermission);

// Update permission - requires authentication
router.put('/:id', authenticate, updatePermission);

// Delete permission - requires authentication
router.delete('/:id', authenticate, deletePermission);

export default router;
