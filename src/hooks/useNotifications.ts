import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';
import type { NotificationItem, NotificationListResponse } from '../api/types';

interface UseNotificationsOptions {
  skip?: number;
  limit?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { skip = 0, limit = 50 } = options;
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
      });
      const res = await apiGet<NotificationListResponse>(
        `/v1/notifications?${params.toString()}`,
      );
      setItems(res.items);
      setTotalCount(res.total_count);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [skip, limit]);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      await apiPost(`/v1/notifications/${id}/mark-read`);
    } catch {
      // Best-effort. The next refetch will reconcile.
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await apiPost('/v1/notifications/mark-read-bulk', {
        notification_ids: unreadIds,
      });
    } catch {
      // Best-effort.
    }
  }, [items]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const unreadCount = items.filter((n) => !n.is_read).length;

  return { items, totalCount, unreadCount, loading, error, refetch, markRead, markAllRead };
}
