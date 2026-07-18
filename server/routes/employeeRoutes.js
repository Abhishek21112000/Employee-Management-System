import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getReportees,
  assignManager,
  bulkImportEmployees,
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/bulk-import', protect, authorize('Super Admin', 'HR Manager'), upload.single('file'), bulkImportEmployees);

router
  .route('/')
  .get(protect, authorize('Super Admin', 'HR Manager'), getEmployees)
  .post(protect, authorize('Super Admin', 'HR Manager'), upload.single('profileImage'), createEmployee);

router.get('/:id/reportees', protect, getReportees);
router.patch('/:id/manager', protect, authorize('Super Admin', 'HR Manager'), assignManager);

router
  .route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, upload.single('profileImage'), updateEmployee)
  .delete(protect, authorize('Super Admin'), deleteEmployee);

export default router;
