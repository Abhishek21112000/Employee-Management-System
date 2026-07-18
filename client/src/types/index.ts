export type Role = 'Super Admin' | 'HR Manager' | 'Employee';
export type Status = 'Active' | 'Inactive';

export interface User {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  profileImage: string | null;
  token?: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  salary?: number;
  joiningDate?: string;
  status: Status;
  role: Role;
  reportingManager?: string | null | Employee;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}
