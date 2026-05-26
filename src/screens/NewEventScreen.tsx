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
import type { CalendarEvent, CalendarEventCreate } from '../api/types';
import type { RootStackParamList } from '../navigation/types';

function parseDateTime(text: string): Date | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
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
  return date;
}

export default function NewEventScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);

  const canSubmit =
    title.trim().length > 0 &&
    start.trim().length > 0 &&
    end.trim().length > 0 &&
    !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setStartError(null);
    setEndError(null);

    const startDate = parseDateTime(start);
    const endDate = parseDateTime(end);
    if (!startDate) {
      setStartError('Use YYYY-MM-DD HH:mm.');
      return;
    }
    if (!endDate) {
      setEndError('Use YYYY-MM-DD HH:mm.');
      return;
    }
    if (endDate.getTime() <= startDate.getTime()) {
      setEndError('End has to be after start.');
      return;
    }

    const body: CalendarEventCreate = {
      title: title.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      location: location.trim() || null,
      notes: notes.trim() || null,
    };

    setSubmitting(true);
    try {
      await apiPost<CalendarEvent>('/v1/calendar/events', body);
      nav.goBack();
    } catch (e) {
      setSubmitting(false);
      setError(
        e instanceof Error ? e.message : 'Couldn’t save this event. Try again.',
      );
    }
  };

  return (
    <View style={styles.root}>
      <ModalHeader title="New event" />
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
            Block out a meeting, site visit, or anything that's not yet a job.
          </Text>

          {error ? <FormError message={error} /> : null}

          <FormField label="Title" required>
            <FormInput
              value={title}
              onChangeText={setTitle}
              placeholder="Site walk with Smith"
              autoFocus
              maxLength={500}
            />
          </FormField>

          <FormField
            label="Start"
            hint="YYYY-MM-DD HH:mm"
            required
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

          <FormField
            label="End"
            hint="YYYY-MM-DD HH:mm"
            required
            error={endError ?? undefined}
          >
            <FormInput
              value={end}
              onChangeText={setEnd}
              placeholder="2026-05-22 10:00"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </FormField>

          <FormField label="Location">
            <FormInput
              value={location}
              onChangeText={setLocation}
              placeholder="123 Elm St"
              maxLength={500}
            />
          </FormField>

          <FormField label="Notes">
            <FormInput
              value={notes}
              onChangeText={setNotes}
              placeholder="What's the goal of this meeting?"
              multiline
            />
          </FormField>

          <View style={styles.actions}>
            <PrimaryButton
              label="Add to calendar"
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
  actions: {
    marginTop: 12,
  },
});
