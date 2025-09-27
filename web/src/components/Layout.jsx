import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Farmers', href: '/farmers', icon: UserGroupIcon },
  { name: 'Certificates', href: '/certificates', icon: DocumentCheckIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={classNames(
        sidebarOpen ? 'fixed inset-0 flex z-40 md:hidden' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-xl font-bold text-green-600">Agri Chain</h1>
          </div>
          <nav className="mt-5 flex-shrink-0 h-full divide-y divide-gray-200 overflow-y-auto">
            <div className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium border-l-4'
                  )}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-green-600">Agri Chain</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium border-l-4'
                  )}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <h2 className="text-lg font-medium text-gray-900 ml-3">
                      Agriculture Supply Chain Dashboard
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {user?.name || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}