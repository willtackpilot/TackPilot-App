import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { C } from '../constants/theme';
import EmptyState from '../components/EmptyState';

type Tab = 'crew' | 'customers';

export default function PeopleScreen() {
  const [tab, setTab] = useState<Tab>('crew');

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>People</Text>
        <Text style={styles.subtitle}>
          {tab === 'crew' ? '0 on your team' : 'Customers coming soon'}
        </Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('crew')}
          activeOpacity={0.7}
          style={[styles.tabBtn, tab === 'crew' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabLabel, tab === 'crew' && styles.tabLabelActive]}>
            Crew
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('customers')}
          activeOpacity={0.7}
          style={[styles.tabBtn, tab === 'customers' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabLabel, tab === 'customers' && styles.tabLabelActive]}>
            Customers
          </Text>
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>SOON</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {tab === 'crew' ? (
          <EmptyState message="No crew yet. Text 888-513-3613 to add your first sub." />
        ) : (
          <EmptyState message="Customers coming soon. Invoices, jobs, and threads will link back to a real customer record." />
        )}
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
    marginBottom: 14,
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
  tabRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
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
  soonBadge: {
    backgroundColor: C.blueSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soonText: {
    fontSize: 9,
    fontWeight: '800',
    color: C.blue,
    letterSpacing: 0.6,
  },
  body: {
    paddingTop: 12,
  },
});
