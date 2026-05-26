import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { C, money } from '../constants/theme';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import Sparkline from '../components/Sparkline';
import { useFinances } from '../hooks/useFinances';
import { useDashboard } from '../hooks/useDashboard';
import { apiGet } from '../api/client';
import type { InvoiceItem, ProposalListItem } from '../api/types';
import type { RootStackParamList } from '../navigation/types';

type InvoiceTab = 'all' | 'overdue' | 'open';

const TABS: Array<{ id: InvoiceTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'open', label: 'Open' },
];

function daysUntilDue(due: string): number {
  const d = new Date(due);
  if (Number.isNaN(d.getTime())) return Number.NaN;
  const ms = d.getTime() - Date.now();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function isOverdue(iv: InvoiceItem): boolean {
  const d = daysUntilDue(iv.due_date);
  if (Number.isNaN(d)) return iv.status?.toLowerCase() === 'overdue';
  return d < 0;
}

function dueLabel(iv: InvoiceItem): string {
  const d = daysUntilDue(iv.due_date);
  if (Number.isNaN(d)) return iv.due_date;
  if (d < 0) return `${Math.abs(d)}d late`;
  if (d === 0) return 'due today';
  return `due in ${d}d`;
}

export default function MoneyScreen() {
  const [tab, setTab] = useState<InvoiceTab>('all');
  const { data, loading, refetch } = useFinances();
  const { data: dashboard, refetch: refetchDashboard } = useDashboard();
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const revenueSeries = (dashboard?.revenue_last_30_days ?? []).map((d) => d.amount);

  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  useEffect(() => {
    apiGet<{ items: ProposalListItem[] }>('/v1/proposals?limit=10')
      .then((r) => setProposals(r.items ?? []))
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchDashboard();
    }, [refetch, refetchDashboard]),
  );

  const onRefresh = useCallback(() => {
    refetch();
    refetchDashboard();
  }, [refetch, refetchDashboard]);

  const invoices = data?.open_invoices?.invoices ?? [];
  const quickbooksConnected = data?.open_invoices?.quickbooks_connected ?? false;
  const emptyMessage =
    data?.open_invoices?.empty_state_message ??
    'Connect QuickBooks to see your invoices.';

  const overdue = useMemo(() => invoices.filter(isOverdue), [invoices]);
  const open = useMemo(() => invoices.filter((i) => !isOverdue(i)), [invoices]);

  const visible = tab === 'all' ? invoices : tab === 'overdue' ? overdue : open;

  const tabCounts: Record<InvoiceTab, number> = {
    all: invoices.length,
    overdue: overdue.length,
    open: open.length,
  };

  const health = data?.health_summary;
  const collected = health?.revenue_this_month ?? null;
  const hasAmount = collected !== null;
  const hasRevenue = hasAmount && collected > 0;

  return (
    <View style={styles.root}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={C.muted} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.h1}>Money</Text>
        <Text style={styles.subtitle}>What came in, what's coming, who's behind</Text>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroLabel}>You collected this month</Text>
        <View style={styles.heroRow}>
          <Text style={styles.heroAmount}>
            {hasAmount ? money(collected) : '—'}
          </Text>
          {revenueSeries.length >= 2 ? (
            <View style={styles.sparkWrap}>
              <Sparkline data={revenueSeries} width={80} height={24} stroke={C.ink} />
            </View>
          ) : null}
        </View>
        {!hasRevenue ? (
          <Text style={styles.subMeta}>No revenue yet this month.</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <SectionHeader title="What's coming in" meta={`${proposals.length} proposals`} />
        {proposals.length === 0 ? (
          <EmptyState
            message="No proposals yet. Create one from a job to start tracking quotes."
          />
        ) : (
          proposals.map((p, idx) => (
            <View
              key={p.id}
              style={[styles.invoiceRow, idx < proposals.length - 1 && styles.invoiceRowBorder]}
            >
              <View style={styles.invoiceMain}>
                <Text style={styles.invoiceClient} numberOfLines={1}>
                  {p.client_name}
                </Text>
                <Text style={styles.invoiceDesc} numberOfLines={1}>
                  {p.title}
                </Text>
              </View>
              <View style={styles.invoiceMeta}>
                <Text style={styles.invoiceDue}>{p.status}</Text>
                <Text style={styles.invoiceAmount}>
                  {money(p.total_cents / 100)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.invoiceHeaderRow}>
          <Text style={styles.sectionTitle}>What you're owed</Text>
          <View style={styles.tabRow}>
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  activeOpacity={0.7}
                  style={[styles.tabBtn, active && styles.tabBtnActive]}
                >
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {t.label}{' '}
                    <Text style={styles.tabCount}>{tabCounts[t.id]}</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {invoices.length === 0 ? (
          <EmptyState
            message={quickbooksConnected ? 'No open invoices.' : emptyMessage}
          />
        ) : (
          <View>
            {visible.map((iv, idx) => (
              <InvoiceRow
                key={iv.id}
                invoice={iv}
                isLast={idx === visible.length - 1}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
    <FAB onPress={() => nav.navigate('NewInvoice')} accessibilityLabel="New invoice" />
    </View>
  );
}

function InvoiceRow({ invoice, isLast }: { invoice: InvoiceItem; isLast: boolean }) {
  const overdueRow = isOverdue(invoice);
  return (
    <View style={[styles.invoiceRow, !isLast && styles.invoiceRowBorder]}>
      <View style={styles.invoiceMain}>
        <Text style={styles.invoiceClient} numberOfLines={1}>
          {invoice.client}
        </Text>
        {invoice.description ? (
          <Text style={styles.invoiceDesc} numberOfLines={1}>
            {invoice.description}
          </Text>
        ) : null}
      </View>
      <View style={styles.invoiceMeta}>
        <Text
          style={[
            styles.invoiceDue,
            overdueRow && styles.invoiceDueOverdue,
          ]}
          numberOfLines={1}
        >
          {dueLabel(invoice)}
        </Text>
        <Text style={styles.invoiceAmount} numberOfLines={1}>
          {money(invoice.amount)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 96,
  },
  header: {
    marginBottom: 24,
  },
  h1: {
    fontSize: 30,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
    marginTop: 4,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroLabel: {
    fontSize: 13,
    color: C.muted,
    marginBottom: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  sparkWrap: {
    paddingBottom: 12,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -1.6,
  },
  subMeta: {
    fontSize: 13,
    color: C.muted,
    marginTop: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.3,
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tabBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: C.ink,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  tabLabelActive: {
    color: C.ink,
  },
  tabCount: {
    color: C.faded,
    fontWeight: '600',
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  invoiceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  invoiceMain: {
    flex: 1,
    minWidth: 0,
  },
  invoiceClient: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  invoiceDesc: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  invoiceMeta: {
    alignItems: 'flex-end',
  },
  invoiceDue: {
    fontSize: 11,
    fontWeight: '500',
    color: C.muted,
    marginBottom: 2,
  },
  invoiceDueOverdue: {
    color: C.amber,
    fontWeight: '700',
  },
  invoiceAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: C.ink,
  },
});
