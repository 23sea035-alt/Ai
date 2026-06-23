import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useApp } from '@/context/AppContext';

function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 7 + 2,
      duration: Math.random() * 14000 + 9000,
      delay: Math.random() * 12000,
    }));
  }, []);

  return (
    <View style={styles.particleField} pointerEvents="none">
      {particles.map((p) => <Particle key={p.id} config={p} />)}
    </View>
  );
}

function Particle({ config }: { config: { left: number; size: number; duration: number; delay: number } }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.8, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, {
            toValue: -600,
            duration: config.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: `${config.left}%`,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

function AmbientOrb({ style, duration = 12000 }: { style?: any; duration?: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
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
            { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
          ],
        },
      ]}
    />
  );
}

function IconPulseGlow() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const shadowOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] });
  const borderWidth = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 6] });
  const borderOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.6] });

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
      <Ionicons name="bulb" size={52} color="#fff" />
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const { user } = useApp();
  const isReturning = user?.onboardingDone === true;
  const [ready, setReady] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const btnGroupAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isReturning) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      const t = setTimeout(() => setReady(true), 600);
      return () => clearTimeout(t);
    }
  }, [isReturning]);

  useFocusEffect(useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    btnGroupAnim.setValue(0);
    const entry = Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    const btns = Animated.timing(btnGroupAnim, { toValue: 1, duration: 600, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    entry.start();
    btns.start();
    return () => { entry.stop(); btns.stop(); };
  }, []));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        locations={[0.2, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <AmbientOrb style={styles.orb1} />
      <AmbientOrb style={styles.orb2} duration={15000} />
      <AmbientOrb style={styles.orb3} duration={18000} />

      <Particles />

      <Animated.View
        style={[
          styles.glassCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.logoWrapper}>
            <IconPulseGlow />
          </View>
          <Text style={styles.brandName}>AURA AI</Text>
          <View style={styles.taglineRow}>
            <Text style={styles.tagline}>Your Companion, anywhere, anytime.</Text>
          </View>

          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              Experience a <Text style={styles.highlight}>sentient AI</Text> that learns from your world and grows with you.
              {'\n'}A premium digital entity <Text style={styles.highlight}>tailored for your lifestyle</Text>.
            </Text>
          </View>

          {ready && !isReturning && (
            <>
              <Animated.View style={[styles.buttonGroup, { opacity: btnGroupAnim, transform: [{ translateY: btnGroupAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => router.push('/onboarding')}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#8b5cf6', '#c084fc']}
                    style={styles.btnPrimaryGrad}
                  >
                    <Ionicons name="sparkles" size={16} color="#fff" />
                    <Text style={styles.btnPrimaryText}>Get Started</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnTertiary}
                  onPress={() => router.push('/(auth)/register')}
                  activeOpacity={0.9}
                >
                  <Ionicons name="person-add-outline" size={16} color="#c084fc" />
                  <Text style={styles.btnTertiaryText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={() => router.push('/(auth)/login')}
                  activeOpacity={0.9}
                >
                  <Ionicons name="log-in-outline" size={16} color="#fff" />
                  <Text style={styles.btnSecondaryText}>Log In</Text>
                </TouchableOpacity>
              </Animated.View>

              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink} onPress={() => router.push('/help')}>
                  Terms of Service
                </Text>
              </Text>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },

  orb1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(168,85,247,0.3)',
  },
  orb2: {
    position: 'absolute',
    bottom: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(168,85,247,0.25)',
  },
  orb3: {
    position: 'absolute',
    top: '40%',
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(168,85,247,0.15)',
  },

  particleField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(192,132,252,0.8)',
  },

  glassCard: {
    maxWidth: 420,
    width: '100%',
    backgroundColor: 'rgba(15, 12, 35, 0.45)',
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    overflow: 'hidden',
    zIndex: 2,
    marginHorizontal: 20,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 16,
  },

  logoWrapper: {
    marginBottom: 20,
  },
  logoIcon: {
    width: 90,
    height: 90,
    borderRadius: 32,
    backgroundColor: 'linear-gradient(145deg, #c084fc, #7c3aed)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 35,
    elevation: 12,
    overflow: 'hidden',
  },

  brandName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    fontFamily: 'Sora_800ExtraBold',
    marginBottom: 8,
  },

  taglineRow: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 40,
    marginBottom: 32,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(216,180,254,0.95)',
    letterSpacing: 0.3,
    fontFamily: 'Manrope_600SemiBold',
  },

  descriptionCard: {
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: 40,
    padding: 28,
    marginBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    width: '100%',
  },
  descriptionText: {
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Manrope_500Medium',
  },
  highlight: {
    fontWeight: '700',
    color: '#c084fc',
    fontFamily: 'Sora_700Bold',
  },

  buttonGroup: {
    width: '100%',
    gap: 16,
    marginBottom: 28,
  },
  btnPrimary: {
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: 'rgba(139,92,246,0.5)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 10,
  },
  btnPrimaryGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  btnPrimaryText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Sora_700Bold',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(168,85,247,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.6)',
    borderRadius: 60,
    paddingVertical: 18,
  },
  btnSecondaryText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Sora_700Bold',
  },
  btnTertiary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
    borderRadius: 60,
    paddingVertical: 16,
  },
  btnTertiaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c084fc',
    fontFamily: 'Sora_600SemiBold',
  },

  termsText: {
    fontSize: 13,
    color: 'rgba(216,180,254,0.7)',
    textAlign: 'center',
    fontFamily: 'Manrope_500Medium',
  },
  termsLink: {
    color: '#c084fc',
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
});
