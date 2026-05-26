import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Calls `refetch` on a recurring interval while the app is foregrounded.
 * Pauses when the app backgrounds, resumes when it returns to foreground,
 * and fires once immediately on resume so stale data refreshes fast.
 *
 * Pass `intervalMs` of 0 (or omit `enabled=false`) to disable.
 */
export function usePolling(
  refetch: () => void,
  intervalMs: number,
  enabled: boolean = true,
): void {
  // Latest refetch ref so the interval always calls the freshest closure.
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let appState: AppStateStatus = AppState.currentState;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => refetchRef.current(), intervalMs);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    if (appState === 'active') start();

    const sub = AppState.addEventListener('change', (next) => {
      const wasInactive = appState !== 'active';
      appState = next;
      if (next === 'active') {
        // Refresh immediately on foreground so the user sees up-to-date
        // state without waiting a full interval.
        if (wasInactive) refetchRef.current();
        start();
      } else {
        stop();
      }
    });

    return () => {
      stop();
      sub.remove();
    };
  }, [intervalMs, enabled]);
}
