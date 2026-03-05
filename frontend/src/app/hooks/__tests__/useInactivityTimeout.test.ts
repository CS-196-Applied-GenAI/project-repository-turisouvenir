import { renderHook, act } from '@testing-library/react';
import { useInactivityTimeout } from '../useInactivityTimeout';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useInactivityTimeout', () => {
  it('does not call onTimeout when inactive', () => {
    const onTimeout = jest.fn();
    renderHook(() => useInactivityTimeout(false, onTimeout, 1000));
    jest.advanceTimersByTime(2000);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('calls onTimeout after delay when active and no activity', () => {
    const onTimeout = jest.fn();
    renderHook(() => useInactivityTimeout(true, onTimeout, 5000));
    jest.advanceTimersByTime(4999);
    expect(onTimeout).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('resets timer on activity', () => {
    const onTimeout = jest.fn();
    renderHook(() => useInactivityTimeout(true, onTimeout, 5000));
    jest.advanceTimersByTime(3000);
    act(() => {
      window.dispatchEvent(new Event('mousedown'));
    });
    jest.advanceTimersByTime(3000);
    expect(onTimeout).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('cleans up timer when becoming inactive', () => {
    const onTimeout = jest.fn();
    const { rerender } = renderHook(
      ({ active }) => useInactivityTimeout(active, onTimeout, 5000),
      { initialProps: { active: true } }
    );
    jest.advanceTimersByTime(2000);
    rerender({ active: false });
    jest.advanceTimersByTime(5000);
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
