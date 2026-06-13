import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { AuraOrb } from '@/components/AuraOrb';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const passRef = useRef<TextInput>(null);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch {
      setError('Invalid credentials. Please try again.');
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
      <View style={styles.glowTopRight} pointerEvents="none" />
      <View style={styles.glowBottomLeft} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#dee1f9" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoArea}>
          <AuraOrb size={80} colorFrom="#c9bfff" colorTo="#8fd8ff" pulsate />
          <Text style={styles.appName}>Aura AI</Text>
          <Text style={styles.tagline}>LUMINOUS INTELLIGENCE</Text>
        </View>

        {/* Card */}
        <GlassCard style={styles.card} radius={32}>
          <Text style={styles.cardTitle}>Welcome back</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={16} color="#ffb4ab" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.fieldWrapper}>
            <Ionicons name="mail-outline" size={20} color="#928ea1" style={styles.fieldIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="rgba(146,142,161,0.6)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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
              placeholder="Password"
              placeholderTextColor="rgba(146,142,161,0.6)"
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#928ea1" />
            </TouchableOpacity>
          </View>

          <AuraButton
            label={loading ? 'Connecting...' : 'Log In'}
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginBtn}
          />

          <View style={styles.cardFooter}>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign up */}
        <Text style={styles.signupText}>
          {"Don't have an account? "}
          <Text style={styles.signupLink} onPress={() => router.push('/(auth)/register')}>
            Sign Up
          </Text>
        </Text>

        {/* Biometric hint */}
        <TouchableOpacity style={styles.biometricBtn}>
          <Ionicons name="finger-print" size={36} color="rgba(146,142,161,0.5)" />
          <Text style={styles.biometricText}>TAP FOR BIOMETRICS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  glowTopRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(201,191,255,0.07)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(143,216,255,0.04)',
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 20,
    alignItems: 'center',
    minHeight: '100%',
    justifyContent: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoArea: { alignItems: 'center', gap: 10 },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#c9bfff',
  },
  tagline: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: 'rgba(143,216,255,0.7)',
    letterSpacing: 2.5,
  },
  card: { width: '100%', padding: 24, gap: 16 },
  cardTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 20,
    color: '#dee1f9',
    textAlign: 'center',
  },
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    height: 54,
  },
  fieldIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#dee1f9',
    height: '100%',
  },
  eyeBtn: { padding: 4 },
  loginBtn: {},
  cardFooter: { alignItems: 'center' },
  forgotText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#928ea1',
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dividerText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: 'rgba(146,142,161,0.5)',
    letterSpacing: 1,
  },
  signupText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#928ea1',
  },
  signupLink: {
    fontFamily: 'Manrope_600SemiBold',
    color: '#c9bfff',
    textDecorationLine: 'underline',
  },
  biometricBtn: { alignItems: 'center', gap: 8, marginTop: 8 },
  biometricText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: 'rgba(146,142,161,0.5)',
    letterSpacing: 2,
  },
});
