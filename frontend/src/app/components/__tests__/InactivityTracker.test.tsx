import React from 'react';
import { render } from '@testing-library/react';
import { InactivityTracker } from '../InactivityTracker';

const mockLogout = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

beforeEach(() => {
  mockLogout.mockClear();
  mockUseAuth.mockReturnValue({ user: { id: '1' }, logout: mockLogout });
  // Avoid redefining window.location; InactivityTracker only needs logout + assign. We just assert logout.
});

describe('InactivityTracker', () => {
  it('renders nothing', () => {
    const { container } = render(<InactivityTracker />);
    expect(container.firstChild).toBeNull();
  });

  it('does not call logout when user is null', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: mockLogout });
    render(<InactivityTracker />);
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
