import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import {
  LayoutDashboard,
  Users,
  Network,
  LogOut,
  Menu,
  Sun,
  Moon,
  User as UserIcon,
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'HR Manager'] },
    { name: 'Employees', href: '/employees', icon: Users, roles: ['Super Admin', 'HR Manager'] },
    { name: 'Organization Tree', href: '/organization', icon: Network, roles: ['Super Admin', 'HR Manager'] },
    { name: 'My Profile', href: `/employees/${user?._id}`, icon: UserIcon, roles: ['Employee', 'Super Admin', 'HR Manager'] },
  ];

  const filteredNav = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
            <span className="text-xl font-bold text-primary tracking-tight">EMS Portal</span>
          </div>
          
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
            {filteredNav.map((item) => {
              const isActive = location.pathname.startsWith(item.href) && item.href !== '/dashboard' 
                ? true 
                : location.pathname === item.href;

              return (
                <div
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user?.firstName?.[0]}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.role}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-2 justify-start text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="-ml-2">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold text-primary flex-1">EMS Portal</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        {/* Desktop Theme Toggle (Floating) */}
        <div className="hidden lg:flex absolute top-4 right-8 z-50">
          <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full shadow-sm bg-card">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
