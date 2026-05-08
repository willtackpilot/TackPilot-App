import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import type { CalendarEvent } from '../api/types';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<CalendarEvent[]>('/v1/calendar/events');
      setEvents(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, loading, error, refetch };
}
