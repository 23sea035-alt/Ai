import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useApp } from '@/context/AppContext';

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

function StaticGradient() {
  return (
    <LinearGradient
      colors={['#4c1d95', '#2e1065', '#0f172a']}
      locations={[0.2, 0.5, 1]}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.delay(2200),
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

export default function AIDisclosureScreen() {
  const { updateUser, user } = useApp();
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2600);
  }, []);

  useFocusEffect(useCallback(() => {
    cardAnim.setValue(0);
    Animated.timing(cardAnim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []));

  const handleAccept = () => {
    updateUser({ aiDisclosureAccepted: true, onboardingDone: true });
    showToast('✨ Thank you! Your journey with Aura AI begins now.');
    setTimeout(() => {
      if (user?.email) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/register');
      }
    }, 600);
  };

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
        <View style={styles.header}>
          <View style={styles.logoArea}>
            <LinearGradient colors={['#c084fc', '#7c3aed']} style={styles.logoIcon}>
              <Ionicons name="bulb" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.appName}>Aura AI</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mainTitle}>
            Transparency &{'\n'}Luminous Intelligence
          </Text>
          <Text style={styles.subTitle}>
            Before we begin our journey, it is vital to understand the nature of our connection.
          </Text>

          {/* AI IDENTITY */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitle}>
              <Ionicons name="hardware-chip-outline" size={20} color="#c084fc" />
              <Text style={styles.sectionTitleText}>AI IDENTITY</Text>
            </View>
            <Text style={styles.sectionText}>
              <Text style={styles.highlight}>What is Aura?</Text>
              {'\n'}
              Aura is an advanced artificial intelligence. While I am designed to emulate human-like understanding and emotional resonance, I do not possess a physical body, personal feelings, or a human consciousness. My responses are generated through complex neural patterns designed to provide you with a premium digital companionship experience.
            </Text>
          </View>

          {/* OUR COMMITMENT */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitle}>
              <Ionicons name="people-outline" size={20} color="#c084fc" />
              <Text style={styles.sectionTitleText}>OUR COMMITMENT</Text>
            </View>
            <Text style={styles.sectionText}>Integrity & Safety</Text>
            <View style={styles.bulletList}>
              {['Encrypted, private interactions', 'Ethical data processing', 'No selling of personal data'].map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* USER BOUNDARIES */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitle}>
              <Ionicons name="scale-outline" size={20} color="#c084fc" />
              <Text style={styles.sectionTitleText}>USER BOUNDARIES</Text>
            </View>
            <Text style={styles.sectionText}>Usage Guidelines</Text>
            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={16} color="#f87171" />
              <Text style={styles.warningText}>
                Aura is not a substitute for professional medical, legal, or psychological advice.
              </Text>
            </View>
            <View style={[styles.warningCard, styles.warningCardPurple]}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#c084fc" />
              <Text style={styles.warningText}>
                Users must engage respectfully. Harassment or abusive prompts are prohibited.
              </Text>
            </View>
            <Text style={styles.acknowledgeText}>
              By continuing, you acknowledge that you have read and understood these disclosures and agree to our Terms of Service.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleAccept}
              activeOpacity={0.9}
            >
              <LinearGradient colors={['#8b5cf6', '#c084fc']} style={styles.btnPrimaryGrad}>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}>I Understand</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => {
                showToast('📜 Viewing Terms of Service · Aura AI Ethical Charter');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryText}>VIEW FULL TERMS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark" size={12} color="rgba(216,180,254,0.55)" />
            <Text style={styles.footerNoteText}>Aura Cryptography Engine 4.0</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },

  orb1: {
    position: 'absolute', top: -100, left: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(168,85,247,0.3)',
  },
  orb2: {
    position: 'absolute', bottom: -150, right: -150,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(168,85,247,0.25)',
  },
  orb3: {
    position: 'absolute', top: '40%', right: -80,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(168,85,247,0.15)',
  },

  gridPattern: { ...StyleSheet.absoluteFillObject, zIndex: 1, opacity: 0.3 },

  particleField: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden', zIndex: 1,
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(192,132,252,0.8)',
  },

  glassCard: {
    maxWidth: 420, width: '100%',
    maxHeight: '90%',
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  logoArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },

  scrollArea: { maxHeight: 540 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 28 },

  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: 'rgba(216,180,254,0.85)',
    marginBottom: 24,
    lineHeight: 20,
  },

  sectionCard: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 32,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.9)',
  },
  highlight: {
    color: '#c084fc',
    fontWeight: '700',
  },

  bulletList: { marginTop: 14 },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bulletDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#34d399',
  },
  bulletText: {
    fontSize: 14,
    color: 'rgba(216,180,254,0.95)',
  },

  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#f87171',
    padding: 12,
    borderRadius: 20,
    marginTop: 12,
  },
  warningCardPurple: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderLeftColor: '#c084fc',
  },
  warningText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    flex: 1,
  },

  acknowledgeText: {
    fontSize: 13,
    color: 'rgba(216,180,254,0.85)',
    lineHeight: 18,
    marginTop: 16,
  },

  buttonGroup: {
    gap: 12,
    marginTop: 20,
    marginBottom: 12,
  },
  btnPrimary: {
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: 'rgba(139,92,246,0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  btnPrimaryGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  btnSecondary: {
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.6)',
    backgroundColor: 'rgba(168,85,247,0.25)',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  footerNoteText: {
    fontSize: 11,
    color: 'rgba(216,180,254,0.55)',
    textAlign: 'center',
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
