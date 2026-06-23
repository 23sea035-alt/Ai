import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParticleField } from '@/components/ParticleField';
import { useApp } from '@/context/AppContext';

// ── Orb Component ──────────────────────────────────────────────────────────

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
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 0.8],
          }),
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 50],
              }),
            },
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 40],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.2],
              }),
            },
          ],
        },
      ]}
    />
  );
}

// ── Rotating Aura ──────────────────────────────────────────────────────────

function RotatingAura() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.auraOverlay,
        {
          transform: [
            {
              rotate: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}
    />
  );
}

// ── Logo Icon with Pulse Glow ──────────────────────────────────────────────

function LogoIcon() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  const shadowOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });
  const borderWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 5],
  });
  const borderOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.logoIcon,
        {
          shadowOpacity,
          borderWidth,
          borderColor: `rgba(168,85,247,${borderOpacity})`,
        },
      ]}
    >
      <Ionicons name="bulb" size={42} color="#fff" />
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Entry animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.96)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  // Focus animations
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passFocusAnim = useRef(new Animated.Value(0)).current;

  // Logo float
  const logoFloatAnim = useRef(new Animated.Value(0)).current;

  // Button
  const btnScale = useRef(new Animated.Value(1)).current;

  // Biometrics pulse
  const bioPulseAnim = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.back(1.05)),
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Logo float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Biometrics pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bioPulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(bioPulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) {
      setError('✧ Please enter your email address ✧');
      return;
    }
    if (!password) {
      setError('✧ Please enter your password ✧');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch {
      setError('Unable to sign in. Please check your credentials or network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        locations={[0.2, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating orbs */}
      <FloatingOrb style={styles.orb1} />
      <FloatingOrb style={styles.orb2} duration={18000} />
      <FloatingOrb style={styles.orb3} duration={16000} />

      {/* Grid pattern overlay */}
      <View style={styles.gridOverlay} pointerEvents="none" />

      {/* Particle field */}
      <ParticleField count={120} />

      {/* Glass Card */}
      <Animated.View
        style={[
          styles.glassCard,
          {
            opacity: cardOpacityAnim,
            transform: [{ scale: cardScaleAnim }],
          },
        ]}
      >
        <RotatingAura />

        <View style={styles.content}>
          {/* Brand */}
          <Animated.View
            style={[
              styles.brand,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: logoFloatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6],
                    }),
                  },
                ],
              }}
            >
              <LogoIcon />
            </Animated.View>
            <Text style={styles.brandName}>Aura AI</Text>
            <Text style={styles.brandTagline}>LUMINOUS INTELLIGENCE</Text>
          </Animated.View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={16}
                color="#c084fc"
                style={styles.inputIcon}
              />
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
                  style={styles.inputField}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="hello@aura.ai"
                  placeholderTextColor="rgba(216,180,254,0.45)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() =>
                    Animated.timing(emailFocusAnim, {
                      toValue: 1,
                      duration: 200,
                      useNativeDriver: false,
                    }).start()
                  }
                  onBlur={() =>
                    Animated.timing(emailFocusAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: false,
                    }).start()
                  }
                />
              </Animated.View>
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color="#c084fc"
                style={styles.inputIcon}
              />
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
                  style={[styles.inputField, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(216,180,254,0.45)"
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() =>
                    Animated.timing(passFocusAnim, {
                      toValue: 1,
                      duration: 200,
                      useNativeDriver: false,
                    }).start()
                  }
                  onBlur={() =>
                    Animated.timing(passFocusAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: false,
                    }).start()
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="rgba(216,180,254,0.6)"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Login Button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPress={handleLogin}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={0.9}
              style={styles.loginBtn}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#8b5cf6', '#c084fc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginBtnGrad}
              >
                <Ionicons name="arrow-forward" size={16} color="#fff" />
                <Text style={styles.loginBtnText}>
                  {isSubmitting ? 'Authenticating...' : 'Login →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Links Row */}
          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.link}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Biometrics */}
          <Animated.View
            style={{
              shadowColor: 'rgba(168,85,247,0.3)',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: bioPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }) as any,
              shadowRadius: bioPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 12],
              }) as any,
              elevation: bioPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 8],
              }) as any,
            }}
          >
            <TouchableOpacity style={styles.biometricBtn} activeOpacity={0.7}>
              <Ionicons name="finger-print" size={22} color="#c084fc" />
              <Text style={styles.biometricText}>TAP FOR BIOMETRICS</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  // Orbs
  orb1: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(168,85,247,0.35)',
    zIndex: 0,
  },
  orb2: {
    position: 'absolute',
    bottom: -180,
    right: -180,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(168,85,247,0.3)',
    zIndex: 0,
  },
  orb3: {
    position: 'absolute',
    top: '40%',
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168,85,247,0.2)',
    zIndex: 0,
  },

  // Grid
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
    zIndex: 1,
  },

  // Glass Card
  glassCard: {
    maxWidth: 420,
    width: '100%',
    backgroundColor: 'rgba(15, 12, 35, 0.45)',
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    overflow: 'hidden',
    zIndex: 2,
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

  // Content
  content: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 20,
  },

  // Brand
  brand: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    width: 75,
    height: 75,
    borderRadius: 26,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
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
    fontSize: 13,
    color: 'rgba(216,180,254,0.9)',
    letterSpacing: 0.8,
    marginTop: 8,
  },

  // Inputs
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: 'rgba(216,180,254,0.9)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 18,
    top: 22,
    zIndex: 3,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    borderWidth: 1.5,
    paddingLeft: 48,
    paddingRight: 16,
    height: 56,
  },
  inputField: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: '#fff',
    height: '100%',
  },
  eyeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  // Login button
  loginBtn: {
    borderRadius: 60,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: 'rgba(139,92,246,0.5)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
  },
  loginBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  loginBtnText: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 17,
    color: '#fff',
  },

  // Error
  errorText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#ff8ea6',
    textAlign: 'center',
    marginBottom: 12,
  },

  // Links
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  link: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: 'rgba(216,180,254,0.8)',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'transparent',
  },
  dividerText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: 'rgba(216,180,254,0.5)',
  },

  // Biometrics
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.6)',
    borderRadius: 60,
    paddingVertical: 14,
  },
  biometricText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 15,
    color: '#fff',
  },
});
