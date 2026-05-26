import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { C } from '../constants/theme';
import { apiGet, apiPost } from '../api/client';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatResponse {
  response_text: string;
  actions: object[];
  conversation_id: string;
}

/* ------------------------------------------------------------------ */
/*  Typing indicator — three animated dots                            */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = animateDot(dot1, 0);
    const a2 = animateDot(dot2, 150);
    const a3 = animateDot(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={[styles.bubbleRow, styles.aiBubbleRow]}>
      <View style={[styles.bubble, styles.aiBubble]}>
        <View style={styles.dotsWrap}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ translateY: dot }] }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Message bubble                                                    */
/* ------------------------------------------------------------------ */

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isPending = message.id.startsWith('temp-');

  return (
    <View
      style={[
        styles.bubbleRow,
        isUser ? styles.userBubbleRow : styles.aiBubbleRow,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isPending && styles.bubblePending,
        ]}
      >
        <Text
          style={isUser ? styles.userBubbleText : styles.aiBubbleText}
          selectable
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main screen                                                       */
/* ------------------------------------------------------------------ */

export default function AIChatScreen() {
  const headerHeight = useHeaderHeight();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  // Load history on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const history = await apiGet<ChatMessage[]>(
          '/v1/chat/history?limit=50',
        );
        if (!cancelled) setMessages(history);
      } catch {
        // silently ignore — user sees empty chat
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-scroll when messages change
  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages.length, scrollToEnd]);

  const trimmed = draft.trim();
  const canSend = !!trimmed && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    const text = trimmed;
    setDraft('');

    const tempId = `temp-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: tempId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    // Optimistic append
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await apiPost<ChatResponse>('/v1/chat', {
        message_text: text,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.response_text,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Remove the optimistic user message on failure and restore draft
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageBubble message={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.ink} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="sparkles" size={40} color={C.faded} />
              <Text style={styles.emptyText}>
                Ask TackPilot anything about your jobs, schedule, crew, or
                finances.
              </Text>
            </View>
          }
        />
      )}

      {sending && <TypingIndicator />}

      {/* Composer */}
      <View style={styles.composer}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Message TackPilot AI..."
            placeholderTextColor={C.faded}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={2000}
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

/* ------------------------------------------------------------------ */
/*  Header                                                            */
/* ------------------------------------------------------------------ */

export function AIChatHeader() {
  const nav = useNavigation();

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

      <View style={styles.headerIcon}>
        <Ionicons name="sparkles" size={18} color={C.iMsgBlue} />
      </View>

      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          TackPilot AI
        </Text>
      </View>

      <View style={styles.backBtnSpacer} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  /* Bubble rows */
  bubbleRow: {
    marginBottom: 8,
    flexDirection: 'row',
  },
  userBubbleRow: {
    justifyContent: 'flex-end',
  },
  aiBubbleRow: {
    justifyContent: 'flex-start',
  },

  /* Bubble shared */
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },

  /* User bubble */
  userBubble: {
    backgroundColor: C.iMsgBlue,
    borderBottomRightRadius: 4,
  },
  userBubbleText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 21,
  },

  /* AI bubble */
  aiBubble: {
    backgroundColor: C.iMsg,
    borderBottomLeftRadius: 4,
  },
  aiBubbleText: {
    fontSize: 15,
    color: C.ink,
    lineHeight: 21,
  },

  bubblePending: {
    opacity: 0.55,
  },

  /* Typing dots */
  dotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 20,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.muted,
  },

  /* Composer */
  composer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 10,
    backgroundColor: C.canvas,
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
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.blueSoft,
    justifyContent: 'center',
    alignItems: 'center',
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
