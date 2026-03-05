/**
 * Inactivity timeout for public browser safety.
 * Logs out the user after a period of no activity (mouse, keyboard, touch, scroll).
 */

import { useEffect, useRef, useCallback } from 'react';

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const;

export const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes

export function useInactivityTimeout(
  isActive: boolean,
  onTimeout: () => void,
  delayMs: number = INACTIVITY_MS
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!isActive) return;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      onTimeoutRef.current();
    }, delayMs);
  }, [isActive, delayMs]);

  useEffect(() => {
    if (!isActive) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    resetTimer();

    const handleActivity = () => resetTimer();

    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, handleActivity);
    }

    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, handleActivity);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isActive, resetTimer]);
}
