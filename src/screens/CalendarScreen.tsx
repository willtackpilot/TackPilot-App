import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import EmptyState from '../components/EmptyState';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export default function CalendarScreen() {
  const [day, setDay] = useState(() => new Date());

  const dayName = DAY_NAMES[day.getDay()];
  const dateLabel = day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const isToday = day.toDateString() === new Date().toDateString();

  return (
    <ScrollView
      style={styles.root}
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
          <Text style={styles.dayMeta}>0 events</Text>
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
        <EmptyState message="No events this day. Text TackPilot to schedule one." />
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
    marginBottom: 24,
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
});
