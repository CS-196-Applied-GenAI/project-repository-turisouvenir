import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthProvider } from '../../contexts/AuthContext';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', state: null }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
  localStorage.clear();
  global.fetch = jest.fn();
});

describe('ProtectedRoute', () => {
  it('does not show protected content when requireAuth and no user', async () => {
    render(
      <AuthProvider>
        <ProtectedRoute requireAuth={true}>
          <div>Protected content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('shows children when requireAuth and user exists', async () => {
    localStorage.setItem('chirper_token', 't');
    localStorage.setItem(
      'chirper_user',
      JSON.stringify({
        id: '1',
        username: 'u',
        email: '',
        created_at: '',
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
      })
    );
    render(
      <AuthProvider>
        <ProtectedRoute requireAuth={true}>
          <div>Protected content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Protected content')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
