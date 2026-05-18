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
import type { JobCreate, Job } from '../api/types';
import type { RootStackParamList } from '../navigation/types';

function parseDateInput(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  // Accept YYYY-MM-DD or YYYY-MM-DD HH:mm.
  const m = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/,
  );
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  const date = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    hh ? Number(hh) : 9,
    mm ? Number(mm) : 0,
  );
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default function NewJobScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [start, setStart] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setStartError(null);

    let plannedStart: string | null = null;
    if (start.trim()) {
      plannedStart = parseDateInput(start);
      if (!plannedStart) {
        setStartError('Use YYYY-MM-DD or YYYY-MM-DD HH:mm.');
        return;
      }
    }

    const body: JobCreate = {
      title: title.trim(),
      address: address.trim() || null,
      city: city.trim() || null,
      phone: phone.trim() || null,
      description: description.trim() || null,
      planned_start_time: plannedStart,
    };

    setSubmitting(true);
    try {
      await apiPost<Job>('/v1/job/create', body);
      nav.goBack();
    } catch (e) {
      setSubmitting(false);
      setError(
        e instanceof Error ? e.message : 'Couldn’t create the job. Try again.',
      );
    }
  };

  return (
    <View style={styles.root}>
      <ModalHeader title="New job" />
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
            Start a job. You can add tasks, schedule, and assign crew from the
            job detail after it's saved.
          </Text>

          {error ? <FormError message={error} /> : null}

          <FormField label="Title" required>
            <FormInput
              value={title}
              onChangeText={setTitle}
              placeholder="Repaint Smith kitchen"
              autoFocus
              maxLength={500}
            />
          </FormField>

          <FormField label="Address">
            <FormInput
              value={address}
              onChangeText={setAddress}
              placeholder="123 Elm St"
              maxLength={1000}
            />
          </FormField>

          <View style={styles.row2}>
            <View style={styles.col}>
              <FormField label="City">
                <FormInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Cambridge"
                  maxLength={255}
                />
              </FormField>
            </View>
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
          </View>

          <FormField
            label="Start"
            hint="YYYY-MM-DD or YYYY-MM-DD HH:mm"
            error={startError ?? undefined}
          >
            <FormInput
              value={start}
              onChangeText={setStart}
              placeholder="2026-05-22 09:00"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </FormField>

          <FormField label="Notes">
            <FormInput
              value={description}
              onChangeText={setDescription}
              placeholder="Scope, contact preferences, anything to remember…"
              multiline
              maxLength={10000}
            />
          </FormField>

          <View style={styles.actions}>
            <PrimaryButton
              label="Create job"
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
  actions: {
    marginTop: 12,
  },
});
