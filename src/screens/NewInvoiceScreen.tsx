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
import type { InvoiceCreate, InvoiceItem } from '../api/types';
import type { RootStackParamList } from '../navigation/types';

function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[$,\s]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseDate(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return null;
  // Server accepts YYYY-MM-DD.
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export default function NewInvoiceScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [due, setDue] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [dueError, setDueError] = useState<string | null>(null);

  const canSubmit = customer.trim().length > 0 && amount.trim().length > 0 && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setAmountError(null);
    setContactError(null);
    setDueError(null);

    const amt = parseAmount(amount);
    if (amt === null) {
      setAmountError('Enter a positive amount.');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setContactError('Provide a phone or email so they can pay you.');
      return;
    }
    let dueDate: string | null = null;
    if (due.trim()) {
      dueDate = parseDate(due);
      if (!dueDate) {
        setDueError('Use YYYY-MM-DD.');
        return;
      }
    }

    const body: InvoiceCreate = {
      customer_name: customer.trim(),
      customer_phone: phone.trim() || null,
      customer_email: email.trim() || null,
      amount: amt,
      description: description.trim() || null,
      due_date: dueDate,
    };

    setSubmitting(true);
    try {
      await apiPost<InvoiceItem>('/v1/invoices', body);
      nav.goBack();
    } catch (e) {
      setSubmitting(false);
      setError(
        e instanceof Error ? e.message : 'Couldn’t send this invoice. Try again.',
      );
    }
  };

  return (
    <View style={styles.root}>
      <ModalHeader title="New invoice" />
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
            Bill a customer. If QuickBooks is connected, this syncs to QBO
            automatically.
          </Text>

          {error ? <FormError message={error} /> : null}

          <FormField label="Customer name" required>
            <FormInput
              value={customer}
              onChangeText={setCustomer}
              placeholder="Smith family"
              autoFocus
              autoCapitalize="words"
              maxLength={255}
            />
          </FormField>

          <FormField label="Amount" required error={amountError ?? undefined}>
            <FormInput
              value={amount}
              onChangeText={setAmount}
              placeholder="$1,500"
              keyboardType="decimal-pad"
            />
          </FormField>

          <FormField
            label="Contact"
            hint="Phone or email — at least one"
            error={contactError ?? undefined}
          >
            <View style={styles.row2}>
              <View style={styles.col}>
                <FormInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="555-123-4567"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.col}>
                <FormInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="smith@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          </FormField>

          <FormField
            label="Due date"
            hint="YYYY-MM-DD"
            error={dueError ?? undefined}
          >
            <FormInput
              value={due}
              onChangeText={setDue}
              placeholder="2026-05-30"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </FormField>

          <FormField label="Description">
            <FormInput
              value={description}
              onChangeText={setDescription}
              placeholder="Final payment for kitchen repaint"
              multiline
            />
          </FormField>

          <View style={styles.actions}>
            <PrimaryButton
              label="Send invoice"
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
