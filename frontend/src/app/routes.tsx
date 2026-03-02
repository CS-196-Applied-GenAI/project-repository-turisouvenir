import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { AuthScreen } from './screens/AuthScreen';
import { FeedScreen } from './screens/FeedScreen';
import { ChirpDetailScreen } from './screens/ChirpDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';
import { ProtectedRoute } from './components/ProtectedRoute';

function AuthGuard() {
  return (
    <ProtectedRoute requireAuth={false}>
      <AuthScreen />
    </ProtectedRoute>
  );
}

function AppLayout() {
  return (
    <ProtectedRoute requireAuth>
      <Outlet />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/feed', element: <FeedScreen /> },
      { path: '/chirp/:id', element: <ChirpDetailScreen /> },
      { path: '/profile', element: <ProfileScreen /> },
      { path: '/user/:username', element: <UserProfileScreen /> },
      { path: '/explore', element: <ExploreScreen /> },
      { path: '/notifications', element: <NotificationsScreen /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundScreen />,
  },
]);
