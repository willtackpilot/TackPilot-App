import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import { useThreadMessages } from '../hooks/useThreadMessages';
import { initialsOf, relTime } from '../utils/time';
import type { SubcontractorSMSResponse } from '../api/types';
import type { ThreadsStackParamList } from '../navigation/types';

type DetailRoute = RouteProp<ThreadsStackParamList, 'ThreadDetail'>;
type DetailNav = NativeStackNavigationProp<ThreadsStackParamList, 'ThreadDetail'>;

export default function ThreadDetailScreen() {
  const route = useRoute<DetailRoute>();
  const { subId, name } = route.params;
  const { messages, loading } = useThreadMessages(subId);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading && messages.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={C.ink} />
          </View>
        ) : messages.length === 0 ? (
          <EmptyState
            message={`No messages with ${name.split(' ')[0]} yet.`}
          />
        ) : (
          messages.map((m) => <Bubble key={m.id} message={m} who={name} />)
        )}
      </ScrollView>
    </View>
  );
}

function Bubble({
  message,
  who,
}: {
  message: SubcontractorSMSResponse;
  who: string;
}) {
  return (
    <View style={styles.bubbleRow}>
      <View style={styles.bubbleColumn}>
        <View style={styles.bubbleMeta}>
          <Text style={styles.bubbleWho}>{who}</Text>
          <Text style={styles.bubbleTime}>{relTime(message.create_time)}</Text>
        </View>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message.description}</Text>
        </View>
      </View>
    </View>
  );
}

export function ThreadDetailHeader() {
  const nav = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { name } = route.params;

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

      <View style={styles.headerAvatar}>
        <Text style={styles.headerAvatarText}>{initialsOf(name)}</Text>
      </View>

      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name}
        </Text>
      </View>

      <View style={styles.backBtnSpacer} />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubbleColumn: {
    maxWidth: '82%',
    gap: 4,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  bubbleWho: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
  },
  bubbleTime: {
    fontSize: 11,
    color: C.faded,
  },
  bubble: {
    backgroundColor: C.canvas,
    borderColor: C.sep,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: C.ink2,
    lineHeight: 20,
  },
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
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.ink2,
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.ink,
  },
});
