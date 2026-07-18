import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Edit, Trash2, Search, Upload, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginatedResponse {
  employees: Employee[];
  page: number;
  pages: number;
  total: number;
}

const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Debounced search logic could be added here, using raw search for simplicity right now
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    ...(search && { search }),
    ...(role && { role }),
    ...(status && { status }),
    ...(department && { department }),
    ...(sort && { sort }),
  }).toString();

  const fetchEmployees = async (): Promise<PaginatedResponse> => {
    const { data } = await api.get(`/employees?${queryParams}`);
    return data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['employees', page, search, role, status, department, sort],
    queryFn: fetchEmployees,
    placeholderData: keepPreviousData,
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        refetch();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting employee');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/employees/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      let alertMsg = res.data.message;
      if (res.data.errors && res.data.errors.length > 0) {
        alertMsg += '\n\nErrors:\n' + res.data.errors.slice(0, 5).join('\n');
        if (res.data.errors.length > 5) alertMsg += `\n...and ${res.data.errors.length - 5} more errors.`;
      }
      
      alert(alertMsg);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error uploading CSV');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const canCreate = user?.role === 'Super Admin' || user?.role === 'HR Manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        {canCreate && (
          <div className="flex gap-2">
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" /> {isUploading ? 'Uploading...' : 'Import CSV'}
            </Button>
            <Link to="/employees/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-2 overflow-x-auto pb-2 md:pb-0">
          <select 
            className="h-9 rounded-md border border-input bg-transparent dark:bg-card px-3 text-sm shadow-sm"
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
          >
            <option value="">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="HR Manager">HR Manager</option>
            <option value="Employee">Employee</option>
          </select>

          <Input
            placeholder="Department..."
            className="h-9 w-32"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
          />

          <select 
            className="h-9 rounded-md border border-input bg-transparent dark:bg-card px-3 text-sm shadow-sm"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select 
            className="h-9 rounded-md border border-input bg-transparent dark:bg-card px-3 text-sm shadow-sm"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="">Sort By</option>
            <option value="Name">Name (A-Z)</option>
            <option value="Joining Date">Joining Date</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading employees...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-destructive">Error loading data.</td>
                </tr>
              ) : data?.employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No employees found matching criteria.</td>
                </tr>
              ) : (
                data?.employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                          {emp.profileImage ? (
                            <img src={emp.profileImage} alt={emp.firstName} className="h-full w-full object-cover" />
                          ) : (
                            emp.firstName?.[0] ?? '?'
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{emp.firstName} {emp.lastName}</div>
                          <div className="text-muted-foreground text-xs">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${emp.role === 'Super Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                        ${emp.role === 'HR Manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                        ${emp.role === 'Employee' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : ''}
                      `}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emp.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{emp.department || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/employees/${emp._id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        
                        {(user?.role === 'Super Admin' || (user?.role === 'HR Manager' && emp.role !== 'Super Admin')) && (
                          <Link to={`/employees/${emp._id}/edit`}>
                            <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}

                        {user?.role === 'Super Admin' && emp.role !== 'Super Admin' && (
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(emp._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{((data.page - 1) * 10) + 1}</span> to <span className="font-medium">{Math.min(data.page * 10, data.total)}</span> of <span className="font-medium">{data.total}</span> employees
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={data.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={data.page === data.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
