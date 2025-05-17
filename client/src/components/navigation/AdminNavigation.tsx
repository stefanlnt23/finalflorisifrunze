import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  LayoutList,
  Settings,
  Package,
  Calendar,
  Mail,
  FileText,
  Grid,
  LogOut,
  Award
} from 'lucide-react';

export default function AdminNavigation() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  return (
    <aside className="w-64 bg-white shadow-md hidden md:block">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Flori și Frunze</p>
      </div>

      <nav className="py-4">
        <ul className="space-y-1">
          <li>
            <button 
              onClick={() => navigateTo('/admin')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin') && !isActive('/admin/') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </button>
          </li>

          <li>
            <button
              onClick={() => navigateTo('/admin/services')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin/services') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutList className="h-5 w-5 mr-3" />
              Services
            </button>
          </li>

          <li>
            <button 
              onClick={() => navigateTo('/admin/subscriptions')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin/subscriptions') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="h-5 w-5 mr-3" />
              Subscriptions
            </button>
          </li>

          <li>
            <button
              onClick={() => navigateTo('/admin/appointments')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin/appointments') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-5 w-5 mr-3" />
              Appointments
            </button>
          </li>

          <li>
            <button
              onClick={() => navigateTo('/admin/inquiries')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin/inquiries') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Mail className="h-5 w-5 mr-3" />
              Inquiries
            </button>
          </li>

          <li>
            <button
              onClick={() => navigateTo('/admin/blog')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin/blog') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5 mr-3" />
              Blog Posts
            </button>
          </li>

          <li>
            <button
              onClick={() => navigateTo('/admin/portfolio')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin/portfolio') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-5 w-5 mr-3" />
              Portfolio
            </button>
          </li>

          <li>
            <button
              onClick={() => navigateTo('/admin/testimonials')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin/testimonials') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Award className="h-5 w-5 mr-3" />
              Testimonials
            </button>
          </li>

          <li>
            <button
              onClick={() => navigateTo('/admin/feature-cards')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin/feature-cards') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutList className="h-5 w-5 mr-3" />
              Feature Cards
            </button>
          </li>

          <li>
            <button
              onClick={() => navigateTo('/admin/front-page')}
              className={`flex items-center px-4 py-2 w-full text-left ${
                isActive('/admin/front-page') 
                  ? 'text-green-500 bg-green-50 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Front Page
            </button>
          </li>
        </ul>

        <div className="pt-4 mt-4 border-t">
          <button 
            onClick={logout}
            className="flex items-center px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}