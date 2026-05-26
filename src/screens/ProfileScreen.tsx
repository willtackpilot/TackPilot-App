import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { C } from '../constants/theme';
import {
  FormField,
  FormInput,
  FormError,
  PrimaryButton,
} from '../components/Form';
import { apiPatch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { User, UserUpdate } from '../api/types';
import type { SettingsStackParamList } from '../navigation/types';

export default function ProfileScreen() {
  const nav = useNavigation<NavigationProp<SettingsStackParamList>>();
  const { currentUser, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(currentUser?.first_name ?? '');
  const [lastName, setLastName] = useState(currentUser?.last_name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState(currentUser?.phone_number ?? '');
  const [city, setCity] = useState(currentUser?.city ?? '');
  const [state, setState] = useState(currentUser?.state ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSaved(false);
    setSubmitting(true);
    const body: UserUpdate = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      email: email.trim() || null,
      phone_number: phone.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
    };
    try {
      await apiPatch<User>('/v1/user/update_user', body);
      await refreshUser();
      setSaved(true);
      // Bounce back after a beat so the user sees confirmation.
      setTimeout(() => {
        if (nav.canGoBack()) nav.goBack();
      }, 400);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Couldn’t save those changes. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.h1}>Profile</Text>
            <Text style={styles.subtitle}>
              How you show up to your crew and customers.
            </Text>
          </View>

          {error ? <FormError message={error} /> : null}
          {saved ? (
            <View style={styles.savedBox}>
              <Text style={styles.savedText}>Saved.</Text>
            </View>
          ) : null}

          <View style={styles.row2}>
            <View style={styles.col}>
              <FormField label="First name">
                <FormInput
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </FormField>
            </View>
            <View style={styles.col}>
              <FormField label="Last name">
                <FormInput
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </FormField>
            </View>
          </View>

          <FormField label="Email">
            <FormInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </FormField>

          <FormField label="Phone">
            <FormInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </FormField>

          <View style={styles.row2}>
            <View style={styles.col2}>
              <FormField label="City">
                <FormInput
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                />
              </FormField>
            </View>
            <View style={styles.col1}>
              <FormField label="State">
                <FormInput
                  value={state}
                  onChangeText={setState}
                  autoCapitalize="characters"
                  maxLength={2}
                />
              </FormField>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Save changes"
              onPress={onSubmit}
              loading={submitting}
            />
          </View>

          {currentUser?.account ? (
            <View style={styles.accountCard}>
              <Text style={styles.accountLabel}>ACCOUNT</Text>
              <Text style={styles.accountName}>
                {currentUser.account.company_name}
              </Text>
              <Text style={styles.accountMeta}>
                {currentUser.account.plan} plan
                {currentUser.account.trial_ends_at
                  ? ` · trial ends ${new Date(
                      currentUser.account.trial_ends_at,
                    ).toLocaleDateString()}`
                  : ''}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 18,
  },
  h1: {
    fontSize: 28,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
  },
  row2: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  col1: {
    flex: 1,
  },
  col2: {
    flex: 2,
  },
  actions: {
    marginTop: 6,
  },
  savedBox: {
    backgroundColor: C.greenSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  savedText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.green,
  },
  accountCard: {
    marginTop: 28,
    padding: 16,
    backgroundColor: C.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.sep,
  },
  accountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
  },
  accountMeta: {
    fontSize: 12,
    color: C.muted,
    marginTop: 4,
  },
});
