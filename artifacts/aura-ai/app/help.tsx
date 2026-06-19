import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const FAQS = [
  {
    q: 'How does AURA learn?',
    a: 'AURA utilizes a proprietary mesh neural network that adapts to your interaction patterns, emotional resonance, and unique vocabulary to provide a truly personalized experience.',
  },
  {
    q: 'Is my data secure?',
    a: 'Your privacy is paramount. All intelligence processing occurs through end-to-end encrypted luminous nodes, ensuring your consciousness remains yours alone.',
  },
  {
    q: 'Upgrading to Premium',
    a: 'Unlock the full spectrum of Aether Intelligence. Premium features include multi-dimensional voice synthesis, offline cognition, and unlimited memory clusters.',
  },
];

function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 15000 + 8000,
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
          Animated.timing(opacity, { toValue: 0.6, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, {
            toValue: -500,
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

function AmbientOrbs() {
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb1,
          {
            opacity: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }),
            transform: [{ scale: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb2,
          {
            opacity: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.8] }),
            transform: [{ scale: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
          },
        ]}
      />
    </>
  );
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const topPad = Platform.OS === 'web' ? 14 : insets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        locations={[0.2, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <AmbientOrbs />
      <Particles />

      <Animated.View
        style={[
          styles.containerInner,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.mainHeader, { paddingTop: topPad }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#c084fc', '#7c3aed']}
              style={styles.heroIcon}
            >
              <Ionicons name="headset-outline" size={32} color="#fff" />
            </LinearGradient>
            <Text style={styles.heroTitle}>How can we help you?</Text>
            <Text style={styles.heroSub}>Search FAQs or reach out to our team</Text>
          </View>

          <View style={styles.searchCard}>
            <Ionicons name="search-outline" size={18} color="rgba(216,180,254,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for guidance..."
              placeholderTextColor="rgba(216,180,254,0.5)"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>COMMON QUERIES</Text>
            {FAQS.map((faq, idx) => {
              const open = expanded === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.85}
                  onPress={() => setExpanded(open ? null : idx)}
                  style={[styles.accordionItem, open && styles.accordionActive]}
                >
                  <View style={styles.accordionHeader}>
                    <Text style={styles.accordionQ}>{faq.q}</Text>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="rgba(216,180,254,0.6)"
                    />
                  </View>
                  {open && <Text style={styles.accordionA}>{faq.a}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TERMS OF SERVICE</Text>
            <View style={styles.termsCard}>
              <Text style={styles.termsText}>
                By using Aura AI, you agree to the following terms. Your data is encrypted and stored securely.
                We do not share your personal information with third parties. Premium subscriptions auto-renew
                unless canceled. All AI interactions are processed through secure neural nodes.
              </Text>
              <Text style={styles.termsText}>
                For the full Terms of Service and Privacy Policy, please visit our website or contact our support team.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>REACH OUT</Text>
            <TouchableOpacity style={styles.contactCard} activeOpacity={0.8}>
              <View style={styles.contactCardLeft}>
                <LinearGradient
                  colors={['#8b5cf6', '#c084fc']}
                  style={styles.contactIcon}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                </LinearGradient>
                <View>
                  <Text style={styles.contactTitle}>Chat with Support</Text>
                  <Text style={styles.contactSub}>Live guidance in minutes</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(216,180,254,0.5)" />
            </TouchableOpacity>

            <View style={styles.contactGrid}>
              <TouchableOpacity style={styles.contactSmall} activeOpacity={0.8}>
                <Ionicons name="mail-outline" size={22} color="#c084fc" />
                <Text style={styles.contactSmallTitle}>Email Us</Text>
                <Text style={styles.contactSmallSub}>24h response</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactSmall} activeOpacity={0.8}>
                <Ionicons name="people-outline" size={22} color="#c084fc" />
                <Text style={styles.contactSmallTitle}>Community</Text>
                <Text style={styles.contactSmallSub}>Share insights</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.newsletterCard}>
            <Text style={styles.newsletterTitle}>Stay Updated</Text>
            <Text style={styles.newsletterSub}>
              Get the latest updates on AURA's evolving capabilities directly in your inbox.
            </Text>
            <View style={styles.newsletterRow}>
              <TextInput
                style={styles.newsletterInput}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="rgba(216,180,254,0.5)"
                keyboardType="email-address"
              />
              <TouchableOpacity style={styles.newsletterBtn} activeOpacity={0.8}>
                <LinearGradient colors={['#8b5cf6', '#c084fc']} style={styles.newsletterBtnGrad}>
                  <Ionicons name="send-outline" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  orb1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '60%',
    height: '60%',
    backgroundColor: '#c084fc',
    borderRadius: 1000,
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 120,
    elevation: 0,
  },
  orb2: {
    position: 'absolute',
    top: '30%',
    right: '-20%',
    width: '50%',
    height: '50%',
    backgroundColor: '#3b82f6',
    borderRadius: 1000,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 120,
    elevation: 0,
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
    backgroundColor: 'rgba(192,132,252,0.7)',
  },

  containerInner: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 35, 0.45)',
    overflow: 'hidden',
    zIndex: 2,
  },

  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 30,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.5)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    fontFamily: 'Sora_700Bold',
  },

  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    fontFamily: 'Sora_700Bold',
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(216,180,254,0.9)',
    fontFamily: 'Manrope_500Medium',
  },

  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(168,85,247,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: 32,
    paddingHorizontal: 18,
    height: 52,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'Manrope_400Regular',
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(216,180,254,0.7)',
    fontFamily: 'Sora_700Bold',
    paddingLeft: 4,
  },

  accordionItem: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: 28,
    padding: 16,
  },
  accordionActive: {
    borderColor: 'rgba(192,132,252,0.6)',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionQ: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    fontFamily: 'Sora_600SemiBold',
  },
  accordionA: {
    fontSize: 15,
    color: 'rgba(216,180,254,0.9)',
    lineHeight: 22,
    marginTop: 12,
    fontFamily: 'Manrope_400Regular',
  },

  termsCard: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: 28,
    padding: 20,
    gap: 12,
  },
  termsText: {
    fontSize: 14,
    color: 'rgba(216,180,254,0.85)',
    lineHeight: 21,
    fontFamily: 'Manrope_400Regular',
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: 32,
    padding: 18,
  },
  contactCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Sora_700Bold',
    marginBottom: 2,
  },
  contactSub: {
    fontSize: 13,
    color: 'rgba(216,180,254,0.8)',
    fontFamily: 'Manrope_500Medium',
  },

  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactSmall: {
    flex: 1,
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  contactSmallTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Sora_700Bold',
  },
  contactSmallSub: {
    fontSize: 13,
    color: 'rgba(216,180,254,0.8)',
    fontFamily: 'Manrope_500Medium',
  },

  newsletterCard: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: 32,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 14,
  },
  newsletterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Sora_700Bold',
  },
  newsletterSub: {
    fontSize: 14,
    color: 'rgba(216,180,254,0.85)',
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium',
  },
  newsletterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  newsletterInput: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: 28,
    paddingHorizontal: 18,
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Manrope_400Regular',
  },
  newsletterBtn: {
    width: 48,
    height: 48,
    borderRadius: 28,
    overflow: 'hidden',
  },
  newsletterBtnGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
