import Employee from '../models/Employee.js';
import fs from 'fs';
import csv from 'csv-parser';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res) => {
  try {
    const { search, department, role, status, sort, page = 1, limit = 10 } = req.query;
    let query = { isDeleted: { $ne: true } };

    // Search by Name or Email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by Department, Role, Status
    if (department) query.department = department;
    if (role) query.role = role;
    if (status) query.status = status;

    // Sorting
    let sortQuery = { createdAt: -1 };
    if (sort === 'Joining Date') sortQuery = { joiningDate: -1 };
    if (sort === 'Name') sortQuery = { firstName: 1, lastName: 1 };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const employees = await Employee.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .select('-password');

    const total = await Employee.countDocuments(query);

    res.json({
      employees,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');

    if (employee) {
      // Logic for standard employee: can only view own profile
      if (req.employee.role === 'Employee' && req.employee._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to view this profile' });
      }
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Super Admin, HR Manager)
export const createEmployee = async (req, res) => {
  try {
    const { employeeId, firstName, lastName, email, password, phone, department, designation, salary, joiningDate, role } = req.body;

    const employeeExists = await Employee.findOne({ $or: [{ email }, { employeeId }] });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee with this email or ID already exists' });
    }

    if (req.employee.role === 'HR Manager' && role === 'Super Admin') {
      return res.status(403).json({ message: 'HR Manager cannot create Super Admin' });
    }

    let profileImage = null;
    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      password,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      role: role || 'Employee',
      reportingManager: req.body.reportingManager === '' ? null : req.body.reportingManager,
      profileImage,
    });

    if (employee) {
      res.status(201).json({ message: 'Employee created successfully' });
    } else {
      res.status(400).json({ message: 'Invalid employee data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      // Access Control
      if (req.employee.role === 'Employee' && req.employee._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this profile' });
      }

      if (req.employee.role === 'HR Manager' && employee.role === 'Super Admin') {
        return res.status(403).json({ message: 'HR Manager cannot modify Super Admin' });
      }

      employee.firstName = req.body.firstName || employee.firstName;
      employee.lastName = req.body.lastName || employee.lastName;
      employee.phone = req.body.phone || employee.phone;
      
      // Only Admin and HR can update sensitive fields
      if (req.employee.role !== 'Employee') {
        employee.department = req.body.department || employee.department;
        employee.designation = req.body.designation || employee.designation;
        employee.salary = req.body.salary || employee.salary;
        employee.joiningDate = req.body.joiningDate || employee.joiningDate;
        employee.status = req.body.status || employee.status;

        if (req.body.reportingManager !== undefined) {
          const newManagerId = req.body.reportingManager === '' ? null : req.body.reportingManager;
          if (newManagerId && newManagerId !== employee.reportingManager?.toString()) {
            if (newManagerId === employee._id.toString()) {
              return res.status(400).json({ message: 'Employee cannot be their own manager' });
            }
            const isCircular = await checkCircularReporting(employee._id, newManagerId);
            if (isCircular) {
              return res.status(400).json({ message: 'Circular reporting loop detected' });
            }
          }
          employee.reportingManager = newManagerId;
        }
        
        // HR cannot assign Super Admin role
        if (req.body.role) {
          if (req.employee.role === 'HR Manager' && req.body.role === 'Super Admin') {
            return res.status(403).json({ message: 'HR cannot assign Super Admin role' });
          }
          employee.role = req.body.role;
        }
      }

      if (req.body.password) {
        employee.password = req.body.password;
      }

      if (req.file) {
        employee.profileImage = `/uploads/${req.file.filename}`;
      }

      const updatedEmployee = await employee.save();
      res.json({ message: 'Employee updated successfully' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee (Soft Delete)
// @route   DELETE /api/employees/:id
// @access  Private (Super Admin only)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      if (employee.role === 'Super Admin') {
        return res.status(403).json({ message: 'Cannot delete a Super Admin' });
      }

      employee.isDeleted = true;
      employee.status = 'Inactive';
      await employee.save();

      res.json({ message: 'Employee removed' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get direct reportees of an employee
// @route   GET /api/employees/:id/reportees
// @access  Private
export const getReportees = async (req, res) => {
  try {
    const reportees = await Employee.find({ reportingManager: req.params.id, isDeleted: { $ne: true } }).select('-password');
    res.json(reportees);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Bulk import employees from CSV
// @route   POST /api/employees/bulk-import
// @access  Private (Super Admin, HR Manager)
export const bulkImportEmployees = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CSV file' });
  }

  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        let importedCount = 0;
        
        for (const [index, row] of results.entries()) {
          try {
            // Very basic validation
            if (!row.firstName || !row.lastName || !row.email) {
              errors.push(`Row ${index + 2}: Missing required fields (firstName, lastName, or email)`);
              continue;
            }

            // Check if exists
            const exists = await Employee.findOne({ email: row.email });
            if (exists) {
              errors.push(`Row ${index + 2}: Email ${row.email} already exists`);
              continue;
            }

            let managerId = null;
            if (row.managerEmail) {
              const manager = await Employee.findOne({ email: row.managerEmail, isDeleted: { $ne: true } });
              if (manager) {
                managerId = manager._id;
              } else {
                errors.push(`Row ${index + 2}: Manager with email ${row.managerEmail} not found (setting to null)`);
              }
            }

            const validRoles = ['Super Admin', 'HR Manager', 'Employee'];
            const assignedRole = validRoles.includes(row.role) ? row.role : 'Employee';

            await Employee.create({
              employeeId: row.employeeId || `EMP${Date.now()}${index}`,
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              password: 'Password@123', // Default password for imported users
              department: row.department || undefined,
              designation: row.designation || undefined,
              salary: row.salary ? Number(row.salary) : undefined,
              reportingManager: managerId,
              role: assignedRole,
              status: 'Active'
            });

            importedCount++;
          } catch (err) {
            console.error(err);
            errors.push(`Row ${index + 2}: Failed to insert - ${err.message}`);
          }
        }
        
        // Cleanup uploaded file
        fs.unlinkSync(req.file.path);
        
        res.status(200).json({
          message: `Successfully imported ${importedCount} employees`,
          errors: errors.length > 0 ? errors : undefined
        });
      } catch (err) {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error processing CSV file' });
      }
    });
};

// Recursive function to check for circular reporting
async function checkCircularReporting(employeeId, newManagerId) {
  if (employeeId.toString() === newManagerId.toString()) return true;
  
  let currentManagerId = newManagerId;
  while (currentManagerId) {
    const manager = await Employee.findById(currentManagerId);
    if (!manager || !manager.reportingManager) break;
    
    if (manager.reportingManager.toString() === employeeId.toString()) {
      return true; // Circular dependency found
    }
    currentManagerId = manager.reportingManager;
  }
  return false;
};

// @desc    Assign manager to an employee
// @route   PATCH /api/employees/:id/manager
// @access  Private (Super Admin, HR Manager)
export const assignManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const employeeId = req.params.id;

    if (!managerId) {
       const emp = await Employee.findById(employeeId);
       if(emp) {
         emp.reportingManager = null;
         await emp.save();
         return res.json({ message: 'Manager removed successfully' });
       }
       return res.status(404).json({ message: 'Employee not found' });
    }

    if (employeeId === managerId) {
      return res.status(400).json({ message: 'Employee cannot be their own manager' });
    }

    const isCircular = await checkCircularReporting(employeeId, managerId);
    if (isCircular) {
      return res.status(400).json({ message: 'Circular reporting detected. Assignment failed.' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.employee.role === 'HR Manager' && employee.role === 'Super Admin') {
      return res.status(403).json({ message: 'HR Manager cannot modify Super Admin hierarchy' });
    }

    employee.reportingManager = managerId;
    await employee.save();

    res.json({ message: 'Manager assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
