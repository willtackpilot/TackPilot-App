import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C } from '../constants/theme';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import type { TodayStackParamList } from '../navigation/types';

const STATS: Array<{ label: string }> = [
  { label: 'Pending' },
  { label: 'Due today' },
  { label: 'Completed' },
  { label: 'Activity' },
];

export default function TodayScreen() {
  const nav = useNavigation<NativeStackNavigationProp<TodayStackParamList>>();

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

  const firstName = 'Will';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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
        {STATS.map((s) => (
          <View key={s.label} style={styles.statTile}>
            <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
            <Text style={styles.statValue}>—</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Today's jobs" meta="0 scheduled" />
        <EmptyState message="No jobs scheduled for today." />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Your list" />
        <EmptyState message='Your list is empty. Text TackPilot "Remind me to order drywall" to add a note.' />
      </View>

      <View style={styles.section}>
        <SectionHeader title="This week" />
        <View style={styles.cashflowHero}>
          <Text style={styles.cashflowAmount}>—</Text>
          <Text style={styles.cashflowLabel}>this week</Text>
        </View>
        <EmptyState message="No revenue data yet." />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Calendar"
          meta="See all"
          onSeeAll={() => nav.navigate('Calendar')}
        />
        <EmptyState message="No events this week." />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Threads"
          meta="See all"
          onSeeAll={() => nav.navigate('Threads')}
        />
        <EmptyState message="No active threads. TackPilot has nothing to handle yet." />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Needs eyes" />
        <EmptyState message="Nothing waiting on you. You're clear." />
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
    paddingTop: 20,
    paddingBottom: 48,
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
});
