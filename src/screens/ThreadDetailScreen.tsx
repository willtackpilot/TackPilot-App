import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import { C } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import { useThreadMessages } from '../hooks/useThreadMessages';
import { usePolling } from '../hooks/usePolling';
import { initialsOf, relTime } from '../utils/time';
import { avatarColors } from '../utils/avatar';
import type { SubcontractorSMSResponse } from '../api/types';
import type { ThreadsStackParamList } from '../navigation/types';

type DetailRoute = RouteProp<ThreadsStackParamList, 'ThreadDetail'>;
type DetailNav = NativeStackNavigationProp<ThreadsStackParamList, 'ThreadDetail'>;

export default function ThreadDetailScreen() {
  const route = useRoute<DetailRoute>();
  const { subId, name } = route.params;
  const headerHeight = useHeaderHeight();
  const {
    messages,
    loading,
    refetch,
    sendMessage,
    sending,
    sendError,
    clearSendError,
  } = useThreadMessages(subId);

  // Poll fast while in the conversation so replies land within ~15s.
  // The refetch is paused automatically when the app backgrounds, when
  // this screen unmounts, and while a send is in flight (so the
  // optimistic bubble doesn't get wiped by a mid-send refetch).
  usePolling(refetch, 15_000, !sending);

  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const trimmed = draft.trim();
  const canSend = !!trimmed && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    const text = trimmed;
    setDraft('');
    const ok = await sendMessage(text);
    if (!ok) {
      setDraft(text);
      return;
    }
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const onChangeText = (next: string) => {
    if (sendError) clearSendError();
    setDraft(next);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: false })
        }
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

      {sendError ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText} numberOfLines={2}>
            {sendError}
          </Text>
          <TouchableOpacity
            onPress={clearSendError}
            activeOpacity={0.6}
            style={styles.errorDismiss}
            accessibilityLabel="Dismiss error"
          >
            <Ionicons name="close" size={16} color={C.red} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.composer}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder={`Reply to ${name.split(' ')[0]}…`}
            placeholderTextColor={C.faded}
            value={draft}
            onChangeText={onChangeText}
            multiline
            maxLength={1600}
            editable={!sending}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            accessibilityLabel="Send message"
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="arrow-up"
                size={16}
                color={canSend ? '#FFFFFF' : C.faded}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({
  message,
  who,
}: {
  message: SubcontractorSMSResponse;
  who: string;
}) {
  const isPending = message.id.startsWith('temp-');
  return (
    <View style={styles.bubbleRow}>
      <View style={styles.bubbleColumn}>
        <View style={styles.bubbleMeta}>
          <Text style={styles.bubbleWho}>{who}</Text>
          <Text style={styles.bubbleTime}>
            {isPending ? 'sending…' : relTime(message.create_time)}
          </Text>
        </View>
        <View style={[styles.bubble, isPending && styles.bubblePending]}>
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
  const colors = avatarColors(name);

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

      <View style={[styles.headerAvatar, { backgroundColor: colors.bg }]}>
        <Text style={[styles.headerAvatarText, { color: colors.text }]}>
          {initialsOf(name)}
        </Text>
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
  bubblePending: {
    opacity: 0.55,
  },
  bubbleText: {
    fontSize: 14,
    color: C.ink2,
    lineHeight: 20,
  },
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FBE9E7',
    borderTopWidth: 1,
    borderTopColor: C.red,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: C.red,
  },
  errorDismiss: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 10,
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.sep,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: C.canvas,
    borderColor: C.sep,
    borderWidth: 1,
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.ink,
    paddingVertical: 6,
    paddingRight: 4,
    maxHeight: 120,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.iMsgBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: C.inset,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 12,
    fontWeight: '800',
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
