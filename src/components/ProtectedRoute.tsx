import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  // Mientras carga, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1221] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-green animate-spin" />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere admin pero no es admin, redirigir a home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Todo OK, renderizar children
  return <>{children}</>;
};
