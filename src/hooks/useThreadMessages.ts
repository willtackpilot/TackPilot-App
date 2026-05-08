import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import type {
  SubcontractorSMSListResponse,
  SubcontractorSMSResponse,
} from '../api/types';

interface UseThreadMessagesOptions {
  skip?: number;
  limit?: number;
}

export function useThreadMessages(
  contactId: string | null,
  options: UseThreadMessagesOptions = {},
) {
  const { skip = 0, limit = 100 } = options;

  const [messages, setMessages] = useState<SubcontractorSMSResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!contactId) {
      setMessages([]);
      setTotalCount(0);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
      });
      const res = await apiGet<SubcontractorSMSListResponse>(
        `/v1/subcontractor/${contactId}/sms?${params.toString()}`,
      );
      setMessages(res.items);
      setTotalCount(res.total_count);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [contactId, skip, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { messages, totalCount, loading, error, refetch };
}
