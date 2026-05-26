import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { C, money } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import { apiGet } from '../api/client';
import type {
  JobDetail,
  TaskItem,
  TaskListResponse,
  EstimateListItem,
  WorkStatus,
  TaskPriority,
} from '../api/types';
import type { RootStackParamList } from '../navigation/types';

/* ---------- Route typing ---------- */

type JobDetailParams = { jobId: string; title: string };

/* ---------- Status pill colors (matches JobsScreen) ---------- */

const STATUS_META: Record<WorkStatus, { label: string; fg: string }> = {
  pending: { label: 'Pending', fg: C.blue },
  in_progress: { label: 'Active', fg: C.green },
  failed: { label: 'Failed', fg: C.amber },
  completed: { label: 'Done', fg: C.muted },
  cancelled: { label: 'Cancelled', fg: C.faded },
};

/* ---------- Helpers ---------- */

function pillBg(fg: string): string {
  if (fg === C.green) return C.greenSoft;
  if (fg === C.blue) return C.blueSoft;
  if (fg === C.amber) return C.amberSoft;
  return C.inset;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCents(cents: number): string {
  return money(cents / 100);
}

/* ---------- Main screen ---------- */

export default function JobDetailScreen() {
  const route = useRoute<RouteProp<{ Detail: JobDetailParams }, 'Detail'>>();
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const { jobId } = route.params;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [estimates, setEstimates] = useState<EstimateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [jobRes, taskRes, estRes] = await Promise.all([
        apiGet<JobDetail>(`/v1/job/${jobId}`),
        apiGet<TaskListResponse>(`/v1/job/${jobId}/task/list`),
        apiGet<EstimateListItem[]>(`/v1/job/${jobId}/estimates`),
      ]);
      setJob(jobRes);
      setTasks(taskRes.items);
      setEstimates(estRes);
    } catch {
      // silently keep stale data on error
    }
  }, [jobId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchAll();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchAll]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  /* ---------- Progress ---------- */

  const tasksDone = job?.tasks_done ?? 0;
  const tasksTotal = job?.tasks_total ?? 0;
  const progressPct = tasksTotal > 0 ? tasksDone / tasksTotal : 0;

  /* ---------- Render ---------- */

  if (loading && !job) {
    return (
      <View style={styles.root}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.ink} />
        </View>
      </View>
    );
  }

  const statusMeta = job ? STATUS_META[job.status] : STATUS_META.pending;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.muted}
          />
        }
      >
        {/* ── Job header ── */}
        {job ? (
          <View style={styles.jobHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.h1} numberOfLines={2}>
                {job.title}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: pillBg(statusMeta.fg) }]}>
                <Text style={[styles.statusPillText, { color: statusMeta.fg }]}>
                  {statusMeta.label}
                </Text>
              </View>
            </View>

            {(job.address || job.city || job.phone) ? (
              <View style={styles.infoRows}>
                {job.address ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color={C.muted} />
                    <Text style={styles.infoText}>
                      {[job.address, job.city].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                ) : null}
                {job.phone ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={14} color={C.muted} />
                    <Text style={styles.infoText}>{job.phone}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* ── Progress bar ── */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressCount}>
                  {tasksDone}/{tasksTotal} tasks
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(progressPct * 100)}%` as any },
                  ]}
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Tasks section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          {tasks.length === 0 ? (
            <EmptyState message="No tasks yet." variant="card" />
          ) : (
            <View style={styles.card}>
              {tasks.map((t, idx) => (
                <TaskRow key={t.id} task={t} isLast={idx === tasks.length - 1} />
              ))}
            </View>
          )}
        </View>

        {/* ── Estimates section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimates</Text>
          {estimates.length === 0 ? (
            <EmptyState message="No estimates yet." variant="card" />
          ) : (
            <View style={styles.card}>
              {estimates.map((e, idx) => (
                <EstimateRow
                  key={e.id}
                  estimate={e}
                  isLast={idx === estimates.length - 1}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FAB onPress={() => nav.navigate('NewJob')} accessibilityLabel="New job" />
    </View>
  );
}

/* ---------- Task row ---------- */

function TaskRow({ task, isLast }: { task: TaskItem; isLast: boolean }) {
  const meta = STATUS_META[task.status];
  const isCritical = task.priority === 'critical';

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowBody}>
        <View style={styles.taskTitleLine}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {task.title}
          </Text>
          {isCritical ? (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalText}>CRITICAL</Text>
            </View>
          ) : null}
        </View>
        {task.assigned_to ? (
          <Text style={styles.rowSub} numberOfLines={1}>
            {task.assigned_to}
          </Text>
        ) : null}
      </View>
      <View style={[styles.statusPill, { backgroundColor: pillBg(meta.fg) }]}>
        <Text style={[styles.statusPillText, { color: meta.fg }]}>{meta.label}</Text>
      </View>
    </View>
  );
}

/* ---------- Estimate row ---------- */

function EstimateRow({
  estimate,
  isLast,
}: {
  estimate: EstimateListItem;
  isLast: boolean;
}) {
  const statusLabel =
    estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1);

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {formatCents(estimate.total_cents)}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {estimate.line_item_count} line item
          {estimate.line_item_count !== 1 ? 's' : ''} &middot;{' '}
          {formatDate(estimate.created_at)}
        </Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: C.inset }]}>
        <Text style={[styles.statusPillText, { color: C.muted }]}>
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

/* ---------- Header (exported, like ThreadDetailHeader) ---------- */

export function JobDetailHeader() {
  const nav = useNavigation();
  const route = useRoute<RouteProp<{ Detail: JobDetailParams }, 'Detail'>>();
  const { title } = route.params;

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => nav.goBack()}
        activeOpacity={0.6}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Ionicons name="chevron-back" size={22} color={C.ink} />
      </TouchableOpacity>

      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.backBtnSpacer} />
    </View>
  );
}

/* ---------- Styles ---------- */

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
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Job header */
  jobHeader: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  h1: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.6,
  },
  infoRows: {
    marginTop: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: C.muted,
  },

  /* Progress */
  progressSection: {
    marginTop: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.ink2,
  },
  progressCount: {
    fontSize: 12,
    color: C.muted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.inset,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },

  /* Sections */
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 10,
  },

  /* Card wrapper */
  card: {
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    overflow: 'hidden',
  },

  /* Row (task & estimate) */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  taskTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  rowSub: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },

  /* Status pill */
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Critical badge */
  criticalBadge: {
    backgroundColor: '#FDEEEC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  criticalText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A2A1F',
    letterSpacing: 0.6,
  },

  /* Header */
  header: {
    height: 56,
    paddingHorizontal: 8,
    backgroundColor: C.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.sep,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnSpacer: {
    width: 40,
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.ink,
  },
});
