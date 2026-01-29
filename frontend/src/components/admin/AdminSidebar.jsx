import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart3, LogOut, ChevronRight, Settings, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', badge: null },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders', badge: '12' },
    { icon: Package, label: 'Products', path: '/admin/products', badge: null },
    { icon: Tag, label: 'Categories', path: '/admin/categories', badge: null },
    { icon: Users, label: 'Customers', path: '/admin/customers', badge: '6' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', badge: null },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/admin/help' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 left-4 z-50 bg-gradient-to-br from-primary to-secondary text-white p-2.5 rounded-lg shadow-lg hover:shadow-xl transition"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white w-64 transition-transform duration-300 z-40 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:shadow-xl transition transform group-hover:scale-110">
              👜
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ZARAARA</h1>
              <p className="text-xs text-slate-400 font-medium">Fashion Portal v1.0</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Main Menu */}
          <div className="mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-2 mb-2">Main Menu</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    active
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                  <span className="font-semibold text-sm flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition ${active ? 'opacity-100' : ''}`} />
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4"></div>

          {/* Bottom Menu */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-2 mb-2">Other</p>
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 group"
                >
                  <Icon size={20} className="text-slate-400 group-hover:text-slate-200" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent space-y-3">
          {/* Admin Info */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Logged in as</p>
            <p className="text-sm font-bold text-white">Admin Manager</p>
            <p className="text-xs text-slate-400">admin@fashion.com</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition text-red-400 hover:text-red-300 font-bold text-sm group border border-red-500/20 hover:border-red-500/50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-30 backdrop-blur-sm"
        />
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-30"
        />
      )}
    </>
  );
}
