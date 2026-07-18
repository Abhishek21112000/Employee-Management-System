import Employee from '../models/Employee.js';

// Helper function to build the tree
const buildTree = (employees, managerId = null) => {
  return employees
    .filter(emp => String(emp.reportingManager) === String(managerId))
    .map(emp => ({
      ...emp.toObject(),
      children: buildTree(employees, emp._id)
    }));
};

// @desc    Get Organization Tree
// @route   GET /api/organization/tree
// @access  Private (Super Admin, HR Manager)
export const getOrgTree = async (req, res) => {
  try {
    const employees = await Employee.find({ isDeleted: { $ne: true } }).select('-password');
    
    // In our system, the top level nodes are employees who have NO reportingManager
    const tree = buildTree(employees, null);
    
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
