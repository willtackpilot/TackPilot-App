import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import type { Job, JobListResponse } from '../api/types';

interface UseJobsOptions {
  skip?: number;
  limit?: number;
}

export function useJobs(options: UseJobsOptions = {}) {
  const { skip = 0, limit = 50 } = options;

  const [jobs, setJobs] = useState<Job[]>([]);
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
      const res = await apiGet<JobListResponse>(
        `/v1/job/list?${params.toString()}`,
      );
      setJobs(res.items);
      setTotalCount(res.total_count);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [skip, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { jobs, totalCount, loading, error, refetch };
}
