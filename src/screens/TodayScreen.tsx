import React, { useCallback, useMemo, useState } from 'react';
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
import { useDashboard } from '../hooks/useDashboard';
import { useThreadList } from '../hooks/useThreadList';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../api/client';
import { initialsOf, relTime } from '../utils/time';
import { avatarColors } from '../utils/avatar';
import FAB from '../components/FAB';
import type {
  DashboardResponse,
  NeedsAttentionItem,
  ScheduleTaskItem,
  Subcontractor,
  UpcomingTaskItem,
} from '../api/types';
import type { TabsParamList } from '../navigation/types';

const STAT_KEYS: Array<{
  label: string;
  field: keyof Pick<
    DashboardResponse,
    'pending_tasks' | 'due_today' | 'completed_tasks' | 'activity_feed_total'
  >;
}> = [
  { label: 'Pending', field: 'pending_tasks' },
  { label: 'Due today', field: 'due_today' },
  { label: 'Completed', field: 'completed_tasks' },
  { label: 'Activity', field: 'activity_feed_total' },
];

const NEEDS_TYPE_LABEL: Record<string, string> = {
  conflict_delay: 'Schedule conflict',
  task_alert: 'Task alert',
  message_alert: 'Message',
  invoice_overdue: 'Invoice overdue',
};

