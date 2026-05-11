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
import Logo from '../../assets/logo.svg';
import type { RootStackParamList } from '../navigation/types';

const PHONE = '888-513-3613';
const PHONE_TEL = '+18885133613';

const DISPLAY_NAME = 'Will Smith';
const DISPLAY_EMAIL = 'you@tackpilot.com';
const INITIALS = 'WS';

const HEADER_HEIGHT = 56;

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  const goSettings = () => {
    closeMenu();
    nav.navigate('SettingsStack');
  };

  const goPeople = () => {
    closeMenu();
    nav.navigate('PeopleStack');
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
        <Logo width={110} height={24} />
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${PHONE_TEL}`)}
          activeOpacity={0.6}
          style={styles.phoneBtn}
          accessibilityRole="button"
          accessibilityLabel={`Call ${PHONE}`}
        >
          <Ionicons name="call" size={13} color={C.blue} />
          <Text style={styles.phoneText}>{PHONE}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log('avatar tap');
            setMenuOpen(true);
          }}
          activeOpacity={0.7}
          style={styles.avatar}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Account menu"
        >
          <Text style={styles.avatarText}>{INITIALS}</Text>
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
                {DISPLAY_NAME}
              </Text>
              <Text style={styles.menuEmail} numberOfLines={1}>
                {DISPLAY_EMAIL}
              </Text>
            </View>

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
    alignItems: 'center',
    gap: 10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.ink2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalRoot: {
    flex: 1,
  },
  menuCard: {
    position: 'absolute',
    width: 220,
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
