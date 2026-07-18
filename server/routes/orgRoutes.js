import express from 'express';
import { getOrgTree } from '../controllers/orgController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/tree', protect, authorize('Super Admin', 'HR Manager'), getOrgTree);

export default router;
