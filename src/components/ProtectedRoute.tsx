import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'ADMIN' | 'CUSTOMER';
}

export function ProtectedRoute({ children, requiredUserType = 'ADMIN' }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    user,
    userType: user?.userType,
    requiredUserType,
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

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log('❌ Not authenticated, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated but wrong user type
  if (user.userType !== requiredUserType) {
    console.log('❌ Wrong user type, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // If everything checks out, render the protected content
  console.log('✅ Access granted to protected route');
  return <>{children}</>;
}
