import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

export function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛒 CustomerProtectedRoute check:', {
    isAuthenticated,
    user,
    userType: user?.userType,
    isLoading,
    currentPath: location.pathname
  });

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If authenticated and user is ADMIN, redirect to admin dashboard
  if (isAuthenticated && user?.userType === 'ADMIN') {
    console.log('❌ Admin trying to access customer route, redirecting to admin dashboard');
    return <Navigate to="/admin" replace />;
  }

  // If everything checks out (guest or customer), render the content
  console.log('✅ Access granted to customer route');
  return <>{children}</>;
}
