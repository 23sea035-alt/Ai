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
        { transform: [{ rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
      ]}
    />
  );
}

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;

  const btnScale = useRef(new Animated.Value(1)).current;
  const emailFocusAnim = useRef(new Animated.Value(0)).current;

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

  const handleSend = () => {
    if (!email.trim()) return;
    setSent(true);
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#c084fc" />
          </TouchableOpacity>

          <Animated.View style={[styles.glassCard, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
            <RotatingAura />

            <View style={styles.content}>
              <View style={styles.brand}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-closed" size={36} color="#c084fc" />
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  Enter your email address and we'll send you a luminous link to reset your identity.
                </Text>
              </View>

              {!sent && (
                <View>
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
                          style={styles.inputField}
                          value={email}
                          onChangeText={setEmail}
                          placeholder="hello@aura.ai"
                          placeholderTextColor="rgba(216,180,254,0.45)"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          returnKeyType="done"
                          onSubmitEditing={handleSend}
                          onFocus={() => Animated.timing(emailFocusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
                          onBlur={() => Animated.timing(emailFocusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
                        />
                      </Animated.View>
                    </View>
                  </View>

                  <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <TouchableOpacity
                      onPress={handleSend}
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      activeOpacity={0.9}
                      style={styles.primaryBtn}
                      disabled={!email.trim()}
                    >
                      <LinearGradient
                        colors={['#8b5cf6', '#c084fc']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.primaryBtnGrad}
                      >
                        <Ionicons name="send" size={16} color="#fff" />
                        <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              )}

              {sent && (
                <View style={styles.sentSection}>
                  <View style={styles.sentIconBox}>
                    <Ionicons name="checkmark-circle" size={56} color="#4ade80" />
                  </View>
                  <Text style={styles.sentTitle}>Check your email</Text>
                  <Text style={styles.sentSub}>
                    We've sent a password reset link to {email}. Check your inbox and follow the instructions.
                  </Text>
                  <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <TouchableOpacity
                      onPress={() => router.replace('/(auth)/login')}
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      activeOpacity={0.9}
                      style={styles.primaryBtn}
                    >
                      <LinearGradient
                        colors={['#8b5cf6', '#c084fc']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.primaryBtnGrad}
                      >
                        <Ionicons name="log-in-outline" size={16} color="#fff" />
                        <Text style={styles.primaryBtnText}>Back to Login</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              )}

              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.backLink}>
                <Ionicons name="log-in-outline" size={14} color="rgba(216,180,254,0.8)" />
                <Text style={styles.backLinkText}>BACK TO LOGIN</Text>
              </TouchableOpacity>
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
  backBtn: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  brand: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 26,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(216,180,254,0.8)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  inputGroup: { marginBottom: 24 },
  inputLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: 'rgba(216,180,254,0.9)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 18, top: 22, zIndex: 3 },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    borderWidth: 1.5,
    paddingLeft: 48,
    height: 56,
  },
  inputField: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: '#fff',
    height: '100%',
  },
  primaryBtn: {
    borderRadius: 60,
    overflow: 'hidden',
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
  sentSection: { alignItems: 'center', gap: 16 },
  sentIconBox: { paddingVertical: 8 },
  sentTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#fff',
  },
  sentSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(216,180,254,0.8)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginTop: 8,
  },
  backLinkText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: 'rgba(216,180,254,0.8)',
    letterSpacing: 1.2,
  },
});
