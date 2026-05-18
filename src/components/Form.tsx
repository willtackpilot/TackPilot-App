import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  type TextInputProps,
} from 'react-native';
import { C } from '../constants/theme';

export function FormField({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export const FormInput = React.forwardRef<TextInput, TextInputProps>(
  function FormInput(props, ref) {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={C.faded}
        {...props}
        style={[styles.input, props.multiline && styles.inputMulti, props.style]}
      />
    );
  },
);

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[styles.primaryBtn, isDisabled && styles.primaryBtnDisabled]}
    >
      {loading ? (
        <ActivityIndicator color={C.canvas} />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} style={styles.ghostBtn}>
      <Text style={styles.ghostBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorBoxText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  required: {
    color: C.red,
  },
  hint: {
    fontSize: 11,
    color: C.faded,
    fontWeight: '500',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: C.sep,
    backgroundColor: C.canvas,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: C.ink,
  },
  inputMulti: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: C.red,
    fontWeight: '600',
    marginTop: 6,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: C.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.canvas,
    letterSpacing: 0.2,
  },
  ghostBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.muted,
  },
  errorBox: {
    backgroundColor: '#FBE9E7',
    borderColor: C.red,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorBoxText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.red,
  },
});
