import express from 'express';
import { getAllLeads, createLead, updateLead, deleteLead, leadValidation } from '../controllers/leadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Admin-only routes for managing leads
router.get('/', authenticate, authorize(['admin']), getAllLeads);
router.patch('/:id', authenticate, authorize(['admin']), updateLead);
router.delete('/:id', authenticate, authorize(['admin']), deleteLead);

// Public route for lead creation (funnel forms)
router.post('/', (req, res, next) => {
  console.log("=== Lead Submission Request ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("===============================");
  next();
}, leadValidation, validate, createLead);

export default router;
