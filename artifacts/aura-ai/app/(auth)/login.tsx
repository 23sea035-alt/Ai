import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { GradientBorder } from '@/components/GradientBorder';
import { ParticleField } from '@/components/ParticleField';
import { StarField } from '@/components/StarField';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const passRef = useRef<TextInput>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.timing(cardAnim, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.05)), useNativeDriver: true }).start();
    }, 200);
  }, []);

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
        colors={['#060a18', '#0B1020', '#121A35', '#1A1F4B']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <StarField count={60} />
      <ParticleField count={14} />
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <Animated.View style={{ opacity: fadeAnim, alignSelf: 'flex-start' }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <GradientBorder colors={['rgba(201,191,255,0.4)', 'rgba(143,216,255,0.2)']} radius={14} borderWidth={1} innerStyle={styles.backInner}>
              <Ionicons name="arrow-back" size={20} color="#dee1f9" />
            </GradientBorder>
          </TouchableOpacity>
        </Animated.View>

        {/* Logo */}
        <Animated.View
          style={[styles.logoArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <AuraOrb size={90} colorFrom="#c9bfff" colorTo="#8fd8ff" pulsate />
          <Text style={styles.appName}>Aura AI</Text>
          <Text style={styles.tagline}>LUMINOUS INTELLIGENCE</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            styles.cardOuter,
            {
              opacity: cardAnim,
              transform: [
                { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
              ],
            },
          ]}
        >
          <GradientBorder
            colors={['rgba(201,191,255,0.45)', 'rgba(143,216,255,0.3)', 'rgba(201,191,255,0.2)']}
            radius={28}
            borderWidth={1.5}
            innerStyle={styles.cardInner}
          >
            <Text style={styles.cardTitle}>Welcome back</Text>

            {error ? (
              <GradientBorder colors={['rgba(255,100,90,0.5)', 'rgba(255,100,90,0.2)']} radius={14} borderWidth={1} innerStyle={styles.errorInner}>
                <Ionicons name="warning-outline" size={15} color="#ff8b8b" />
                <Text style={styles.errorText}>{error}</Text>
              </GradientBorder>
            ) : null}

            {/* Email input */}
            <GradientBorder
              colors={emailFocused ? ['#c9bfff', '#8fd8ff'] : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.06)']}
              radius={16}
              borderWidth={emailFocused ? 1.5 : 1}
              innerStyle={styles.fieldInner}
            >
              <View style={[styles.fieldIconBox, { backgroundColor: emailFocused ? '#c9bfff22' : 'rgba(255,255,255,0.04)' }]}>
                <Ionicons name="mail-outline" size={18} color={emailFocused ? '#c9bfff' : '#928ea1'} />
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="rgba(146,142,161,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onSubmitEditing={() => passRef.current?.focus()}
              />
            </GradientBorder>

            {/* Password input */}
            <GradientBorder
              colors={passFocused ? ['#c9bfff', '#8fd8ff'] : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.06)']}
              radius={16}
              borderWidth={passFocused ? 1.5 : 1}
              innerStyle={styles.fieldInner}
            >
              <View style={[styles.fieldIconBox, { backgroundColor: passFocused ? '#c9bfff22' : 'rgba(255,255,255,0.04)' }]}>
                <Ionicons name="lock-closed-outline" size={18} color={passFocused ? '#c9bfff' : '#928ea1'} />
              </View>
              <TextInput
                ref={passRef}
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="rgba(146,142,161,0.5)"
                secureTextEntry={!showPass}
                returnKeyType="done"
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#928ea1" />
              </TouchableOpacity>
            </GradientBorder>

            {/* Forgot */}
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AuraButton label={loading ? 'Connecting…' : 'Sign In'} onPress={handleLogin} disabled={loading} />
          </GradientBorder>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          {[
            { icon: '🍎', label: 'Continue with Apple', colors: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'] as const },
            { icon: '🔵', label: 'Google', colors: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] as const },
          ].map((s) => (
            <TouchableOpacity key={s.label} activeOpacity={0.8} style={styles.socialBtnWrapper}>
              <GradientBorder
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)']}
                radius={999}
                borderWidth={1}
                innerStyle={styles.socialInner}
              >
                <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                <Text style={styles.socialLabel}>{s.label}</Text>
              </GradientBorder>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign up */}
        <Text style={styles.signupText}>
          {'New to Aura AI? '}
          <Text style={styles.signupLink} onPress={() => router.push('/(auth)/register')}>
            Create Account
          </Text>
        </Text>

        {/* Biometric */}
        <TouchableOpacity style={styles.biometricBtn} activeOpacity={0.7}>
          <GradientBorder colors={['rgba(201,191,255,0.25)', 'rgba(143,216,255,0.15)']} radius={999} borderWidth={1} innerStyle={styles.biometricInner}>
            <Ionicons name="finger-print" size={28} color="rgba(201,191,255,0.6)" />
          </GradientBorder>
          <Text style={styles.biometricText}>FACE ID  ·  TOUCH ID</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(201,191,255,0.08)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(143,216,255,0.05)',
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 20,
    alignItems: 'center',
    minHeight: '100%',
    justifyContent: 'center',
  },
  backBtn: {},
  backInner: { padding: 10 },
  logoArea: { alignItems: 'center', gap: 10 },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 30,
    color: '#dee1f9',
    letterSpacing: -0.4,
  },
  tagline: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: 'rgba(143,216,255,0.7)',
    letterSpacing: 3,
  },
  cardOuter: { width: '100%' },
  cardInner: { padding: 24, gap: 16 },
  cardTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 22,
    color: '#dee1f9',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  errorInner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#ffb4ab', flex: 1 },
  fieldInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    height: 56,
    gap: 10,
  },
  fieldIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#dee1f9',
    height: '100%',
  },
  eyeBtn: { paddingHorizontal: 12 },
  forgotRow: { alignSelf: 'flex-end' },
  forgotText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#8fd8ff',
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dividerText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: 'rgba(146,142,161,0.45)',
    letterSpacing: 1.5,
  },
  socialRow: { flexDirection: 'row', gap: 10, width: '100%' },
  socialBtnWrapper: { flex: 1 },
  socialInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  socialLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#dee1f9',
  },
  signupText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#928ea1',
  },
  signupLink: {
    fontFamily: 'Manrope_600SemiBold',
    color: '#c9bfff',
  },
  biometricBtn: { alignItems: 'center', gap: 10 },
  biometricInner: { padding: 14 },
  biometricText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: 'rgba(146,142,161,0.45)',
    letterSpacing: 2.5,
  },
});
