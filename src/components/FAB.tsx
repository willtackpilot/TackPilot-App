import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../constants/theme';

type Props = {
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Floating action button. 56 px C.ink circle, bottom-right, sits
 * 16 px above the safe-area inset so it clears the home indicator
 * on devices with one. Tap is a no-op placeholder for now; each
 * screen can pass an onPress when there's a real action.
 */
export default function FAB({
  onPress,
  accessibilityLabel = 'New',
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity
      onPress={onPress ?? (() => console.log('FAB tap'))}
      activeOpacity={0.85}
      style={[styles.fab, { bottom: insets.bottom + 16 }]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
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
