import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('Super Admin', 'HR Manager'), getDashboardStats);

export default router;
