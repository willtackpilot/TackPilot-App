import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../constants/theme';

type Props = {
  message: string;
  variant?: 'plain' | 'card';
};

export default function EmptyState({ message, variant = 'plain' }: Props) {
  if (variant === 'card') {
    return (
      <View style={styles.card}>
        <Text style={styles.text}>{message}</Text>
      </View>
    );
  }
  return (
    <View style={styles.plain}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  plain: {
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  card: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
  },
  text: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
