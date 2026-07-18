import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import EmployeesPage from './pages/EmployeesPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import OrganizationTree from './pages/OrganizationTree';

const queryClient = new QueryClient();

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'Employee') {
    return <Navigate to={`/employees/${user._id}`} replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  {/* Admin and HR routes */}
                  <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'HR Manager']} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/employees/new" element={<EmployeeFormPage />} />
                    <Route path="/organization" element={<OrganizationTree />} />
                  </Route>
                  
                  {/* Shared routes */}
                  <Route path="/employees/:id" element={<EmployeeProfilePage />} />
                  <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
                  <Route path="/" element={<DashboardRedirect />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
