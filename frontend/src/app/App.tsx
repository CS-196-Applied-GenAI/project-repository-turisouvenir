import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { InactivityTracker } from './components/InactivityTracker';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <InactivityTracker />
      <div className="size-full min-h-screen dark">
        <RouterProvider router={router} />
        <Toaster position="top-center" theme="dark" />
      </div>
    </AuthProvider>
  );
}