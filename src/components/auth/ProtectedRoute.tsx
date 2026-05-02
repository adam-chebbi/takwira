import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { PageLoader } from '@/src/components/ui/PageLoader';
import { UserRole } from '@/src/lib/schema';
import { useToast } from '@/src/components/ui/Toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (requiredRole === 'manager' && role !== 'manager' && role !== 'admin') {
    toast("Accès réservé aux gérants", 'error');
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'admin' && role !== 'admin') {
    toast("Accès administrateur requis", 'error');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="manager">{children}</ProtectedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);
