import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraButton } from '@/components/AuraButton';
import { CompanionAvatar } from '@/components/CompanionAvatar';
import { GlassCard } from '@/components/GlassCard';
import { ParticleField } from '@/components/ParticleField';
import { StarField } from '@/components/StarField';

const { width: W } = Dimensions.get('screen');

const FEATURED = [
  {
    seed: 'Aurora',
    name: 'Aurora',
    title: 'Emotional Intelligence',
    desc: 'Empathetic, curious, and deeply wise. Aurora supports your inner world.',
    colorFrom: '#c9bfff',
    colorTo: '#8fd8ff',
    tag: 'COMPANION',
  },
  {
    seed: 'Orion',
    name: 'Orion',
    title: 'Strategic Thinking',
    desc: 'Goal-setting, accountability, and laser-sharp focus.',
    colorFrom: '#8fd8ff',
    colorTo: '#4ac8ff',
    tag: 'ADVISOR',
  },
  {
    seed: 'Lyra',
    name: 'Lyra',
    title: 'Creative Worlds',
    desc: 'Storytelling, roleplay, and boundless imagination.',
    colorFrom: '#ffb77d',
    colorTo: '#ff8fb0',
    tag: 'CREATOR',
  },
];

const FEATURES = [
  { icon: '🧠', label: 'Deep Memory', sub: 'Remembers every conversation' },
  { icon: '🎙️', label: 'Voice Calls', sub: 'Real-time voice interaction' },
  { icon: '✨', label: 'Evolving AI', sub: 'Grows with your journey' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const [activeCompanion, setActiveCompanion] = useState(0);
  const carouselAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 300);

    FEATURES.forEach((_, i) => {
      setTimeout(() => {
        Animated.timing(featureAnims[i], {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }).start();
      }, 600 + i * 150);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb1Anim, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(orb2Anim, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb2Anim, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const interval = setInterval(() => {
      setActiveCompanion((prev) => (prev + 1) % FEATURED.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const orb1Y = orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -28] });
  const orb2Y = orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 20;
  const c = FEATURED[activeCompanion];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060a18', '#0e1323', '#1A1F4B']}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <StarField count={70} />
      <ParticleField count={18} />

      <Animated.View
        style={[styles.ambientOrb1, { transform: [{ translateY: orb1Y }] }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.ambientOrb2, { transform: [{ translateY: orb2Y }] }]}
        pointerEvents="none"
      />

      {/* Hero companion showcase */}
      <Animated.View
        style={[
          styles.heroSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Companion carousel */}
        <View style={styles.companionRow}>
          {FEATURED.map((comp, i) => {
            const isActive = i === activeCompanion;
            return (
              <TouchableOpacity
                key={comp.seed}
                onPress={() => setActiveCompanion(i)}
                activeOpacity={0.8}
                style={styles.companionTap}
              >
                <Animated.View
                  style={[
                    styles.companionSlot,
                    {
                      opacity: isActive ? 1 : 0.4,
                      transform: [{ scale: isActive ? 1 : 0.82 }],
                    },
                  ]}
                >
                  <CompanionAvatar
                    seed={comp.seed}
                    size={isActive ? 90 : 60}
                    colorFrom={comp.colorFrom}
                    colorTo={comp.colorTo}
                    pulsate={isActive}
                  />
                  {isActive && (
                    <View style={styles.activeDot}>
                      <View style={[styles.activeDotInner, { backgroundColor: comp.colorFrom }]} />
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active companion info */}
        <GlassCard style={styles.companionInfo} radius={20} glowColor={c.colorFrom}>
          <View style={[styles.companionTag, { backgroundColor: c.colorFrom + '20' }]}>
            <Text style={[styles.companionTagText, { color: c.colorFrom }]}>{c.tag}</Text>
          </View>
          <Text style={styles.companionName}>{c.name}</Text>
          <Text style={styles.companionTitle}>{c.title}</Text>
          <Text style={styles.companionDesc}>{c.desc}</Text>
        </GlassCard>
      </Animated.View>

      {/* Bottom card */}
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            paddingBottom: bottomPad,
            opacity: fadeAnim,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        <GlassCard style={styles.card} radius={32} shimmer>
          <View style={styles.cardContent}>
            {/* Feature pills */}
            <View style={styles.featureRow}>
              {FEATURES.map((f, i) => (
                <Animated.View
                  key={f.label}
                  style={{
                    opacity: featureAnims[i],
                    transform: [
                      {
                        translateY: featureAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [12, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <GlassCard style={styles.featurePill} radius={14}>
                    <Text style={styles.featureIcon}>{f.icon}</Text>
                    <View>
                      <Text style={styles.featureLabel}>{f.label}</Text>
                      <Text style={styles.featureSub}>{f.sub}</Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))}
            </View>

            <Text style={styles.headline}>Your companion,{'\n'}everywhere you go.</Text>
            <Text style={styles.subtext}>
              An AI that learns from your world, remembers your story, and grows with you — always.
            </Text>

            <View style={styles.actions}>
              <AuraButton
                label="Begin Your Journey"
                onPress={() => router.push('/onboarding')}
              />
              <AuraButton
                label="Sign In"
                onPress={() => router.push('/(auth)/login')}
                variant="secondary"
              />
            </View>

            {/* Companion dots indicator */}
            <View style={styles.dotsRow}>
              {FEATURED.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === activeCompanion ? '#c9bfff' : 'rgba(201,191,255,0.2)' },
                    i === activeCompanion && { width: 20 },
                  ]}
                />
              ))}
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18', justifyContent: 'flex-end' },
  ambientOrb1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(179,136,255,0.1)',
  },
  ambientOrb2: {
    position: 'absolute',
    bottom: -50,
    right: -100,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(143,216,255,0.05)',
  },
  heroSection: {
    position: 'absolute',
    top: '8%',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 4,
  },
  companionTap: { alignItems: 'center' },
  companionSlot: { alignItems: 'center', gap: 8 },
  activeDot: { alignItems: 'center', marginTop: 4 },
  activeDotInner: { width: 6, height: 6, borderRadius: 3 },
  companionInfo: {
    width: '100%',
    padding: 18,
    gap: 8,
  },
  companionTag: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  companionTagText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
  },
  companionName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  companionTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#8fd8ff',
    letterSpacing: 0.5,
  },
  companionDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(201,196,216,0.7)',
    lineHeight: 19,
  },
  cardWrapper: { paddingHorizontal: 14 },
  card: { padding: 0 },
  cardContent: { padding: 24, gap: 18 },
  featureRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  featureIcon: { fontSize: 16 },
  featureLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#dee1f9',
  },
  featureSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 10,
    color: '#928ea1',
  },
  headline: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: '#dee1f9',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subtext: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.75)',
    lineHeight: 21,
  },
  actions: { gap: 10 },
  dotsRow: { flexDirection: 'row', gap: 6, alignSelf: 'center', alignItems: 'center' },
  dot: { height: 4, width: 8, borderRadius: 2 },
});
