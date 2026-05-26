import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { C } from '../constants/theme';
import { apiGet, apiPatch } from '../api/client';
import type { NotificationPrefs } from '../api/types';

/* ── Pref key → label map ── */

type PrefKey = keyof NotificationPrefs;

type PrefRow = { key: PrefKey; label: string };

type PrefGroup = { title: string; rows: PrefRow[] };

const GROUPS: PrefGroup[] = [
  {
    title: 'CHANNELS',
    rows: [
      { key: 'sms_enabled', label: 'SMS Enabled' },
      { key: 'email_enabled', label: 'Email Enabled' },
    ],
  },
  {
    title: 'REPORTS',
    rows: [
      { key: 'daily_summary', label: 'Daily Summary' },
      { key: 'weekly_scorecard', label: 'Weekly Scorecard' },
    ],
  },
  {
    title: 'ALERTS',
    rows: [
      { key: 'reminders', label: 'Reminders' },
      { key: 'eod_prompt', label: 'EOD Prompt' },
      { key: 'dispatch_alerts', label: 'Dispatch Alerts' },
      { key: 'collections_alerts', label: 'Collections Alerts' },
      { key: 'review_requests', label: 'Review Requests' },
      { key: 'agent_actions', label: 'Agent Actions' },
    ],
  },
];

/* ── Screen ── */

export default function ChannelsScreen() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrefs = useCallback(async () => {
    try {
      const res = await apiGet<NotificationPrefs>(
        '/v1/user/notification-prefs',
      );
      setPrefs(res);
    } catch {
      // keep stale data
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchPrefs();
      setLoading(false);
    })();
  }, [fetchPrefs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPrefs();
    setRefreshing(false);
  }, [fetchPrefs]);

  const toggle = useCallback(
    (key: PrefKey) => {
      if (!prefs) return;

      // Optimistic update
      const next = { ...prefs, [key]: !prefs[key] };
      setPrefs(next);

      // Fire and forget — revert on error
      apiPatch<NotificationPrefs>('/v1/user/notification-prefs', next).catch(
        () => {
          setPrefs(prefs);
        },
      );
    },
    [prefs],
  );

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
        <Text style={styles.h1}>Channels</Text>
        <Text style={styles.subtitle}>
          Control how TackPilot reaches you — SMS, email, and in-app alerts.
        </Text>
      </View>

      {loading && !prefs ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.ink} />
        </View>
      ) : !prefs ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            Couldn't load your notification preferences. Pull down to retry.
          </Text>
        </View>
      ) : (
        GROUPS.map((group) => (
          <View key={group.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{group.title}</Text>
            <View style={styles.card}>
              {group.rows.map((row, idx) => (
                <View
                  key={row.key}
                  style={[
                    styles.row,
                    idx < group.rows.length - 1 && styles.rowBorder,
                  ]}
                >
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Switch
                    value={prefs[row.key]}
                    onValueChange={() => toggle(row.key)}
                    trackColor={{ false: C.inset, true: C.green }}
                    thumbColor={C.canvas}
                  />
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
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
  errorCard: {
    padding: 20,
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.ink,
    flex: 1,
  },
});
