import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import Logo from '../../assets/logo.svg';

const PHONE = '888-513-3613';
const PHONE_TEL = '+18885133613';

export default function TopBar() {
  const initials = 'W';

  return (
    <View style={styles.bar}>
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
          activeOpacity={0.7}
          style={styles.avatar}
          accessibilityRole="button"
          accessibilityLabel="Account menu"
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
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
});
