import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  TrendingUp, 
  LogOut, 
  Menu, 
  X, 
  Briefcase, 
  DollarSign, 
  BarChart3,
  UserCircle
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  key?: string;
}

const SidebarItem = ({ to, icon, label, active, onClick }: SidebarItemProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth);
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/hr', icon: <Users size={20} />, label: 'Human Resources' },
    { to: '/inventory', icon: <Package size={20} />, label: 'Inventory' },
    { to: '/sales', icon: <TrendingUp size={20} />, label: 'Sales & Marketing' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-2 py-4 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Briefcase className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ConstructPro</h1>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const { to, icon, label } = item;
              return (
                <SidebarItem
                  key={to}
                  to={to}
                  icon={icon}
                  label={label}
                  active={location.pathname === to}
                  onClick={() => setIsSidebarOpen(false)}
                />
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 text-slate-500">
              <UserCircle size={20} />
              <span className="text-sm truncate font-medium">Demo User</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enterprise Edition</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
