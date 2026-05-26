import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { C } from '../constants/theme';
import { apiGet, apiPost, apiDelete } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { avatarColors } from '../utils/avatar';
import { initialsOf } from '../utils/time';
import { FormInput, PrimaryButton } from '../components/Form';
import EmptyState from '../components/EmptyState';

/* ── Types ── */

interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: string;
  created_at: string;
}

type Role = 'owner' | 'admin' | 'member';

const ROLES: Role[] = ['owner', 'admin', 'member'];

/* ── Helpers ── */

function memberName(m: TeamMember): string {
  const parts = [m.first_name, m.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : m.email;
}

function rolePillStyle(role: string): { bg: string; fg: string } {
  switch (role) {
    case 'owner':
      return { bg: C.ink, fg: '#FFFFFF' };
    case 'admin':
      return { bg: C.blue, fg: '#FFFFFF' };
    default:
      return { bg: C.inset, fg: C.ink2 };
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Screen ── */

export default function TeamScreen() {
  const { currentUser } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Invite form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const isOwnerOrAdmin =
    currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const fetchMembers = useCallback(async () => {
    try {
      const res = await apiGet<TeamMember[]>('/v1/team/members');
      setMembers(res);
      setError(null);
    } catch {
      setError('Could not load team members. Pull down to retry.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchMembers();
      setLoading(false);
    })();
  }, [fetchMembers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  }, [fetchMembers]);

  /* ── Invite ── */

  const resetInviteForm = () => {
    setInviteEmail('');
    setInviteName('');
    setInviteRole('member');
    setInviteError(null);
  };

  const toggleInvite = () => {
    if (showInvite) {
      resetInviteForm();
    }
    setShowInvite((prev) => !prev);
  };

  const sendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      setInviteError('Email is required.');
      return;
    }
    setInviteError(null);
    setInviting(true);
    try {
      await apiPost('/v1/team/invite', {
        email,
        name: inviteName.trim() || undefined,
        role: inviteRole,
      });
      resetInviteForm();
      setShowInvite(false);
      await fetchMembers();
    } catch (e) {
      setInviteError(
        e instanceof Error ? e.message : 'Could not send invite. Try again.',
      );
    } finally {
      setInviting(false);
    }
  };

  /* ── Remove ── */

  const confirmRemove = (member: TeamMember) => {
    Alert.alert(
      'Remove member',
      `Remove ${memberName(member)} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDelete(`/v1/team/members/${member.id}`);
              await fetchMembers();
            } catch {
              // silent — member list will stay stale until next refresh
            }
          },
        },
      ],
    );
  };

  /* ── Render ── */

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.h1}>Team</Text>
            <Text style={styles.subtitle}>
              {members.length === 1
                ? '1 member'
                : `${members.length} members`}
            </Text>
          </View>
          {isOwnerOrAdmin ? (
            <TouchableOpacity
              onPress={toggleInvite}
              activeOpacity={0.7}
              style={styles.inviteToggleBtn}
            >
              <Text style={styles.inviteToggleText}>
                {showInvite ? 'Cancel' : 'Invite'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Invite form (inline) */}
      {showInvite ? (
        <View style={styles.inviteCard}>
          <Text style={styles.inviteTitle}>Invite a teammate</Text>

          <FormInput
            placeholder="Email address"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.inviteInput}
          />

          <FormInput
            placeholder="Name (optional)"
            value={inviteName}
            onChangeText={setInviteName}
            autoCapitalize="words"
            style={styles.inviteInput}
          />

          <Text style={styles.roleLabel}>ROLE</Text>
          <View style={styles.roleChips}>
            {ROLES.map((r) => {
              const active = inviteRole === r;
              const pill = rolePillStyle(r);
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setInviteRole(r)}
                  activeOpacity={0.7}
                  style={[
                    styles.roleChip,
                    active
                      ? { backgroundColor: pill.bg }
                      : { backgroundColor: C.inset },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      active ? { color: pill.fg } : { color: C.muted },
                    ]}
                  >
                    {capitalize(r)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {inviteError ? (
            <Text style={styles.inviteError}>{inviteError}</Text>
          ) : null}

          <PrimaryButton
            label="Send invite"
            onPress={sendInvite}
            loading={inviting}
            disabled={!inviteEmail.trim()}
          />
        </View>
      ) : null}

      {/* Loading */}
      {loading && members.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.ink} />
        </View>
      ) : error && members.length === 0 ? (
        <EmptyState message={error} variant="card" />
      ) : members.length === 0 ? (
        <EmptyState
          message="No team members yet. Invite someone to get started."
          variant="card"
        />
      ) : (
        /* Member list */
        <View style={styles.list}>
          {members.map((member, idx) => {
            const name = memberName(member);
            const colors = avatarColors(name);
            const pill = rolePillStyle(member.role);
            const isLast = idx === members.length - 1;
            const isSelf = currentUser?.id === member.id;

            return (
              <View
                key={member.id}
                style={[styles.row, isLast && styles.rowLast]}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.avatarText, { color: colors.text }]}>
                    {initialsOf(name)}
                  </Text>
                </View>

                {/* Info */}
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.rowEmail} numberOfLines={1}>
                    {member.email}
                  </Text>
                  {member.status !== 'active' ? (
                    <Text style={styles.rowStatus}>
                      {capitalize(member.status)}
                    </Text>
                  ) : null}
                </View>

                {/* Role pill */}
                <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                  <Text style={[styles.pillText, { color: pill.fg }]}>
                    {capitalize(member.role)}
                  </Text>
                </View>

                {/* Remove button */}
                {isOwnerOrAdmin && !isSelf ? (
                  <TouchableOpacity
                    onPress={() => confirmRemove(member)}
                    activeOpacity={0.6}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

/* ── Styles ── */

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
    marginBottom: 18,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  h1: {
    fontSize: 28,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
  },
  inviteToggleBtn: {
    backgroundColor: C.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 2,
  },
  inviteToggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: C.canvas,
  },

  /* Invite card */
  inviteCard: {
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    padding: 16,
    marginBottom: 18,
  },
  inviteTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 12,
  },
  inviteInput: {
    marginBottom: 10,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  roleChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inviteError: {
    fontSize: 12,
    fontWeight: '600',
    color: C.red,
    marginBottom: 10,
  },

  /* Loading / empty */
  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },

  /* Member list */
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  rowLast: {
    borderBottomWidth: 0,
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
  rowInfo: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  rowEmail: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  rowStatus: {
    fontSize: 11,
    color: C.faded,
    fontWeight: '600',
    marginTop: 2,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  removeText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.red,
  },
});
