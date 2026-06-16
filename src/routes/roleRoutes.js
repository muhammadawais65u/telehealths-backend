import express from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole
} from '../controllers/roleController.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// All role routes require authentication
router.use(authenticate);

// Get all roles - authenticated users can view
router.get('/', getRoles);

// Get role by ID - authenticated users can view
router.get('/:id', getRoleById);

// Create role - requires admin role or permission
router.post('/', authenticate, authorize(['admin']), requirePermission('role.create'), createRole);

// Update role - requires admin role or permission
router.put('/:id', authenticate, authorize(['admin']), requirePermission('role.update'), updateRole);

// Delete role - requires admin role or permission
router.delete('/:id', authenticate, authorize(['admin']), requirePermission('role.delete'), deleteRole);

// Assign permissions to role - requires admin role or permission
router.post('/:id/permissions', authenticate, authorize(['admin']), requirePermission('permission.assign'), assignPermissionsToRole);

export default router;
