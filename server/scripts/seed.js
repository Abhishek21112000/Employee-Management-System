import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from '../models/Employee.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');

    // Check if Super Admin already exists
    const adminExists = await Employee.findOne({ email: 'admin@ems.com' });

    if (adminExists) {
      console.log('Super Admin already exists. Exiting...');
      process.exit(0);
    }

    const superAdmin = {
      employeeId: 'EMP-001',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@ems.com',
      password: 'Admin@123',
      role: 'Super Admin',
      status: 'Active',
    };

    await Employee.create(superAdmin);
    console.log('Super Admin seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error with seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
