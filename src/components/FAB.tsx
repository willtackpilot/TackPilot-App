import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../constants/theme';
import { useCreateMenu } from '../context/CreateMenuContext';

type Props = {
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  accessibilityLabel?: string;
};

export default function FAB({
  onPress,
  icon = 'add',
  accessibilityLabel = 'Create',
}: Props) {
  const insets = useSafeAreaInsets();
  const { open } = useCreateMenu();
  return (
    <TouchableOpacity
      onPress={onPress ?? (() => open())}
      activeOpacity={0.85}
      style={[styles.fab, { bottom: insets.bottom + 16 }]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.ink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.ink,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
});
