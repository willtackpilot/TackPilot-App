import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import Logo from '../../assets/logo.svg';
import { apiRequest } from '../api/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  imageUri?: string;
}

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -8, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.typingContainer}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

function WelcomeMessage({ onQuickAction }: { onQuickAction: (text: string) => void }) {
  return (
    <View style={styles.welcomeContainer}>
      <View style={styles.logoContainer}>
        <Logo width={200} height={48} />
      </View>
      <Text style={styles.welcomeTitle}>TackPilot AI</Text>
      <Text style={styles.welcomeSubtitle}>
        Your AI-powered operations manager. Ask me anything about your jobs, schedule, contacts, or finances.
      </Text>
      <View style={styles.quickActions}>
        {['Create a job', 'Check schedule', 'Find a sub'].map((label) => (
          <TouchableOpacity
            key={label}
            style={styles.quickActionPill}
            onPress={() => onQuickAction(label)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async (text: string, imageUri?: string) => {
    if (!text.trim() && !imageUri) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      imageUri,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const body: Record<string, string> = { message: text.trim() };
      if (imageUri) body.image = imageUri;

      const res = await apiRequest('/v1/chat', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.message || 'No response',
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined;
      sendMessage('📷 Photo', base64 || asset.uri);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.bubbleText, isUser && styles.userText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messageList,
          messages.length === 0 && styles.messageListEmpty,
        ]}
        ListEmptyComponent={<WelcomeMessage onQuickAction={(text) => sendMessage(text)} />}
        ListFooterComponent={sending ? <TypingIndicator /> : null}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputBar}>
        <TouchableOpacity onPress={pickImage} style={styles.cameraButton}>
          <Ionicons name="camera" size={26} color={COLORS.navy} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Message..."
          placeholderTextColor={COLORS.placeholder}
          value={input}
          onChangeText={setInput}
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          onPress={() => sendMessage(input)}
          disabled={sending || !input.trim()}
          style={[
            styles.sendButton,
            (!input.trim() || sending) && styles.sendButtonDisabled,
          ]}
        >
          <Ionicons name="arrow-up-circle" size={34} color={COLORS.navy} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  messageListEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.gray,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  quickActionPill: {
    borderWidth: 1.5,
    borderColor: COLORS.userBubble,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.userBubble,
  },
  typingContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.aiBubble,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.userBubble,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 21,
    color: COLORS.black,
  },
  userText: {
    color: COLORS.white,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    backgroundColor: COLORS.white,
  },
  cameraButton: {
    padding: 6,
    marginRight: 4,
    marginBottom: 2,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.lightGray,
  },
  sendButton: {
    padding: 4,
    marginLeft: 4,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
