import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { C } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import { useJobs } from '../hooks/useJobs';
import type { Job, WorkStatus } from '../api/types';

type Filter = 'all' | 'active' | 'pending' | 'completed';

const STATUS_META: Record<WorkStatus, { label: string; fg: string }> = {
  pending: { label: 'Pending', fg: C.blue },
  in_progress: { label: 'Active', fg: C.green },
  failed: { label: 'Failed', fg: C.amber },
  completed: { label: 'Done', fg: C.muted },
  cancelled: { label: 'Cancelled', fg: C.faded },
};

function inBucket(status: WorkStatus, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'active') return status === 'in_progress';
  if (filter === 'pending') return status === 'pending';
  if (filter === 'completed') return status === 'completed';
  return true;
}

export default function JobsScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const { jobs, totalCount, loading } = useJobs();

  const filtered = jobs.filter((j) => inBucket(j.status, filter));
  const openCount = jobs.filter(
    (j) => j.status !== 'completed' && j.status !== 'cancelled',
  ).length;

  const counts: Record<Filter, number> = {
    all: jobs.length,
    active: jobs.filter((j) => j.status === 'in_progress').length,
    pending: jobs.filter((j) => j.status === 'pending').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
  };

  const tabs: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Done' },
  ];

  return (
    <View style={styles.root}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>Jobs</Text>
        <Text style={styles.subtitle}>
          {totalCount} total · {openCount} open
        </Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => {
          const active = t.id === filter;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setFilter(t.id)}
              activeOpacity={0.7}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t.label}{' '}
                <Text style={styles.tabCount}>{counts[t.id]}</Text>
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.body}>
        {loading && jobs.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={C.ink} />
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={
              filter === 'all'
                ? 'No jobs yet. Text 888-513-3613 to start your first one.'
                : 'No jobs in this view. Try All to see everything.'
            }
          />
        ) : (
          filtered.map((j, idx) => (
            <JobRow key={j.id} job={j} isLast={idx === filtered.length - 1} />
          ))
        )}
      </View>
    </ScrollView>
    <FAB />
    </View>
  );
}

function JobRow({ job, isLast }: { job: Job; isLast: boolean }) {
  const meta = STATUS_META[job.status];
  const subParts = [job.subcontractors_name, job.address].filter(Boolean);
  const subtitle = subParts.length > 0 ? subParts.join(' · ') : '—';
  const progress =
    job.tasks_total > 0 ? `${job.tasks_done}/${job.tasks_total} tasks` : null;

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={[styles.dot, { backgroundColor: meta.fg }]} />
      <View style={styles.rowText}>
        <View style={styles.titleLine}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {job.title}
          </Text>
          {job.overdue ? (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>OVERDUE</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.jobSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.rowMeta}>
        <Text style={[styles.statusLabel, { color: meta.fg }]}>
          {meta.label}
        </Text>
        {progress ? (
          <Text style={styles.progress}>{progress}</Text>
        ) : null}
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
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  body: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.sep,
  },
  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  overdueBadge: {
    backgroundColor: '#FDEEEC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A2A1F',
    letterSpacing: 0.6,
  },
  jobSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  rowMeta: {
    alignItems: 'flex-end',
    minWidth: 64,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  progress: {
    fontSize: 11,
    color: C.faded,
    marginTop: 2,
  },
});
