import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { apiGet } from '../api/client';
import { relTime } from '../utils/time';
import type { AgentStatus, AgentStatusResponse } from '../api/types';

/* ── Display map for the five known slugs ── */

const SLUG_LABELS: Record<string, string> = {
  estimating: 'Estimating',
  dispatcher: 'Dispatcher',
  collections: 'Collections',
  reviews: 'Reviews',
  permits: 'Permits',
};

function humanize(slug: string): string {
  if (SLUG_LABELS[slug]) return SLUG_LABELS[slug];
  return slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Status pill colours ── */

type PillStyle = { bg: string; fg: string };

function pillColors(status: string | null): PillStyle {
  switch (status) {
    case 'success':
      return { bg: C.greenSoft, fg: C.green };
    case 'running':
      return { bg: C.amberSoft, fg: C.amber };
    case 'failed':
      return { bg: '#FDECEA', fg: C.red };
    default:
      return { bg: C.inset, fg: C.faded };
  }
}

function pillLabel(status: string | null): string {
  if (!status) return 'idle';
  return status;
}

/* ── Agent icon per slug ── */

const SLUG_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  estimating: 'calculator-outline',
  dispatcher: 'navigate-outline',
  collections: 'cash-outline',
  reviews: 'star-outline',
  permits: 'document-text-outline',
};

function iconFor(slug: string): keyof typeof Ionicons.glyphMap {
  return SLUG_ICONS[slug] ?? 'sparkles-outline';
}

/* ── Screen ── */

export default function AgentsScreen() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await apiGet<AgentStatusResponse>(
        '/v1/operator-package/agents/status',
      );
      setAgents(res.agents);
    } catch {
      // keep stale data
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetch();
      setLoading(false);
    })();
  }, [fetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.h1}>Agents</Text>
        <Text style={styles.subtitle}>
          AI agents that run on your behalf — estimating, dispatching, and more.
        </Text>
      </View>

      {loading && agents.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.ink} />
        </View>
      ) : agents.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="sparkles-outline" size={24} color={C.faded} />
          </View>
          <Text style={styles.emptyText}>
            No agent data yet. Agents will appear here once they start running.
          </Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AGENTS</Text>
          <View style={styles.card}>
            {agents.map((agent, idx) => (
              <AgentRow
                key={agent.agent_slug}
                agent={agent}
                isLast={idx === agents.length - 1}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

/* ── Row ── */

function AgentRow({
  agent,
  isLast,
}: {
  agent: AgentStatus;
  isLast: boolean;
}) {
  const pill = pillColors(agent.last_run_status);

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.iconWrap}>
        <Ionicons name={iconFor(agent.agent_slug)} size={18} color={C.ink2} />
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.agentName} numberOfLines={1}>
            {humanize(agent.agent_slug)}
          </Text>
          <View style={[styles.pill, { backgroundColor: pill.bg }]}>
            <Text style={[styles.pillText, { color: pill.fg }]}>
              {pillLabel(agent.last_run_status)}
            </Text>
          </View>
        </View>

        {agent.last_run_summary ? (
          <Text style={styles.summary} numberOfLines={2}>
            {agent.last_run_summary}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {agent.runs_last_7d} run{agent.runs_last_7d === 1 ? '' : 's'} this
            week
          </Text>
          {agent.last_run_at ? (
            <>
              <Text style={styles.metaDot}> · </Text>
              <Text style={styles.metaText}>
                {relTime(agent.last_run_at)}
              </Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/* ── Styles ── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 18,
  },
  h1: {
    fontSize: 28,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyCard: {
    padding: 24,
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.inset,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.inset,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
    flex: 1,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  summary: {
    fontSize: 13,
    color: C.ink2,
    marginTop: 4,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    fontSize: 11,
    color: C.faded,
  },
  metaDot: {
    fontSize: 11,
    color: C.faded,
  },
});
