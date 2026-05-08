import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import type { Paginated, Subcontractor } from '../api/types';

interface UseCrewOptions {
  skip?: number;
  limit?: number;
}

export function useCrew(options: UseCrewOptions = {}) {
  const { skip = 0, limit = 50 } = options;

  const [crew, setCrew] = useState<Subcontractor[]>([]);
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
        order_by_asc: 'true',
      });
      const res = await apiGet<Paginated<Subcontractor>>(
        `/v1/subcontractor/list?${params.toString()}`,
      );
      setCrew(res.items);
      setTotalCount(res.total_count);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load crew');
    } finally {
      setLoading(false);
    }
  }, [skip, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { crew, totalCount, loading, error, refetch };
}
