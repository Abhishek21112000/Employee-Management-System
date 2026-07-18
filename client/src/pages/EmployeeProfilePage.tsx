import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import type { Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Edit, Mail, Phone, Calendar, Briefcase, Hash } from 'lucide-react';

const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reportees, setReportees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const { data } = await api.get(`/employees/${id}`);
        setEmployee(data);
        
        // Fetch reportees
        const { data: reporteesData } = await api.get(`/employees/${id}/reportees`);
        setReportees(reporteesData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeData();
  }, [id]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!employee) return <div>Employee not found</div>;

  const canEdit = user?.role === 'Super Admin' || (user?.role === 'HR Manager' && employee.role !== 'Super Admin');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        {canEdit && (
          <Link to={`/employees/${employee._id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Card */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm col-span-1 flex flex-col items-center text-center space-y-4">
          <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold overflow-hidden shadow-inner border-4 border-background">
            {employee.profileImage ? (
              <img src={`http://localhost:5000${employee.profileImage}`} alt={employee.firstName} className="h-full w-full object-cover" />
            ) : (
              employee.firstName[0]
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{employee.firstName} {employee.lastName}</h2>
            <p className="text-muted-foreground">{employee.designation || 'No Designation'}</p>
          </div>
          
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
            ${employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
          `}>
            {employee.status}
          </span>
          <span className="text-xs bg-secondary px-3 py-1 rounded-full">
            {employee.role}
          </span>
        </div>

        {/* Right Column - Details */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm col-span-1 md:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold border-b border-border pb-2">Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Hash className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Employee ID</p>
                <p className="font-medium">{employee.employeeId}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Phone</p>
                <p className="font-medium">{employee.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Department</p>
                <p className="font-medium">{employee.department || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Joining Date</p>
                <p className="font-medium">
                  {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Salary is only visible to HR and Admin, or the user themselves */}
            {(user?.role === 'Super Admin' || user?.role === 'HR Manager' || user?._id === employee._id) && (
              <div className="flex items-start gap-3">
                <span className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5 flex items-center justify-center font-bold">$</span>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Salary</p>
                  <p className="font-medium">{employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direct Reportees Section */}
      {reportees.length > 0 && (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
          <h3 className="text-lg font-semibold border-b border-border pb-2 flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" /> Direct Reportees
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reportees.map((reportee) => (
              <Link to={`/employees/${reportee._id}`} key={reportee._id} className="block group">
                <div className="border border-border p-4 rounded-lg flex items-center gap-4 transition-colors group-hover:border-primary/50 group-hover:bg-primary/5">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {reportee.profileImage ? (
                      <img src={`http://localhost:5000${reportee.profileImage}`} alt={reportee.firstName} className="h-full w-full object-cover" />
                    ) : (
                      reportee.firstName[0]
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{reportee.firstName} {reportee.lastName}</p>
                    <p className="text-xs text-muted-foreground">{reportee.designation}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfilePage;
