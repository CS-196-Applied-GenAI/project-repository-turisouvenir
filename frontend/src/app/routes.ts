import { createBrowserRouter } from 'react-router';
import { AuthScreen } from './screens/AuthScreen';
import { FeedScreen } from './screens/FeedScreen';
import { ChirpDetailScreen } from './screens/ChirpDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AuthScreen,
  },
  {
    path: '/feed',
    Component: FeedScreen,
  },
  {
    path: '/chirp/:id',
    Component: ChirpDetailScreen,
  },
  {
    path: '/profile',
    Component: ProfileScreen,
  },
  {
    path: '/user/:username',
    Component: UserProfileScreen,
  },
  {
    path: '/explore',
    Component: ExploreScreen,
  },
  {
    path: '/notifications',
    Component: NotificationsScreen,
  },
  {
    path: '*',
    Component: NotFoundScreen,
  },
]);