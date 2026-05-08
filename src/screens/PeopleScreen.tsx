import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { C } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import { useCrew } from '../hooks/useCrew';
import type { Subcontractor } from '../api/types';

type Tab = 'crew' | 'customers';

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  if (last10.length !== 10) return raw;
  return `${last10.slice(0, 3)}-${last10.slice(3, 6)}-${last10.slice(6)}`;
}

export default function PeopleScreen() {
  const [tab, setTab] = useState<Tab>('crew');
  const { crew, totalCount, loading, error, refetch } = useCrew();

  const crewSubtitle =
    totalCount === 1 ? '1 on your team' : `${totalCount} on your team`;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>People</Text>
        <Text style={styles.subtitle}>
          {tab === 'crew' ? crewSubtitle : 'Customers coming soon'}
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
          <CrewTab crew={crew} loading={loading} error={error} refetch={refetch} />
        ) : (
          <EmptyState message="Customers coming soon. Invoices, jobs, and threads will link back to a real customer record." />
        )}
      </View>
    </ScrollView>
  );
}

function CrewTab({
  crew,
  loading,
  error,
  refetch,
}: {
  crew: Subcontractor[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}) {
  if (loading && crew.length === 0) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={C.ink} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={refetch} activeOpacity={0.7} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (crew.length === 0) {
    return <EmptyState message="No crew yet. Text 888-513-3613 to add your first sub." />;
  }

  return (
    <View>
      {crew.map((p, idx) => (
        <CrewRow key={p.id} sub={p} isLast={idx === crew.length - 1} />
      ))}
    </View>
  );
}

function CrewRow({ sub, isLast }: { sub: Subcontractor; isLast: boolean }) {
  const isActive = sub.status === 'active';
  const phone = formatPhone(sub.phone_number);

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initialsOf(sub.full_name)}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.name} numberOfLines={1}>
          {sub.full_name}
        </Text>
        <Text style={styles.phone} numberOfLines={1}>
          {phone}
        </Text>
      </View>
      <View
        style={[
          styles.statusPill,
          isActive ? styles.statusPillActive : styles.statusPillInactive,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            isActive ? styles.statusTextActive : styles.statusTextInactive,
          ]}
        >
          {isActive ? 'Active' : 'Inactive'}
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
    paddingTop: 4,
  },
  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#FBE9E7',
    borderColor: C.red,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: C.red,
    fontWeight: '600',
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.canvas,
    borderColor: C.red,
    borderWidth: 1,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.red,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.ink2,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  phone: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusPillActive: {
    backgroundColor: C.greenSoft,
  },
  statusPillInactive: {
    backgroundColor: C.inset,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: C.green,
  },
  statusTextInactive: {
    color: C.muted,
  },
});
