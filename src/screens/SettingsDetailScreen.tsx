import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { C } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import type { SettingsStackParamList } from '../navigation/types';

export default function SettingsDetailScreen() {
  const route = useRoute<RouteProp<SettingsStackParamList, 'SettingsDetail'>>();
  const { label } = route.params;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>{label}</Text>
      </View>
      <EmptyState
        variant="card"
        message={`${label} settings are coming soon. Phase 3 wires this destination.`}
      />
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
    fontSize: 28,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.6,
  },
});
