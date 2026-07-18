import request from 'supertest';
import express from 'express';
import { getEmployees, createEmployee, deleteEmployee } from '../controllers/employeeController.js';
import Employee from '../models/Employee.js';
import mongoose from 'mongoose';

// Setup basic express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware for tests
const mockProtect = (req, res, next) => {
  req.employee = { _id: new mongoose.Types.ObjectId(), role: 'Super Admin' };
  next();
};

app.get('/api/employees', mockProtect, getEmployees);
app.post('/api/employees', mockProtect, createEmployee);
app.delete('/api/employees/:id', mockProtect, deleteEmployee);

describe('Employee Controller', () => {
  let emp1;

  beforeEach(async () => {
    // Create a base employee for testing
    emp1 = await Employee.create({
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'Employee',
      status: 'Active'
    });
  });

  describe('GET /api/employees', () => {
    it('should fetch all non-deleted employees', async () => {
      const res = await request(app).get('/api/employees');
      
      expect(res.status).toBe(200);
      expect(res.body.employees.length).toBe(1);
      expect(res.body.employees[0].email).toBe('john@example.com');
    });
  });

  describe('POST /api/employees', () => {
    it('should create a new employee successfully', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({
          employeeId: 'EMP002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'password123',
          role: 'HR Manager'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Employee created successfully');

      // Verify in DB
      const newEmp = await Employee.findOne({ email: 'jane@example.com' });
      expect(newEmp).toBeTruthy();
      expect(newEmp.role).toBe('HR Manager');
    });

    it('should return 400 if email already exists', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({
          employeeId: 'EMP003',
          firstName: 'Duplicate',
          lastName: 'User',
          email: 'john@example.com', // Already exists
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Employee with this email or ID already exists');
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should soft delete an employee', async () => {
      const res = await request(app).delete(`/api/employees/${emp1._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Employee removed');

      // Verify it still exists in DB but is marked as deleted using native driver to bypass middleware
      const deletedEmp = await Employee.collection.findOne({ _id: emp1._id });
      expect(deletedEmp.isDeleted).toBe(true);
      expect(deletedEmp.status).toBe('Inactive');

      // Verify it doesn't show up in normal GET requests
      const getRes = await request(app).get('/api/employees');
      expect(getRes.body.employees.length).toBe(0);
    });
  });
});
