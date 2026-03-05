import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="user">{auth.user ? auth.user.username : 'none'}</span>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <button onClick={() => auth.login('u', 'p')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.updateUser({ username: 'updated' })}>Update</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it('throws when useAuth is outside AuthProvider', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(<TestConsumer />);
    } catch {
      // React may rethrow in some environments
    }
    const hadExpectedError = errSpy.mock.calls.some((call) =>
      call.some((arg: unknown) => String(arg).includes('useAuth must be used within AuthProvider'))
    );
    expect(hadExpectedError).toBe(true);
    errSpy.mockRestore();
  });

  it('provides initial loading then null user when no stored auth', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('restores user from localStorage when token exists', async () => {
    localStorage.setItem('chirper_token', 't');
    localStorage.setItem(
      'chirper_user',
      JSON.stringify({
        id: '1',
        username: 'stored',
        email: 's@x.com',
        created_at: '',
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
      })
    );
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('stored');
    });
  });

  it('login updates user and localStorage', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          token: 'jwt',
          user: { id: 1, username: 'logged', email: 'l@x.com', bio: null, profile_picture_url: null, created_at: '', updated_at: '' },
          expiresAt: 1,
        }),
    });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    await userEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('logged');
    });
    expect(localStorage.getItem('chirper_user')).toContain('logged');
  });

  it('logout clears user and localStorage', async () => {
    localStorage.setItem('chirper_token', 't');
    localStorage.setItem('chirper_user', JSON.stringify({ id: '1', username: 'x', email: '', created_at: '', xp: 0, level: 1, streak: 0, badges: [] }));
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('x'));
    await userEvent.click(screen.getByText('Logout'));
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });
    expect(localStorage.getItem('chirper_user')).toBeNull();
  });

  it('updateUser merges updates and persists', async () => {
    localStorage.setItem('chirper_token', 't');
    localStorage.setItem(
      'chirper_user',
      JSON.stringify({ id: '1', username: 'before', email: '', created_at: '', xp: 0, level: 1, streak: 0, badges: [] })
    );
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('before'));
    await userEvent.click(screen.getByText('Update'));
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('updated');
    });
    expect(JSON.parse(localStorage.getItem('chirper_user')!).username).toBe('updated');
  });
});
