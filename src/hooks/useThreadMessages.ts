import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';
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
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!contactId || !trimmed) return false;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: SubcontractorSMSResponse = {
        id: tempId,
        title: trimmed.slice(0, 50),
        description: trimmed,
        status: null,
        create_time: new Date().toISOString(),
        is_read: true,
      };

      setSendError(null);
      setSending(true);
      setMessages((prev) => [...prev, optimistic]);

      try {
        await apiPost(`/v1/subcontractor/${contactId}/sms`, {
          description: trimmed,
        });
        await refetch();
        return true;
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setSendError(e instanceof Error ? e.message : 'Failed to send');
        return false;
      } finally {
        setSending(false);
      }
    },
    [contactId, refetch],
  );

  const clearSendError = useCallback(() => setSendError(null), []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    messages,
    totalCount,
    loading,
    error,
    refetch,
    sendMessage,
    sending,
    sendError,
    clearSendError,
  };
}
