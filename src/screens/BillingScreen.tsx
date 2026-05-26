import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { apiGet, apiPost } from '../api/client';
import type { SubscriptionStatus } from '../api/types';

/* ── Helpers ── */

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusLabel(sub: SubscriptionStatus): string {
  if (sub.is_trial) return 'Trial';
  if (sub.is_active) return 'Active';
  return sub.status ?? 'Inactive';
}

type PillStyle = { bg: string; fg: string };

function statusPill(sub: SubscriptionStatus): PillStyle {
  if (sub.is_trial) return { bg: C.amberSoft, fg: C.amber };
  if (sub.is_active) return { bg: C.greenSoft, fg: C.green };
  return { bg: '#FDECEA', fg: C.red };
}

/* ── Screen ── */

export default function BillingScreen() {
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchSub = useCallback(async () => {
    try {
      const res = await apiGet<SubscriptionStatus>(
        '/v1/billing/subscription',
      );
      setSub(res);
    } catch {
      // keep stale data
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSub();
      setLoading(false);
    })();
  }, [fetchSub]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSub();
    setRefreshing(false);
  }, [fetchSub]);

  const openPortal = useCallback(async () => {
    setPortalLoading(true);
    try {
      const res = await apiPost<{ url: string }>(
        '/v1/billing/portal-session',
      );
      if (res?.url) {
        await Linking.openURL(res.url);
      }
    } catch {
      // fail silently — the button can be tapped again
    } finally {
      setPortalLoading(false);
    }
  }, []);

  const hasActive = sub?.is_active || sub?.is_trial;

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
        <Text style={styles.h1}>Billing</Text>
        <Text style={styles.subtitle}>
          Manage your TackPilot subscription and payment method.
        </Text>
      </View>

      {loading && !sub ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.ink} />
        </View>
      ) : !sub ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            Couldn't load billing info. Pull down to retry.
          </Text>
        </View>
      ) : hasActive ? (
        /* ── Active / Trial card ── */
        <>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Status</Text>
                <View
                  style={[
                    styles.pill,
                    { backgroundColor: statusPill(sub).bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: statusPill(sub).fg },
                    ]}
                  >
                    {statusLabel(sub)}
                  </Text>
                </View>
              </View>

              {sub.is_trial ? (
                <View style={[styles.cardRow, styles.cardRowBorder]}>
                  <Text style={styles.cardLabel}>Trial days remaining</Text>
                  <Text style={styles.cardValue}>
                    {sub.trial_days_remaining}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.cardRow, styles.cardRowBorder]}>
                <Text style={styles.cardLabel}>Current period ends</Text>
                <Text style={styles.cardValue}>
                  {formatDate(sub.current_period_end)}
                </Text>
              </View>

              {sub.status ? (
                <View style={[styles.cardRow, styles.cardRowBorder]}>
                  <Text style={styles.cardLabel}>Plan status</Text>
                  <Text style={styles.cardValue}>{sub.status}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <TouchableOpacity
            onPress={openPortal}
            activeOpacity={0.7}
            style={styles.primaryBtn}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <ActivityIndicator color={C.canvas} size="small" />
            ) : (
              <>
                <Ionicons name="open-outline" size={16} color={C.canvas} />
                <Text style={styles.primaryBtnText}>Manage billing</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      ) : (
        /* ── No active subscription — upgrade CTA ── */
        <View style={styles.upgradeCard}>
          <View style={styles.upgradeIcon}>
            <Ionicons name="rocket-outline" size={28} color={C.blue} />
          </View>
          <Text style={styles.upgradeTitle}>
            Unlock the full power of TackPilot
          </Text>
          <Text style={styles.upgradeBody}>
            Agents, dispatching, collections, and more — all included. Start
            your subscription to keep everything running.
          </Text>
          <TouchableOpacity
            onPress={openPortal}
            activeOpacity={0.7}
            style={styles.primaryBtn}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <ActivityIndicator color={C.canvas} size="small" />
            ) : (
              <>
                <Ionicons name="open-outline" size={16} color={C.canvas} />
                <Text style={styles.primaryBtnText}>Get started</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardRowBorder: {
    borderTopWidth: 1,
    borderTopColor: C.sep,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.ink2,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
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
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.ink,
    borderRadius: 14,
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.canvas,
  },
  upgradeCard: {
    padding: 24,
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    alignItems: 'center',
    gap: 12,
  },
  upgradeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blueSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  upgradeBody: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
