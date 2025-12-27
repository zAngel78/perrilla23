import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  Zap,
  Tag,
  Key,
  Image,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin/dashboard',
    },
    {
      icon: Package,
      label: 'Productos',
      path: '/admin/products',
    },
    {
      icon: ShoppingCart,
      label: 'Órdenes',
      path: '/admin/orders',
      badge: '3',
    },
    {
      icon: Users,
      label: 'Usuarios',
      path: '/admin/users',
    },
    {
      icon: Tag,
      label: 'Cupones',
      path: '/admin/coupons',
    },
    {
      icon: Key,
      label: 'Keys Digitales',
      path: '/admin/digital-keys',
    },
    {
      icon: Image,
      label: 'Hero Slides',
      path: '/admin/hero-slides',
    },
    {
      icon: DollarSign,
      label: 'Monedas',
      path: '/admin/currencies',
    },
    {
      icon: Zap,
      label: 'Precios Fortnite',
      path: '/admin/fortnite-prices',
    },
    {
      icon: Mail,
      label: 'Cuentas Email',
      path: '/admin/email-accounts',
    },
    {
      icon: Settings,
      label: 'Configuración',
      path: '/admin/settings',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0b1221] flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#121a2b] border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-white font-black text-lg uppercase tracking-tight">
                  TioCalcifer
                </h2>
                <p className="text-brand-green text-xs font-bold uppercase tracking-wider">
                  Admin Panel
                </p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-green/20 rounded-full flex items-center justify-center">
                <span className="text-brand-green font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {user?.name}
                </p>
                <p className="text-gray-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-brand-green text-black'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'}
                  />
                  <span className="font-semibold text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Home size={20} />
              <span className="font-semibold text-sm">Ir a la Tienda</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              <span className="font-semibold text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay para móvil */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-[#121a2b] border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-white font-bold text-lg lg:text-xl uppercase tracking-tight">
                {menuItems.find((item) => item.path === location.pathname)?.label || 'Admin'}
              </h1>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications (placeholder) */}
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <div className="w-2 h-2 bg-brand-orange rounded-full absolute top-2 right-2" />
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {/* User Avatar (mobile only) */}
              <div className="lg:hidden w-8 h-8 bg-brand-green/20 rounded-full flex items-center justify-center">
                <span className="text-brand-green font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
