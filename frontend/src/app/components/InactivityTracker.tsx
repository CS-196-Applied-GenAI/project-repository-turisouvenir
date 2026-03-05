/**
 * Tracks user activity and logs out after inactivity (e.g. on a public browser).
 * Renders nothing; only runs when user is logged in.
 */

import { useAuth } from '../contexts/AuthContext';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

export function InactivityTracker() {
  const { user, logout } = useAuth();

  useInactivityTimeout(!!user, () => {
    logout();
    window.location.href = '/';
  });

  return null;
}
