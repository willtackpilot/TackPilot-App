import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { avatarColors } from '../utils/avatar';
import { initialsOf } from '../utils/time';
import type { SettingsStackParamList } from '../navigation/types';

type RowId = 'profile' | 'connectors' | 'agents' | 'channels' | 'billing' | 'team';

type Row = {
  id: RowId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  ready: boolean;
};

const ROWS: Row[] = [
  {
    id: 'profile',
    label: 'Profile',
    subtitle: 'Your name, contact, and location',
    icon: 'person-outline',
    ready: true,
  },
  {
    id: 'connectors',
    label: 'Connectors',
    subtitle: 'QuickBooks, Stripe, Google Calendar',
    icon: 'link-outline',
    ready: true,
  },
  {
    id: 'agents',
    label: 'Agents',
    subtitle: 'TackPilot rules and personas',
    icon: 'sparkles-outline',
    ready: false,
  },
  {
    id: 'channels',
    label: 'Channels',
    subtitle: 'SMS, email, and voice routing',
    icon: 'megaphone-outline',
    ready: false,
  },
  {
    id: 'billing',
    label: 'Billing',
    subtitle: 'Plan and invoices',
    icon: 'card-outline',
    ready: false,
  },
  {
    id: 'team',
    label: 'Team',
    subtitle: 'Invite teammates',
    icon: 'people-outline',
    ready: false,
  },
];

export default function SettingsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const { signOut } = useAuth();
  const { user } = useCurrentUser();
  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : '';
  const colors = avatarColors(displayName);

  const goTo = (row: Row) => {
    if (row.id === 'profile') nav.navigate('Profile');
    else if (row.id === 'connectors') nav.navigate('Connectors');
    else nav.navigate('SettingsDetail', { id: row.id, label: row.label });
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>Settings</Text>
      </View>

      {user ? (
        <View style={styles.userCard}>
          <View style={[styles.avatar, { backgroundColor: colors.bg }]}>
            <Text style={[styles.avatarText, { color: colors.text }]}>
              {initialsOf(displayName) || '?'}
            </Text>
          </View>
          <View style={styles.userText}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName || '—'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
            {user.account ? (
              <Text style={styles.userAccount} numberOfLines={1}>
                {user.account.company_name} · {user.account.plan}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.list}>
        {ROWS.map((row, idx) => (
          <TouchableOpacity
            key={row.id}
            onPress={() => goTo(row)}
            activeOpacity={0.6}
            style={[styles.row, idx === ROWS.length - 1 && styles.rowLast]}
          >
            <View style={styles.rowIcon}>
              <Ionicons name={row.icon} size={18} color={C.ink2} />
            </View>
            <View style={styles.rowText}>
              <View style={styles.rowTitleLine}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                {!row.ready ? (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonText}>SOON</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.faded} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => signOut()}
        activeOpacity={0.6}
        style={styles.signOutBtn}
      >
        <Ionicons name="log-out-outline" size={18} color={C.red} />
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
    marginBottom: 16,
  },
  h1: {
    fontSize: 30,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.canvas,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.sep,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  userText: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
  },
  userEmail: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  userAccount: {
    fontSize: 11,
    color: C.faded,
    marginTop: 2,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  soonBadge: {
    backgroundColor: C.blueSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soonText: {
    fontSize: 9,
    fontWeight: '800',
    color: C.blue,
    letterSpacing: 0.6,
  },
  rowSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    backgroundColor: C.canvas,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.red,
  },
});
