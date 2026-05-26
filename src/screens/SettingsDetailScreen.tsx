import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { C } from '../constants/theme';
import type { SettingsStackParamList } from '../navigation/types';

type SectionContent = {
  icon: keyof typeof Ionicons.glyphMap;
  pitch: string;
  bullets: string[];
};

const CONTENT: Record<string, SectionContent> = {
  agents: {
    icon: 'sparkles-outline',
    pitch:
      'Train TackPilot to handle threads the way you would. Set personas, rules, and escalation thresholds.',
    bullets: [
      'Custom voice and tone per persona',
      'Auto-reply rules with safety guardrails',
      'Escalation rules for anything outside scope',
    ],
  },
  channels: {
    icon: 'megaphone-outline',
    pitch:
      'Choose which channels TackPilot uses for outbound messages and which it monitors for replies.',
    bullets: [
      'SMS, email, and voice routing',
      'Per-crew preferences',
      'Quiet hours and rate limits',
    ],
  },
  billing: {
    icon: 'card-outline',
    pitch:
      'Manage your TackPilot plan, payment method, and invoices. Today you manage billing from the web.',
    bullets: ['Plan changes', 'Card on file', 'Receipts and invoices'],
  },
  team: {
    icon: 'people-outline',
    pitch:
      'Invite teammates so they can see jobs, money, and threads from their own login.',
    bullets: ['Owner, manager, and crew roles', 'Per-person permissions', 'Activity log'],
  },
};

export default function SettingsDetailScreen() {
  const route = useRoute<RouteProp<SettingsStackParamList, 'SettingsDetail'>>();
  const { id, label } = route.params;
  const content = CONTENT[id];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>{label}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={content?.icon ?? 'help-circle-outline'}
              size={20}
              color={C.blue}
            />
          </View>
          <View style={styles.soonPill}>
            <Text style={styles.soonText}>COMING SOON</Text>
          </View>
        </View>

        <Text style={styles.pitch}>
          {content?.pitch ??
            'This section is part of the next phase. Hang tight.'}
        </Text>

        {content?.bullets ? (
          <View style={styles.bullets}>
            {content.bullets.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ) : null}
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
    marginBottom: 16,
  },
  h1: {
    fontSize: 28,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.6,
  },
  card: {
    padding: 18,
    backgroundColor: C.canvas,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.sep,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.blueSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soonPill: {
    backgroundColor: C.blueSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  soonText: {
    fontSize: 10,
    fontWeight: '800',
    color: C.blue,
    letterSpacing: 0.8,
  },
  pitch: {
    fontSize: 15,
    color: C.ink2,
    lineHeight: 22,
  },
  bullets: {
    marginTop: 16,
    gap: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.faded,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: C.muted,
    fontWeight: '600',
  },
});