function labelForNeedsType(t: string): string {
  if (NEEDS_TYPE_LABEL[t]) return NEEDS_TYPE_LABEL[t];
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'p' : 'a';
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${dh}${ampm}` : `${dh}:${m.toString().padStart(2, '0')}${ampm}`;
}

function readStr(item: ScheduleTaskItem, ...keys: string[]): string {
  for (const k of keys) {
    const v = item[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

type Row = {
  key: string;
  time: string;
  title: string;
  subtitle: string;
};

function scheduleRow(item: ScheduleTaskItem, idx: number): Row {
  const id = readStr(item, 'id');
  const title = readStr(item, 'title', 'name', 'job_title') || 'Untitled';
  const timeIso = readStr(item, 'planned_start_time', 'start_time', 'time');
  const time = formatTime(timeIso) || readStr(item, 'time_label');
  const subtitle =
    readStr(item, 'assigned_to', 'crew_name', 'customer_name', 'customer', 'job_title');
  return { key: id || `sched-${idx}`, time, title, subtitle };
}

function upcomingRow(item: UpcomingTaskItem): Row {
  return {
    key: item.id,
    time: formatTime(item.planned_start_time),
    title: item.title || 'Untitled',
    subtitle: item.assigned_to || item.job_title || '',
  };
}

export default function TodayScreen() {
  const nav = useNavigation<NavigationProp<TabsParamList>>();
  const tabs = nav.getParent<NavigationProp<TabsParamList>>();
  const { data, loading, refetch } = useDashboard();
  const { threads, refetch: refetchThreads } = useThreadList();
  const { currentUser } = useAuth();
  const [needsResolved, setNeedsResolved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchThreads();
    }, [refetch, refetchThreads]),
  );

  const onRefresh = useCallback(() => {
    refetch();
    refetchThreads();
  }, [refetch, refetchThreads]);

  const { greeting, dateStr } = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const d = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    return { greeting: g, dateStr: d };
  }, []);

  const firstName = currentUser?.first_name?.trim() || 'there';

  const scheduleTasks = data?.todays_schedule?.tasks ?? [];
  const scheduleCount = data?.todays_schedule?.total_count ?? scheduleTasks.length;
  const scheduleRows = scheduleTasks.map(scheduleRow);

  const upcomingRows = (data?.upcoming_tasks ?? []).slice(0, 5).map(upcomingRow);

  const needsItem: NeedsAttentionItem | undefined = data?.needs_attention?.[0];
  const showNeeds = !!needsItem && !needsResolved;

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
      <View style={styles.heading}>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.title}>
          {greeting}, {firstName}.
        </Text>
      </View>

      <View style={styles.statGrid}>
        {STAT_KEYS.map((s) => {
          const display = data === null ? '—' : String(data[s.field] ?? 0);
          return (
            <View key={s.label} style={styles.statTile}>
              <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
              <Text style={styles.statValue}>{display}</Text>
            </View>
          );
        })}
      </View>

      {showNeeds && needsItem ? (
        <View style={styles.section}>
          <View style={styles.needsHeader}>
            <View style={styles.needsDot} />
            <Text style={styles.needsLabel}>Needs your eyes</Text>
            <Text style={styles.needsType}>{labelForNeedsType(needsItem.type)}</Text>
          </View>
          <Text style={styles.needsMessage}>{needsItem.message}</Text>
          <View style={styles.needsActions}>
            <TouchableOpacity
              onPress={() => setNeedsResolved(true)}
              activeOpacity={0.85}
              style={styles.needsPrimaryBtn}
            >
              <Text style={styles.needsPrimaryText}>Got it</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() => setNeedsResolved(true)}
              activeOpacity={0.7}
              style={styles.needsGhostBtn}
            >
              <Text style={styles.needsGhostText}>Snooze</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title="Today's jobs"
          meta={`${scheduleCount} scheduled`}
        />
        {scheduleRows.length === 0 ? (
          <EmptyState message="No jobs scheduled for today." />
        ) : (
          scheduleRows.map((r) => <TaskRow key={r.key} row={r} />)
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Your list" />
        <EmptyState message='Your list is empty. Text TackPilot "Remind me to order drywall" to add a note.' />
      </View>

      <View style={styles.section}>
        <SectionHeader title="This month" />
        <View style={styles.cashflowHero}>
          <Text style={styles.cashflowAmount}>
            {data ? money(data.collected_this_month) : '—'}
          </Text>
          <Text style={styles.cashflowLabel}>this month</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Calendar"
          meta="See all"
          onSeeAll={() => tabs?.navigate('CalendarTab')}
        />
        {upcomingRows.length === 0 ? (
          <EmptyState message="No events this week." />
        ) : (
          upcomingRows.map((r) => <TaskRow key={r.key} row={r} />)
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Threads"
          meta="See all"
          onSeeAll={() => tabs?.navigate('ThreadsTab')}
        />
        {threads.length === 0 ? (
          <EmptyState message="No active threads. TackPilot has nothing to handle yet." />
        ) : (
          threads.slice(0, 4).map((t) => <ThreadMiniRow key={t.id} sub={t} />)
        )}
      </View>
    </ScrollView>
    <FAB />
    </View>
  );
}

function ThreadMiniRow({ sub }: { sub: Subcontractor }) {
  const time = relTime(sub.last_message_date);
  const role = [sub.role, sub.trade].filter(Boolean).join(' · ') || 'Crew';
  const colors = avatarColors(sub.full_name);
  return (
    <View style={styles.threadMiniRow}>
      <View style={[styles.threadMiniAvatar, { backgroundColor: colors.bg }]}>
        <Text style={[styles.threadMiniAvatarText, { color: colors.text }]}>
          {initialsOf(sub.full_name)}
        </Text>
      </View>
      <View style={styles.threadMiniText}>
        <View style={styles.threadMiniTitleLine}>
          <Text style={styles.threadMiniName} numberOfLines={1}>
            {sub.full_name}
          </Text>
          {time ? <Text style={styles.threadMiniTime}>{time}</Text> : null}
        </View>
        <Text style={styles.threadMiniRole} numberOfLines={1}>
          {role}
        </Text>
      </View>
    </View>
  );
}

function TaskRow({ row }: { row: Row }) {
  return (
    <View style={styles.taskRow}>
      <Text style={styles.taskTime} numberOfLines={1}>
        {row.time || '—'}
      </Text>
      <View style={styles.taskDot} />
      <View style={styles.taskText}>
        <Text style={styles.taskTitle} numberOfLines={1}>
          {row.title}
        </Text>
        {row.subtitle ? (
          <Text style={styles.taskSubtitle} numberOfLines={1}>
            {row.subtitle}
          </Text>
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
    paddingTop: 20,
    paddingBottom: 96,
  },
  heading: {
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: C.faded,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: C.green,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -1,
    lineHeight: 38,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  statTile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: C.canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.sep,
    padding: 12,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.4,
  },
  section: {
    marginBottom: 28,
  },
  cashflowHero: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 8,
  },
  cashflowAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -1.2,
  },
  cashflowLabel: {
    fontSize: 13,
    color: C.muted,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  taskTime: {
    width: 52,
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.muted,
  },
  taskText: {
    flex: 1,
    minWidth: 0,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  taskSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  needsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  needsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.blue,
  },
  needsLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: C.blue,
  },
  needsType: {
    fontSize: 12,
    fontWeight: '600',
    color: C.faded,
  },
  needsMessage: {
    fontSize: 22,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  needsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  needsPrimaryBtn: {
    backgroundColor: C.ink,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  needsPrimaryText: {
    color: C.canvas,
    fontSize: 13,
    fontWeight: '700',
  },
  needsGhostBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  needsGhostText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  threadMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  threadMiniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadMiniAvatarText: {
    fontSize: 11,
    fontWeight: '800',
  },
  threadMiniText: {
    flex: 1,
    minWidth: 0,
  },
  threadMiniTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  threadMiniName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: C.ink,
  },
  threadMiniTime: {
    fontSize: 11,
    color: C.faded,
  },
  threadMiniRole: {
    fontSize: 11,
    color: C.faded,
    marginTop: 1,
  },
});
