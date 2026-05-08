import { useMemo } from 'react';
import { useCrew } from './useCrew';

export function useThreadList() {
  const { crew, loading, error, refetch } = useCrew();

  const threads = useMemo(() => {
    return [...crew].sort((a, b) => {
      const ta = a.last_message_date ? new Date(a.last_message_date).getTime() : 0;
      const tb = b.last_message_date ? new Date(b.last_message_date).getTime() : 0;
      return tb - ta;
    });
  }, [crew]);

  const totalUnread = useMemo(
    () => crew.reduce((sum, c) => sum + (c.unread_messages_count ?? 0), 0),
    [crew],
  );

  return { threads, totalUnread, loading, error, refetch };
}
