import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraButton } from '@/components/AuraButton';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef<TextInput>(null);
  const passRef = useRef<TextInput>(null);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/age-verification');
    } catch {
      setError('Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#1A1F4B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#dee1f9" />
        </TouchableOpacity>

        <Text style={styles.eyebrow}>JOIN AURA AI</Text>
        <Text style={styles.title}>Create your{'\n'}account</Text>
        <Text style={styles.subtitle}>Begin your journey with an AI companion that truly knows you.</Text>

        <GlassCard style={styles.card} radius={28}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={16} color="#ffb4ab" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Name */}
          <View style={styles.fieldWrapper}>
            <Ionicons name="person-outline" size={20} color="#928ea1" style={styles.fieldIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="rgba(146,142,161,0.6)"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>

          {/* Email */}
          <View style={styles.fieldWrapper}>
            <Ionicons name="mail-outline" size={20} color="#928ea1" style={styles.fieldIcon} />
            <TextInput
              ref={emailRef}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="rgba(146,142,161,0.6)"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passRef.current?.focus()}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#928ea1" style={styles.fieldIcon} />
            <TextInput
              ref={passRef}
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (6+ chars)"
              placeholderTextColor="rgba(146,142,161,0.6)"
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#928ea1" />
            </TouchableOpacity>
          </View>

          <AuraButton
            label={loading ? 'Creating...' : 'Create Account'}
            onPress={handleRegister}
            disabled={loading}
          />

          <Text style={styles.terms}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </GlassCard>

        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
            Log In
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  scroll: { paddingHorizontal: 20, gap: 16 },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  eyebrow: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#8fd8ff',
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#dee1f9',
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.7)',
    lineHeight: 21,
  },
  card: { padding: 24, gap: 14 },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,180,171,0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.2)',
  },
  errorText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#ffb4ab',
    flex: 1,
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    height: 52,
  },
  fieldIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#dee1f9',
    height: '100%',
  },
  terms: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: 'rgba(146,142,161,0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { textDecorationLine: 'underline', color: '#928ea1' },
  loginText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#928ea1',
    textAlign: 'center',
  },
  loginLink: {
    fontFamily: 'Manrope_600SemiBold',
    color: '#c9bfff',
    textDecorationLine: 'underline',
  },
});
