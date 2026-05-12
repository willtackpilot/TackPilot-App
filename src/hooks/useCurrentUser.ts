import { useAuth } from '../context/AuthContext';
import type { User } from '../api/types';

/**
 * Thin selector over AuthContext. Components that need only the user
 * profile (TopBar, future settings screens) should import this rather
 * than the full useAuth surface.
 */
export function useCurrentUser(): {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { currentUser, isLoading, refreshUser } = useAuth();
  return {
    user: currentUser,
    loading: isLoading,
    refresh: refreshUser,
  };
}
