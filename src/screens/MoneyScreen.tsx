import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../constants/theme';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';

type InvoiceTab = 'all' | 'overdue' | 'open';

const TABS: Array<{ id: InvoiceTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'open', label: 'Open' },
];

export default function MoneyScreen() {
  const [tab, setTab] = useState<InvoiceTab>('all');

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>Money</Text>
        <Text style={styles.subtitle}>What came in, what's coming, who's behind</Text>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroLabel}>You collected this month</Text>
        <View style={styles.heroRow}>
          <Text style={styles.heroAmount}>—</Text>
        </View>
        <Text style={styles.subMeta}>No revenue data yet.</Text>
      </View>

      <View style={styles.section}>
        <SectionHeader title="What's coming in" />
        <EmptyState
          variant="card"
          message="Estimates coming soon. Track quotes from draft to signed once the Estimate model ships."
        />
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
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <EmptyState message="No invoices yet." />
      </View>
    </ScrollView>
  );
}

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
    alignItems: 'baseline',
    gap: 10,
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
    paddingHorizontal: 10,
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
});
