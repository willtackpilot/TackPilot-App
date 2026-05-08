import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { C, API_BASE_URL } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import Logo from '../../assets/logo.svg';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, is_remember: true }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Login failed');
      }
      const access = data.access_token ?? data.token ?? data.accessToken;
      const refresh = data.refresh_token ?? data.refreshToken;
      if (!access) throw new Error('Login response missing access token');
      await signIn(access, refresh);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.fontGate}>
        <ActivityIndicator color={C.ink} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.logoRow}>
              <Logo width={140} height={32} />
            </View>

            <Text style={styles.heading}>Welcome back.</Text>
            <Text style={styles.subheading}>
              Sign in to keep your jobs and contacts moving.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={C.faded}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor={C.faded}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={C.canvas} />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgot} activeOpacity={0.6}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
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
  fontGate: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: C.canvas,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.sep,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: C.ink,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 4,
  },
  logoRow: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heading: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 30,
    color: C.ink,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheading: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: C.muted,
    marginBottom: 22,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: C.ink2,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.sep,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: C.ink,
    backgroundColor: C.canvas,
    marginBottom: 14,
    fontFamily: 'Nunito_400Regular',
  },
  button: {
    height: 50,
    backgroundColor: C.ink,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: C.canvas,
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 0.2,
  },
  forgot: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 6,
  },
  forgotText: {
    fontSize: 14,
    color: C.blue,
    fontFamily: 'Nunito_700Bold',
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
  errorText: {
    color: C.red,
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
});
