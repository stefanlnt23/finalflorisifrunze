
import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen grid place-items-center">Loading...</div>;
  }

  return isAuthenticated ? <Component {...rest} /> : <Redirect to="/admin/login" />;
};

export default ProtectedRoute;
