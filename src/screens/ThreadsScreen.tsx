import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import { useThreadList } from '../hooks/useThreadList';
import { initialsOf, relTime } from '../utils/time';
import { avatarColors } from '../utils/avatar';
import FAB from '../components/FAB';
import type { Subcontractor } from '../api/types';
import type { ThreadsStackParamList } from '../navigation/types';

function subSubtitle(s: Subcontractor): string {
  const parts = [s.role, s.trade].filter(Boolean);
  return parts.join(' · ') || 'Crew';
}

export default function ThreadsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<ThreadsStackParamList>>();
  const { threads, loading } = useThreadList();

  return (
    <View style={styles.root}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>Threads</Text>
        <Text style={styles.subtitle}>
          Conversations TackPilot is handling on your behalf.
        </Text>
      </View>

      <View style={styles.body}>
        {loading && threads.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={C.ink} />
          </View>
        ) : threads.length === 0 ? (
          <EmptyState message="No threads yet. Add crew on People to start." />
        ) : (
          threads.map((t, idx) => (
            <ThreadRow
              key={t.id}
              sub={t}
              isLast={idx === threads.length - 1}
              onPress={() =>
                nav.navigate('ThreadDetail', { subId: t.id, name: t.full_name })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
    <FAB />
    </View>
  );
}

function ThreadRow({
  sub,
  isLast,
  onPress,
}: {
  sub: Subcontractor;
  isLast: boolean;
  onPress: () => void;
}) {
  const unread = sub.unread_messages_count ?? 0;
  const time = relTime(sub.last_message_date);
  const colors = avatarColors(sub.full_name);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={[styles.row, !isLast && styles.rowBorder]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.bg }]}>
        <Text style={[styles.avatarText, { color: colors.text }]}>
          {initialsOf(sub.full_name)}
        </Text>
      </View>
      <View style={styles.rowText}>
        <View style={styles.rowTitleLine}>
          <Text style={styles.name} numberOfLines={1}>
            {sub.full_name}
          </Text>
          {time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
        <Text style={styles.role} numberOfLines={1}>
          {subSubtitle(sub)}
        </Text>
        {unread > 0 ? (
          <View style={styles.unreadLine}>
            <View style={styles.unreadDot} />
            <Text style={styles.unreadText}>
              {unread} unread {unread === 1 ? 'message' : 'messages'}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
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
    marginBottom: 16,
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
    maxWidth: 320,
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  time: {
    fontSize: 11,
    color: C.faded,
  },
  role: {
    fontSize: 11,
    color: C.faded,
    marginTop: 2,
  },
  unreadLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.blue,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.ink2,
  },
});
