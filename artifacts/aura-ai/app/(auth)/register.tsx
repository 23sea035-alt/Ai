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

import { ParticleField } from '@/components/ParticleField';
import { useApp } from '@/context/AppContext';

function FloatingOrb({
  style,
  duration = 14000,
}: {
  style?: any;
  duration?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }),
          transform: [
            { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
          ],
        },
      ]}
    />
  );
}

function RotatingAura() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true }),
    ).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.auraOverlay,
        { transform: [{ rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
      ]}
    />
  );
}

function LogoIcon() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    ).start();
  }, []);
  const shadowOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] });
  const borderWidth = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 5] });
  const borderOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.7] });
  return (
    <Animated.View
      style={[styles.logoIcon, { shadowOpacity, borderWidth, borderColor: `rgba(168,85,247,${borderOpacity})` }]}
    >
      <Ionicons name="bulb" size={42} color="#fff" />
    </Animated.View>
  );
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [faceId, setFaceId] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;

  const btnScale = useRef(new Animated.Value(1)).current;
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passFocusAnim = useRef(new Animated.Value(0)).current;

  const emailRef = useRef<TextInput>(null);
  const passRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const birthYearRef = useRef<TextInput>(null);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.05)), useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      ]).start();
    }, 200);
  }, []);

  const handleRegister = async () => {
    setError('');
    const birthYearNum = parseInt(birthYear, 10);
    const isBirthYearValid = !isNaN(birthYearNum) && birthYear.length === 4 && birthYearNum > 1900 && birthYearNum <= new Date().getFullYear();

    if (!name || !email || !password || !confirmPassword || !birthYear) {
      setError('Please complete all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isBirthYearValid) {
      setError('Please enter a valid birth year (YYYY).');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, birthYearNum);
      router.replace('/(tabs)');
    } catch {
      setError('Unable to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPressIn = () => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, friction: 8 }).start();

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        locations={[0.2, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <FloatingOrb style={styles.orb1} />
      <FloatingOrb style={styles.orb2} duration={18000} />
      <FloatingOrb style={styles.orb3} duration={16000} />
      <View style={styles.gridOverlay} pointerEvents="none" />
      <ParticleField count={120} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', width: '100%' }}>
          <Animated.View style={[styles.glassCard, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
            <RotatingAura />

            <View style={styles.content}>
              <View style={styles.brand}>
                <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
                  <LogoIcon />
                </Animated.View>
                <Text style={styles.brandName}>Aura AI</Text>
                <Text style={styles.brandTagline}>EXPERIENCE LUMINOUS INTELLIGENCE</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={16} color="#c084fc" style={styles.inputIcon} />
                  <View style={[styles.inputFieldContainer, { borderColor: 'rgba(168,85,247,0.4)', backgroundColor: 'rgba(168,85,247,0.12)' }]}>
                    <TextInput
                      style={styles.inputField}
                      value={name}
                      onChangeText={setName}
                      placeholder="John Doe"
                      placeholderTextColor="rgba(216,180,254,0.45)"
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={16} color="#c084fc" style={styles.inputIcon} />
                  <Animated.View
                    style={[
                      styles.inputFieldContainer,
                      {
                        borderColor: emailFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(168,85,247,0.4)', '#c084fc'],
                        }),
                        backgroundColor: emailFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(168,85,247,0.12)', 'rgba(168,85,247,0.22)'],
                        }),
                      },
                    ]}
                  >
                    <TextInput
                      ref={emailRef}
                      style={styles.inputField}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="hello@aura.ai"
                      placeholderTextColor="rgba(216,180,254,0.45)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={() => passRef.current?.focus()}
                      onFocus={() => Animated.timing(emailFocusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
                      onBlur={() => Animated.timing(emailFocusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
                    />
                  </Animated.View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={16} color="#c084fc" style={styles.inputIcon} />
                  <Animated.View
                    style={[
                      styles.inputFieldContainer,
                      {
                        borderColor: passFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(168,85,247,0.4)', '#c084fc'],
                        }),
                        backgroundColor: passFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(168,85,247,0.12)', 'rgba(168,85,247,0.22)'],
                        }),
                      },
                    ]}
                  >
                    <TextInput
                      ref={passRef}
                      style={[styles.inputField, { flex: 1 }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(216,180,254,0.45)"
                      secureTextEntry={!showPass}
                      returnKeyType="next"
                      onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                      onFocus={() => Animated.timing(passFocusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
                      onBlur={() => Animated.timing(passFocusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
                    />
                    <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                      <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(216,180,254,0.6)" />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#c084fc" style={styles.inputIcon} />
                  <View style={[styles.inputFieldContainer, { borderColor: 'rgba(168,85,247,0.4)', backgroundColor: 'rgba(168,85,247,0.12)' }]}>
                    <TextInput
                      ref={confirmPasswordRef}
                      style={[styles.inputField, { flex: 1 }]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(216,180,254,0.45)"
                      secureTextEntry={!showPass}
                      returnKeyType="next"
                      onSubmitEditing={() => birthYearRef.current?.focus()}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>BIRTH YEAR</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={16} color="#c084fc" style={styles.inputIcon} />
                  <View style={[styles.inputFieldContainer, { borderColor: 'rgba(168,85,247,0.4)', backgroundColor: 'rgba(168,85,247,0.12)' }]}>
                    <TextInput
                      ref={birthYearRef}
                      style={[styles.inputField, { flex: 1 }]}
                      value={birthYear}
                      onChangeText={setBirthYear}
                      placeholder="1990"
                      placeholderTextColor="rgba(216,180,254,0.45)"
                      keyboardType="number-pad"
                      maxLength={4}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <Ionicons name="scan-circle-outline" size={20} color="#c084fc" />
                  <Text style={styles.toggleLabel}>Enable Face ID</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setFaceId(!faceId)}
                  style={[styles.toggleTrack, faceId && styles.toggleTrackActive]}
                >
                  <View style={[styles.toggleThumb, faceId && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  onPress={handleRegister}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  activeOpacity={0.9}
                  style={styles.primaryBtn}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={['#8b5cf6', '#c084fc']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryBtnGrad}
                  >
                    <Ionicons name="sparkles" size={16} color="#fff" />
                    <Text style={styles.primaryBtnText}>
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.footerLinks}>
                <Text style={styles.loginText}>
                  Already have an account?{' '}
                  <Text style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
                    Sign In
                  </Text>
                </Text>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerOr}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                <View style={styles.socialRow}>
                  <TouchableOpacity style={styles.socialBtn}>
                    <Text style={{ fontSize: 20, color: '#dee1f9', fontFamily: 'Manrope_700Bold' }}>G</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialBtn}>
                    <Text style={{ fontSize: 20, color: '#dee1f9', fontFamily: 'Manrope_700Bold' }}></Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingHorizontal: 20 },
  orb1: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(168,85,247,0.35)',
  },
  orb2: {
    position: 'absolute',
    bottom: -180,
    right: -180,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(168,85,247,0.3)',
  },
  orb3: {
    position: 'absolute',
    top: '40%',
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168,85,247,0.2)',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  scroll: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  glassCard: {
    maxWidth: 420,
    width: '100%',
    backgroundColor: 'rgba(15, 12, 35, 0.45)',
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 35 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 20,
  },
  auraOverlay: {
    position: 'absolute',
    top: '-20%',
    left: '-20%',
    width: '140%',
    height: '140%',
    backgroundColor: 'rgba(192,132,252,0.06)',
    borderRadius: 300,
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 28,
  },
  brand: { alignItems: 'center', marginBottom: 24 },
  logoIcon: {
    width: 75,
    height: 75,
    borderRadius: 26,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
    overflow: 'hidden',
  },
  brandName: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 34,
    color: '#fff',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: 'rgba(216,180,254,0.9)',
    letterSpacing: 1.2,
    marginTop: 6,
  },
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: 'rgba(216,180,254,0.9)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 18, top: 20, zIndex: 3 },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    borderWidth: 1.5,
    paddingLeft: 48,
    paddingRight: 12,
    height: 52,
  },
  inputField: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: '#fff',
    height: '100%',
  },
  eyeBtn: { paddingHorizontal: 6, paddingVertical: 6 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 4,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: { backgroundColor: '#8b5cf6' },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
  errorText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#ff8ea6',
    textAlign: 'center',
    marginBottom: 8,
  },
  primaryBtn: {
    borderRadius: 60,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: 'rgba(139,92,246,0.5)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
  },
  primaryBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  primaryBtnText: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 17,
    color: '#fff',
  },
  footerLinks: { alignItems: 'center', gap: 16, paddingTop: 12 },
  loginText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(216,180,254,0.7)',
  },
  loginLink: {
    fontFamily: 'Manrope_700Bold',
    color: '#c084fc',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(168,85,247,0.25)',
  },
  dividerOr: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: 'rgba(216,180,254,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  socialRow: { flexDirection: 'row', gap: 16 },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
