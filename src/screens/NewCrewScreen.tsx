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
import ModalHeader from '../components/ModalHeader';
import {
  FormField,
  FormInput,
  FormError,
  PrimaryButton,
} from '../components/Form';
import { apiPost } from '../api/client';
import type { Subcontractor, SubcontractorCreate } from '../api/types';
import type { RootStackParamList } from '../navigation/types';

const ROLES = ['Contractor', 'Lead', 'Helper', 'Customer', 'Supplier'];

export default function NewCrewScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [trade, setTrade] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('Contractor');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = fullName.trim().length > 0 && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);

    const body: SubcontractorCreate = {
      full_name: fullName.trim(),
      phone_number: phone.trim() || null,
      email: email.trim() || null,
      trade: trade.trim() || null,
      company_name: companyName.trim() || null,
      role,
    };

    setSubmitting(true);
    try {
      await apiPost<Subcontractor>('/v1/subcontractor/create', body);
      nav.goBack();
    } catch (e) {
      setSubmitting(false);
      setError(
        e instanceof Error ? e.message : 'Couldn’t add this person. Try again.',
      );
    }
  };

  return (
    <View style={styles.root}>
      <ModalHeader title="Add crew" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lead}>
            Add a subcontractor, lead, or customer. They'll show up in People
            and get a thread you can text from.
          </Text>

          {error ? <FormError message={error} /> : null}

          <FormField label="Full name" required>
            <FormInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Pat Rivera"
              autoFocus
              autoCapitalize="words"
              maxLength={255}
            />
          </FormField>

          <View style={styles.row2}>
            <View style={styles.col}>
              <FormField label="Phone">
                <FormInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="555-123-4567"
                  keyboardType="phone-pad"
                />
              </FormField>
            </View>
            <View style={styles.col}>
              <FormField label="Email">
                <FormInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="pat@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </FormField>
            </View>
          </View>

          <FormField label="Trade">
            <FormInput
              value={trade}
              onChangeText={setTrade}
              placeholder="Electrical · Plumbing · Painting"
            />
          </FormField>

          <FormField label="Company name">
            <FormInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Rivera Electric LLC"
            />
          </FormField>

          <FormField label="Role">
            <View style={styles.chipRow}>
              {ROLES.map((r) => {
                const active = r === role;
                return (
                  <RoleChip
                    key={r}
                    label={r}
                    active={active}
                    onPress={() => setRole(r)}
                  />
                );
              })}
            </View>
          </FormField>

          <View style={styles.actions}>
            <PrimaryButton
              label="Save"
              onPress={onSubmit}
              loading={submitting}
              disabled={!canSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function RoleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      {label}
    </Text>
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
  lead: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 18,
    marginBottom: 18,
  },
  row2: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.sep,
    backgroundColor: C.canvas,
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: C.ink,
    borderColor: C.ink,
    color: C.canvas,
  },
  actions: {
    marginTop: 12,
  },
});
