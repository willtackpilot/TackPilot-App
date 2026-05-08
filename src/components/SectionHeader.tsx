import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';

type Props = {
  title: string;
  meta?: string;
  onSeeAll?: () => void;
};

export default function SectionHeader({ title, meta, onSeeAll }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll ? (
        <TouchableOpacity
          onPress={onSeeAll}
          activeOpacity={0.6}
          style={styles.linkBtn}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title.toLowerCase()}`}
        >
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
          <Ionicons name="chevron-forward" size={16} color={C.muted} />
        </TouchableOpacity>
      ) : meta ? (
        <Text style={styles.meta}>{meta}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.3,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  meta: {
    fontSize: 13,
    color: C.muted,
  },
});
