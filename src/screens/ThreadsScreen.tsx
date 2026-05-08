import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { C } from '../constants/theme';
import EmptyState from '../components/EmptyState';

export default function ThreadsScreen() {
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.h1}>Threads</Text>
        <Text style={styles.subtitle}>
          Conversations TackPilot is handling on your behalf.
        </Text>
      </View>

      <View style={styles.body}>
        <EmptyState message="No threads yet. Add crew on People to start." />
      </View>
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
  subtitle: {
    fontSize: 14,
    color: C.muted,
    marginTop: 4,
    maxWidth: 320,
  },
  body: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.sep,
  },
});
