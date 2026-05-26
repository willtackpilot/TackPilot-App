import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { C } from '../constants/theme';
import ModalHeader from '../components/ModalHeader';
import EmptyState from '../components/EmptyState';
import { useNotifications } from '../hooks/useNotifications';
import { relTime } from '../utils/time';
import type { NotificationItem } from '../api/types';

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  job: 'hammer-outline',
  task: 'checkbox-outline',
  task_alert: 'alert-circle-outline',
  message: 'chatbubble-outline',
  invoice: 'document-text-outline',
  payment: 'cash-outline',
  calendar: 'calendar-outline',
  system: 'information-circle-outline',
};

function iconFor(type: string): keyof typeof Ionicons.glyphMap {
  const key = type.toLowerCase();
  for (const k of Object.keys(TYPE_ICON)) {
    if (key.includes(k)) return TYPE_ICON[k];
  }
  return 'notifications-outline';
}

export default function NotificationsScreen() {
  const nav = useNavigation();
  const { items, loading, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <View style={styles.root}>
      <ModalHeader title="Notifications" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.unread}>
            {unreadCount === 0
              ? 'All caught up.'
              : `${unreadCount} unread`}
          </Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} activeOpacity={0.6}>
              <Text style={styles.markAll}>Mark all read</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {loading && items.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={C.ink} />
          </View>
        ) : items.length === 0 ? (
          <EmptyState message="Nothing to read yet. TackPilot will surface anything that needs your attention here." />
        ) : (
          <View style={styles.list}>
            {items.map((n, idx) => (
              <Row
                key={n.id}
                n={n}
                isLast={idx === items.length - 1}
                onPress={() => {
                  if (!n.is_read) markRead(n.id);
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Row({
  n,
  isLast,
  onPress,
}: {
  n: NotificationItem;
  isLast: boolean;
  onPress: () => void;
}) {
  const icon = iconFor(n.type);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[styles.row, !isLast && styles.rowBorder, !n.is_read && styles.rowUnread]}
    >
      <View style={[styles.iconWrap, !n.is_read && styles.iconWrapUnread]}>
        <Ionicons name={icon} size={18} color={n.is_read ? C.muted : C.blue} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.body, !n.is_read && styles.bodyUnread]} numberOfLines={3}>
          {n.text}
        </Text>
        <Text style={styles.time}>{relTime(n.create_time)}</Text>
      </View>
      {!n.is_read ? <View style={styles.dot} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  unread: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
  },
  markAll: {
    fontSize: 13,
    fontWeight: '700',
    color: C.blue,
  },
  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  list: {
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    overflow: 'hidden',
  },
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
  rowUnread: {
    backgroundColor: C.blueSoft,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapUnread: {
    backgroundColor: C.canvas,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  body: {
    fontSize: 14,
    color: C.ink2,
    lineHeight: 19,
  },
  bodyUnread: {
    color: C.ink,
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    color: C.faded,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.blue,
  },
});
