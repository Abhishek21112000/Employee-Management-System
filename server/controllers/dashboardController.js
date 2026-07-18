import Employee from '../models/Employee.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Super Admin, HR Manager)
export const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isDeleted: { $ne: true } });
    
    const activeEmployees = await Employee.countDocuments({ status: 'Active', isDeleted: { $ne: true } });
    
    const inactiveEmployees = await Employee.countDocuments({ status: 'Inactive', isDeleted: { $ne: true } });

    // Aggregate department counts
    const departmentCounts = await Employee.aggregate([
      { $match: { isDeleted: { $ne: true }, department: { $nin: [null, ''] } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departmentCounts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
