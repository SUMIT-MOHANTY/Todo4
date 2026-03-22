import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * A wrapper component that protects routes from unauthenticated access
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const [checking, setChecking] = React.useState(true);
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify token is valid (not expired, properly signed)
        const authStatus = await isAuthenticated();
        setAuthorized(authStatus);
      } catch (error) {
        console.error("Authentication verification failed:", error);
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return <LoadingSpinner />;
  }

  return authorized ? <>{children}</> : <Navigate to={redirectTo} />;
};

export default ProtectedRoute;
