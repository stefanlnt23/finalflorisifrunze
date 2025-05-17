
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Redirect } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
  [key: string]: any;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  adminOnly = false,
  ...rest
}) => {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Redirect to="/admin/login" />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
