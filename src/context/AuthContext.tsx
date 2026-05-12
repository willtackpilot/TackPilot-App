import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { apiGet, ApiError, setAuthFailureHandler } from '../api/client';
import { secureStore } from '../api/secureStore';
import type { User } from '../api/types';

const STORAGE_KEYS = {
  jwt: 'jwt',
  refresh: 'refreshToken',
} as const;

const ME_PATH = '/v1/auth/me';

interface AuthContextType {
  /** True only during initial bootstrap or signIn-in-progress. */
  isLoading: boolean;
  token: string | null;
  currentUser: User | null;
  /**
   * Resolves to `{ success: true }` when both tokens are persisted AND the
   * profile fetch lands. On failure the stored tokens are rolled back so
   * the user remains in the unauthenticated branch.
   */
  signIn: (
    access: string,
    refresh?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  /** Best-effort, doesn't toggle isLoading. Silent on non-401 failures. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  token: null,
  currentUser: null,
  signIn: async () => ({ success: false, error: 'AuthContext not mounted' }),
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  // Best-effort /me. Returns the user or null. On 401 the API client's
  // refresh interceptor either rotates the token (and we get the user)
  // or fires onAuthFailure which clears state — handled separately.
  const fetchMe = useCallback(async (): Promise<User | null> => {
    try {
      const user = await apiGet<User>(ME_PATH);
      return user;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        // The interceptor will clear via onAuthFailure; nothing to do here.
        return null;
      }
      // Network / 5xx / unparseable — surface as null without wiping.
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!tokenRef.current) return;
    const user = await fetchMe();
    if (user) setCurrentUser(user);
  }, [fetchMe]);

  // Bootstrap on mount: read stored token, fetch /me if present, settle
  // isLoading exactly once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await secureStore.getItem(STORAGE_KEYS.jwt);
      if (cancelled) return;
      if (!stored) {
        setIsLoading(false);
        return;
      }
      setToken(stored);
      const user = await fetchMe();
      if (cancelled) return;
      if (user) {
        setCurrentUser(user);
      } else {
        // Token exists but /me failed and onAuthFailure didn't fire
        // (i.e., not a 401 — likely network). Clear so we route to login.
        await secureStore.multiRemove([STORAGE_KEYS.jwt, STORAGE_KEYS.refresh]);
        setToken(null);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMe]);

  // Refresh on app foreground (best-effort, silent).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && tokenRef.current) {
        void refreshUser();
      }
    });
    return () => sub.remove();
  }, [refreshUser]);

  // Wire the API client's auth-failure handler to clear our state.
  useEffect(() => {
    setAuthFailureHandler(() => {
      setToken(null);
      setCurrentUser(null);
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const signIn = useCallback(
    async (
      access: string,
      refresh?: string,
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        await secureStore.setItem(STORAGE_KEYS.jwt, access);
        if (refresh) {
          await secureStore.setItem(STORAGE_KEYS.refresh, refresh);
        }
        setToken(access);
        // tokenRef has to point at the new token before apiGet hits it.
        tokenRef.current = access;
        const user = await fetchMe();
        if (!user) {
          // Roll back so the user lands on Login with an error.
          await secureStore.multiRemove([
            STORAGE_KEYS.jwt,
            STORAGE_KEYS.refresh,
          ]);
          setToken(null);
          tokenRef.current = null;
          return {
            success: false,
            error: 'Signed in but couldn’t load your profile. Try again.',
          };
        }
        setCurrentUser(user);
        return { success: true };
      } catch (e) {
        await secureStore.multiRemove([
          STORAGE_KEYS.jwt,
          STORAGE_KEYS.refresh,
        ]);
        setToken(null);
        tokenRef.current = null;
        return {
          success: false,
          error:
            e instanceof Error ? e.message : 'Sign in failed. Try again.',
        };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchMe],
  );

  const signOut = useCallback(async () => {
    await secureStore.multiRemove([STORAGE_KEYS.jwt, STORAGE_KEYS.refresh]);
    setToken(null);
    setCurrentUser(null);
    tokenRef.current = null;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        token,
        currentUser,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
