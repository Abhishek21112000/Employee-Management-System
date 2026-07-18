import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  salary: z.coerce.number().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  role: z.enum(['Super Admin', 'HR Manager', 'Employee']).optional(),
  joiningDate: z.string().optional(),
  reportingManager: z.string().optional().nullable(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

const EmployeeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      status: 'Active',
      role: 'Employee',
      reportingManager: '',
    },
  });

  useEffect(() => {
    // Fetch all employees for manager dropdown
    const fetchEmployeesList = async () => {
      try {
        const { data } = await api.get('/employees?limit=1000');
        setEmployeesList(data.employees || []);
      } catch (error) {
        console.error('Failed to fetch managers list for dropdown', error);
      }
    };
    fetchEmployeesList();

    if (isEdit) {
      const fetchEmployee = async () => {
        try {
          const { data } = await api.get(`/employees/${id}`);
          if (data.joiningDate) {
            data.joiningDate = new Date(data.joiningDate).toISOString().split('T')[0];
          }
          if (!data.reportingManager) {
            data.reportingManager = '';
          }
          reset(data);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to load employee');
        }
      };
      fetchEmployee();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: EmployeeFormValues) => {
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value !== '' || key === 'reportingManager') {
            formData.append(key, value.toString());
          }
        }
      });

      if (file) {
        formData.append('profileImage', file);
      }

      if (isEdit) {
        await api.put(`/employees/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        if (!data.password) {
          setError('Password is required for new employee');
          return;
        }
        await api.post('/employees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/employees');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const isHR = user?.role === 'HR Manager';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
      
      {error && (
        <div className="mb-6 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit as any)} className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID *</Label>
            <Input id="employeeId" {...register('employeeId')} disabled={isEdit} />
            {errors.employeeId && <p className="text-destructive text-xs">{errors.employeeId.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} disabled={isEdit} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" {...register('firstName')} />
            {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" {...register('lastName')} />
            {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password {isEdit ? '(Leave blank to keep)' : '*'}</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...register('department')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" {...register('designation')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input id="salary" type="number" {...register('salary')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joiningDate">Joining Date</Label>
            <Input id="joiningDate" type="date" {...register('joiningDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              {...register('status')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              {...register('role')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Employee">Employee</option>
              <option value="HR Manager">HR Manager</option>
              {!isHR && <option value="Super Admin">Super Admin</option>}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reportingManager">Reporting Manager</Label>
            <select
              id="reportingManager"
              {...register('reportingManager')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">None</option>
              {employeesList
                .filter(e => e._id !== id) // Can't be their own manager
                .map(e => (
                  <option key={e._id} value={e._id}>
                    {e.firstName} {e.lastName} ({e.employeeId})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profileImage">Profile Image</Label>
          <Input 
            id="profileImage" 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeFormPage;
