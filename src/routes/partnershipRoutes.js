import express from 'express';
import {
  getAllPartnerships,
  getPartnershipBySlug,
  getPartnershipById,
  createPartnership,
  updatePartnership,
  deletePartnership,
  partnershipValidation
} from '../controllers/partnershipController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', getAllPartnerships);
router.get('/id/:id', protect, getPartnershipById);
router.get('/:slug', getPartnershipBySlug);
router.post('/', protect, partnershipValidation, validate, createPartnership);
router.put('/:id', protect, partnershipValidation, validate, updatePartnership);
router.delete('/:id', protect, deletePartnership);

export default router;
