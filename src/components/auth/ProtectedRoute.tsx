
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthWrapper';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireOrgAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireOrgAdmin = false 
}) => {
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  try {
    const { user, isAdmin, isOrgAdmin, loading } = useAuth();

    // Use effect to delay showing access denied to prevent flashing
    useEffect(() => {
      if (!loading && (!user || (requireAdmin && !isAdmin) || (requireOrgAdmin && !isOrgAdmin && !isAdmin))) {
        const timer = setTimeout(() => setShowAccessDenied(true), 100);
        return () => clearTimeout(timer);
      }
    }, [loading, user, isAdmin, isOrgAdmin, requireAdmin, requireOrgAdmin]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    if (requireAdmin && !isAdmin) {
      if (showAccessDenied) {
        return <Navigate to="/" replace />;
      }
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Verifying permissions...</p>
          </div>
        </div>
      );
    }

    if (requireOrgAdmin && !isOrgAdmin && !isAdmin) {
      if (showAccessDenied) {
        return <Navigate to="/" replace />;
      }
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Verifying permissions...</p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  } catch (error) {
    // If useAuth fails (context not available), redirect to auth
    console.error('Auth context not available:', error);
    return <Navigate to="/auth" replace />;
  }
};
