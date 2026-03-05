import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AuthScreen } from '../AuthScreen';
import { AuthProvider } from '../../contexts/AuthContext';

function renderAuthScreen() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthScreen />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.clear();
});

describe('AuthScreen', () => {
  it('renders login form by default', async () => {
    renderAuthScreen();
    expect(screen.getByPlaceholderText(/your_username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /let's go/i })).toBeInTheDocument();
  });

  it('shows register form when Sign Up is selected', async () => {
    renderAuthScreen();
    await userEvent.click(screen.getByText(/sign up/i));
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join chirper/i })).toBeInTheDocument();
  });

  it('toggles between login and register', async () => {
    renderAuthScreen();
    await userEvent.click(screen.getByText(/create an account/i));
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/sign in/i));
    expect(screen.getByRole('button', { name: /let's go/i })).toBeInTheDocument();
  });
});
