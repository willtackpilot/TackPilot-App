import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import type { FinancesPageResponse } from '../api/types';

interface UseFinancesOptions {
  limit?: number;
}

export function useFinances(options: UseFinancesOptions = {}) {
  const { limit = 50 } = options;

  const [data, setData] = useState<FinancesPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ invoice_limit: String(limit) });
      const res = await apiGet<FinancesPageResponse>(
        `/v1/finances?${params.toString()}`,
      );
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load finances');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
