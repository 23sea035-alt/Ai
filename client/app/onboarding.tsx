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

const PARTICLE_COUNT = 50;

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 14000 + 9000,
      delay: Math.random() * 12000,
    })),
  []);
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
          Animated.timing(opacity, { toValue: 0.7, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, {
            toValue: -700,
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
          bottom: -20,
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
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
          ],
        },
      ]}
    />
  );
}

function GlowingGradientTitle({ text }: { text: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const textShadowOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] });

  return (
    <Text style={[styles.auraTitle, { textShadowColor: `rgba(192,132,252,${textShadowOpacity})`, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }]}>{text}</Text>
  );
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(anim, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: anim,
          transform: [
            { translateX: -100 },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          ],
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

function StaticGradient() {
  return (
    <LinearGradient
      colors={['#4c1d95', '#2e1065', '#0f172a']}
      locations={[0.2, 0.5, 1]}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

export default function OnboardingScreen() {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(20)).current;
  const titleOp = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(20)).current;
  const descOp = useRef(new Animated.Value(0)).current;
  const featAnim = useRef(new Animated.Value(20)).current;
  const featOp = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(20)).current;
  const btnOp = useRef(new Animated.Value(0)).current;

  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  useFocusEffect(useCallback(() => {
    cardAnim.setValue(0);
    titleAnim.setValue(20); titleOp.setValue(0);
    descAnim.setValue(20); descOp.setValue(0);
    featAnim.setValue(20); featOp.setValue(0);
    btnAnim.setValue(20); btnOp.setValue(0);

    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(titleOp, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(descAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(descOp, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, 200);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(featAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(featOp, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, 400);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(btnAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(btnOp, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, 600);
  }, []));

  return (
    <View style={styles.container}>
      <StaticGradient />

      <AmbientOrb style={styles.orb1} />
      <AmbientOrb style={styles.orb2} duration={15000} />
      <AmbientOrb style={styles.orb3} duration={18000} />

      <View style={styles.gridPattern} pointerEvents="none" />
      <Particles />

      {toastVisible && <Toast message={toastMsg} visible={toastVisible} />}

      <Animated.View
        style={[
          styles.glassCard,
          {
            opacity: cardAnim,
            transform: [
              { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
              { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
            ],
          },
        ]}
      >
        <View style={styles.topBar}>
          <GlowingGradientTitle text="Aura" />
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.push('/age-verification')}
            activeOpacity={0.8}
          >
            <Text style={styles.skipBtnText}>SKIP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Animated.Text
            style={[
              styles.mainTitle,
              { opacity: titleOp, transform: [{ translateY: titleAnim }] },
            ]}
          >
            Meet Your AI Companion
          </Animated.Text>

          <Animated.Text
            style={[
              styles.description,
              { opacity: descOp, transform: [{ translateY: descAnim }] },
            ]}
          >
            Aura evolves with you, providing deeply empathetic and futuristic digital support.
          </Animated.Text>

          <Animated.View
            style={[
              styles.featuresRow,
              { opacity: featOp, transform: [{ translateY: featAnim }] },
            ]}
          >
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => showToast('🧠 Adaptive intelligence · I learn from every interaction')}
              activeOpacity={0.85}
            >
              <Ionicons name="trending-up" size={32} color="#c084fc" style={styles.featureIcon} />
              <Text style={styles.featureTitle}>ADAPTIVE</Text>
              <Text style={styles.featureDesc}>Learns from your nuances.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => showToast('🔒 Private-by-design · Your data is sovereign')}
              activeOpacity={0.85}
            >
              <Ionicons name="shield-checkmark" size={32} color="#c084fc" style={styles.featureIcon} />
              <Text style={styles.featureTitle}>SECURE</Text>
              <Text style={styles.featureDesc}>Private-by-design architecture.</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: btnOp, transform: [{ translateY: btnAnim }], width: '100%' }}>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                showToast('🚀 Welcome to Aura AI · Your journey begins');
                setTimeout(() => router.push('/age-verification'), 600);
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#8b5cf6', '#c084fc']}
                style={styles.nextBtnGrad}
              >
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text style={styles.nextBtnText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.9}
            >
              <Ionicons name="log-in-outline" size={16} color="#fff" />
              <Text style={styles.loginBtnText}>Log In</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },

  orb1: {
    position: 'absolute',
    top: -100, left: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(168,85,247,0.3)',
  },
  orb2: {
    position: 'absolute',
    bottom: -150, right: -150,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(168,85,247,0.25)',
  },
  orb3: {
    position: 'absolute',
    top: '40%', right: -80,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(168,85,247,0.15)',
  },

  gridPattern: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.3,
  },

  particleField: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden', zIndex: 1,
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(192,132,252,0.8)',
  },

  glassCard: {
    maxWidth: 420, width: '100%',
    backgroundColor: 'rgba(15, 12, 35, 0.5)',
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    overflow: 'hidden',
    zIndex: 2,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 35 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 15,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  auraTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  skipBtn: {
    backgroundColor: 'rgba(168,85,247,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.5)',
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
    alignItems: 'center',
  },

  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: 'center',
  },

  description: {
    fontSize: 16,
    lineHeight: 23,
    color: 'rgba(216,180,254,0.9)',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  featuresRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: 32,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
  },
  featureIcon: {
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 13,
    color: 'rgba(216,180,254,0.85)',
    lineHeight: 18,
    textAlign: 'center',
  },

  nextBtn: {
    borderRadius: 60,
    overflow: 'hidden',
    width: '100%',
    shadowColor: 'rgba(139,92,246,0.4)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
  },
  nextBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },

  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(168,85,247,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.6)',
    borderRadius: 60,
    paddingVertical: 16,
    marginTop: 12,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(25,20,50,0.98)',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.6)',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 35,
    elevation: 20,
  },
  toastText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});
