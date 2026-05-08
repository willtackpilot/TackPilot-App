import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { SettingsStackParamList } from '../navigation/types';

type ItemId = 'profile' | 'agents' | 'connectors' | 'channels' | 'billing' | 'team';

type Item = { id: ItemId; label: string; subtitle: string };

const ITEMS: Item[] = [
  { id: 'profile', label: 'Profile', subtitle: 'Your account information' },
  { id: 'agents', label: 'Agents', subtitle: 'TackPilot rules and personas' },
  { id: 'connectors', label: 'Connectors', subtitle: 'QuickBooks, Stripe, Google' },
  { id: 'channels', label: 'Channels', subtitle: 'SMS, email, voice' },
  { id: 'billing', label: 'Billing', subtitle: 'Plan and invoices' },
  { id: 'team', label: 'Team', subtitle: 'Invite teammates' },
];

export default function SettingsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const { signOut } = useAuth();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>Settings</Text>
      </View>

      <View style={styles.list}>
        {ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => nav.navigate('SettingsDetail', { id: item.id, label: item.label })}
            activeOpacity={0.6}
            style={[styles.row, idx === ITEMS.length - 1 && styles.rowLast]}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faded} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={signOut}
        activeOpacity={0.7}
        style={styles.signOut}
      >
        <Ionicons name="log-out-outline" size={16} color={C.red} />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  rowSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 20,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.red,
  },
});
