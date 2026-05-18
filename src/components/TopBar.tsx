import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useNotifications } from '../hooks/useNotifications';
import { avatarColors } from '../utils/avatar';
import { initialsOf } from '../utils/time';
import type { RootStackParamList } from '../navigation/types';

const PHONE = '888-513-3613';
const PHONE_TEL = '+18885133613';

const HEADER_HEIGHT = 56;

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useCurrentUser();
  const { unreadCount } = useNotifications({ limit: 30 });

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : '—';
  const displayEmail = user?.email ?? '';
  const initials = initialsOf(displayName === '—' ? '' : displayName) || '?';
  const avatarSwatch = avatarColors(displayName === '—' ? '' : displayName);

  const closeMenu = () => setMenuOpen(false);

  const goSettings = () => {
    closeMenu();
    nav.navigate('SettingsStack');
  };

  const goPeople = () => {
    closeMenu();
    nav.navigate('PeopleStack');
  };

  const callPhone = () => {
    closeMenu();
    void Linking.openURL(`tel:${PHONE_TEL}`);
  };

  const handleSignOut = () => {
    closeMenu();
    void signOut();
  };

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top, height: HEADER_HEIGHT + insets.top },
      ]}
    >
      <View style={styles.left}>
        <Text style={styles.wordmarkTack}>Tack</Text>
        <Text style={styles.wordmarkPilot}>Pilot</Text>
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          onPress={() => nav.navigate('Notifications')}
          activeOpacity={0.6}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
        >
          <Ionicons name="notifications-outline" size={20} color={C.ink2} />
          {unreadCount > 0 ? (
            <View style={styles.bellDot}>
              <Text style={styles.bellDotText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.7}
          style={[styles.avatar, { backgroundColor: avatarSwatch.bg }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Account menu"
        >
          <Text style={[styles.avatarText, { color: avatarSwatch.text }]}>
            {initials}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
          <View
            style={[
              styles.menuCard,
              { top: insets.top + HEADER_HEIGHT + 4, right: 12 },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuName} numberOfLines={1}>
                {displayName}
              </Text>
              {displayEmail ? (
                <Text style={styles.menuEmail} numberOfLines={1}>
                  {displayEmail}
                </Text>
              ) : null}
            </View>

            <MenuRow
              icon="call-outline"
              label={PHONE}
              color={C.ink2}
              onPress={callPhone}
            />
            <MenuRow
              icon="settings-outline"
              label="Settings"
              color={C.ink2}
              onPress={goSettings}
            />
            <MenuRow
              icon="people-outline"
              label="People"
              color={C.ink2}
              onPress={goPeople}
            />
            <MenuRow
              icon="log-out-outline"
              label="Sign out"
              color={C.red}
              onPress={handleSignOut}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={styles.menuRow}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.menuRowText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    backgroundColor: C.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.sep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordmarkTack: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: C.ink,
    letterSpacing: -0.4,
  },
  wordmarkPilot: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: C.blue,
    letterSpacing: -0.4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 3,
    borderRadius: 7,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellDotText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalRoot: {
    flex: 1,
  },
  menuCard: {
    position: 'absolute',
    width: 240,
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
    overflow: 'hidden',
    shadowColor: C.ink,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  menuHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.sep,
  },
  menuName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
  },
  menuEmail: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuRowText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
