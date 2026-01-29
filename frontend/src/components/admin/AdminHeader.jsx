import React, { useState } from 'react';
import { Bell, Search, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function AdminHeader() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  return (
    <header className={`border-b shadow-sm sticky top-0 z-30 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between p-6 ml-0 md:ml-64">
        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search orders, products, customers..."
              className={`w-full pl-12 pr-4 py-2.5 border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-medium text-sm ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Notifications */}
          <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition group">
            <Bell size={22} className="text-slate-600 group-hover:text-primary transition" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Settings */}
          <Link to="/admin/settings" className={`p-2.5 rounded-xl transition group ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
            <Settings size={22} className={`group-hover:text-primary transition ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
          </Link>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-xl transition group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-900">Admin</p>
                <p className="text-xs text-slate-500">Manager</p>
              </div>
              <ChevronDown size={16} className={`text-slate-600 transition ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50 ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                {/* Profile Info */}
                <div className={`p-4 border-b ${
                  theme === 'dark' 
                    ? 'bg-slate-700/50 border-slate-700' 
                    : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
                }`}>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Admin Manager</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>admin@fashionwebsite.com</p>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition group ${
                    theme === 'dark' 
                      ? 'text-slate-300 hover:bg-slate-700' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}>
                    <User size={18} className={`group-hover:text-primary ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
                    My Profile
                  </button>
                  <Link to="/admin/settings" className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition group ${
                    theme === 'dark' 
                      ? 'text-slate-300 hover:bg-slate-700' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}>
                    <Settings size={18} className={`group-hover:text-primary ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
                    Settings
                  </Link>
                </div>

                {/* Logout */}
                <div className={`border-t p-2 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition group"
                  >
                    <LogOut size={18} className="text-red-600" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
