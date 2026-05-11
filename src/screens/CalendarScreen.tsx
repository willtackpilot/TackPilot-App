import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import FAB from '../components/FAB';
import { useCalendar } from '../hooks/useCalendar';
import { formatTime, isSameDay } from '../utils/time';
import type { CalendarEvent } from '../api/types';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function eventTimeRange(e: CalendarEvent): string {
  const startStr = formatTime(e.start);
  const endStr = formatTime(e.end);
  if (!startStr) return '—';
  if (!endStr || endStr === startStr) return startStr;
  return `${startStr} – ${endStr}`;
}

function eventSubtitle(e: CalendarEvent): string {
  if (e.location) return e.location;
  if (e.sub_name) return e.sub_name;
  if (e.linked_job?.title) return e.linked_job.title;
  return '';
}

export default function CalendarScreen() {
  const [day, setDay] = useState(() => new Date());
  const { events, loading } = useCalendar();

  const dayEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (!e.start) return false;
        const d = new Date(e.start);
        if (Number.isNaN(d.getTime())) return false;
        return isSameDay(d, day);
      })
      .sort((a, b) => {
        const ta = a.start ? new Date(a.start).getTime() : 0;
        const tb = b.start ? new Date(b.start).getTime() : 0;
        return ta - tb;
      });
  }, [events, day]);

  const dayName = DAY_NAMES[day.getDay()];
  const dateLabel = day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const isToday = isSameDay(day, new Date());
  const eventsLabel = dayEvents.length === 1 ? '1 event' : `${dayEvents.length} events`;

  return (
    <View style={styles.root}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>Calendar</Text>
        <Text style={styles.subtitle}>This week</Text>
      </View>

      <View style={styles.dayPicker}>
        <TouchableOpacity
          onPress={() => setDay((d) => addDays(d, -1))}
          activeOpacity={0.7}
          style={styles.chevBtn}
          accessibilityLabel="Previous day"
        >
          <Ionicons name="chevron-back" size={18} color={C.muted} />
        </TouchableOpacity>

        <View style={styles.dayCenter}>
          <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
            {dayName}
            {isToday ? ' · TODAY' : ''}
          </Text>
          <Text style={styles.dayDate}>{dateLabel}</Text>
          <Text style={styles.dayMeta}>{eventsLabel}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setDay((d) => addDays(d, 1))}
          activeOpacity={0.7}
          style={styles.chevBtn}
          accessibilityLabel="Next day"
        >
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {loading && events.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={C.ink} />
          </View>
        ) : dayEvents.length === 0 ? (
          <View style={styles.dayOff}>
            <Text style={styles.dayOffEmoji}>🌴</Text>
            <Text style={styles.dayOffText}>Day off</Text>
          </View>
        ) : (
          dayEvents.map((e, idx) => (
            <EventRow
              key={e.id}
              event={e}
              isLast={idx === dayEvents.length - 1}
            />
          ))
        )}
      </View>
    </ScrollView>
    <FAB />
    </View>
  );
}

function EventRow({ event, isLast }: { event: CalendarEvent; isLast: boolean }) {
  const subtitle = eventSubtitle(event);
  return (
    <View style={[styles.eventRow, !isLast && styles.eventRowBorder]}>
      <Text style={styles.eventTime} numberOfLines={1}>
        {eventTimeRange(event)}
      </Text>
      <View
        style={[
          styles.eventStripe,
          event.overdue ? styles.eventStripeOverdue : styles.eventStripeScheduled,
        ]}
      />
      <View style={styles.eventText}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {event.title}
        </Text>
        {subtitle ? (
          <Text style={styles.eventSubtitle} numberOfLines={1}>
            {subtitle}
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
    paddingTop: 24,
    paddingBottom: 96,
  },
  dayOff: {
    alignItems: 'center',
    paddingVertical: 56,
  },
  dayOffEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  dayOffText: {
    fontSize: 14,
    color: C.muted,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
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
  dayPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  chevBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.sep,
    backgroundColor: C.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCenter: {
    flex: 1,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 1.6,
  },
  dayNameToday: {
    color: C.blue,
  },
  dayDate: {
    fontSize: 26,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  dayMeta: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  body: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.sep,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  eventRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  eventTime: {
    width: 96,
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
  },
  eventStripe: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  eventStripeScheduled: {
    backgroundColor: C.muted,
  },
  eventStripeOverdue: {
    backgroundColor: C.amber,
  },
  eventText: {
    flex: 1,
    minWidth: 0,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  eventSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
});
