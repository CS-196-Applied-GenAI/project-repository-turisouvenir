import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * If requireAuth=true (default), redirects to / if not logged in.
 * If requireAuth=false, redirects to /feed if logged in (for auth screen).
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (isLoading) return;
    if (requireAuth && !user) {
      navigate('/', { replace: true });
    } else if (!requireAuth && user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/feed';
      navigate(from, { replace: true });
    }
  }, [user, isLoading, requireAuth, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (requireAuth && !user) return null;
  if (!requireAuth && user) return null;

  return <>{children}</>;
};
