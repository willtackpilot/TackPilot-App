import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ContactsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Contacts</Text>
      <Text style={styles.subtext}>Your contacts will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 15,
    color: COLORS.gray,
  },
});
