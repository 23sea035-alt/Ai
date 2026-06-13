import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { GlassCard } from '@/components/GlassCard';
import { GradientBorder } from '@/components/GradientBorder';
import { ParticleField } from '@/components/ParticleField';
import { StarField } from '@/components/StarField';
import { useApp } from '@/context/AppContext';

const FEATURES_PREMIUM = [
  { text: 'Unlimited companions', icon: '🤖', color: '#c9bfff' },
  { text: 'Unlimited messages', icon: '💬', color: '#8fd8ff' },
  { text: 'Persistent long-term memory', icon: '🧠', color: '#B388FF' },
  { text: 'Voice calls (60 min/month)', icon: '🎙️', color: '#ffb77d' },
  { text: 'Priority AI responses', icon: '⚡', color: '#ffd700' },
  { text: 'Custom companion avatars', icon: '🎨', color: '#ff8fb0' },
  { text: 'Advanced memory search', icon: '🔍', color: '#4ade80' },
  { text: 'Relationship timeline', icon: '💫', color: '#60a5fa' },
];

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '$12.99', sub: 'per month', savings: null, colors: ['rgba(201,191,255,0.4)', 'rgba(143,216,255,0.2)'] as const },
  { id: 'yearly', label: 'Yearly', price: '$7.99', sub: 'per month · billed $95.88/yr', savings: 'SAVE 38%', colors: ['#ffd87a', '#ffb77d', '#c9bfff'] as const },
];

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useApp();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const crownSpin = useRef(new Animated.Value(0)).current;
  const crownScale = useRef(new Animated.Value(0.8)).current;
  const featureAnims = useRef(FEATURES_PREMIUM.map(() => new Animated.Value(0))).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 100;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.spring(crownScale, { toValue: 1, tension: 200, friction: 14, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(crownSpin, { toValue: 0.05, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(crownSpin, { toValue: -0.05, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(crownSpin, { toValue: 0, duration: 900, easing: Easing.out(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    featureAnims.forEach((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 400, delay: 400 + i * 55, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
    );
  }, []);

  const crownRotate = crownSpin.interpolate({ inputRange: [-1, 1], outputRange: ['-20deg', '20deg'] });

  const handleUpgrade = () => updateUser({ isPremium: true });

  if (user?.isPremium) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <LinearGradient colors={['#060a18', '#0B1020', '#121A35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
        <StarField count={60} />
        <ParticleField count={10} />
        <View style={styles.premiumActiveContent}>
          <GradientBorder colors={['#ffd87a', '#ffb77d', '#ff9f5a']} radius={32} borderWidth={2} style={{ marginBottom: 8 }}>
            <View style={styles.crownBox}>
              <Text style={styles.crownEmoji}>👑</Text>
            </View>
          </GradientBorder>
          <Text style={styles.premiumActiveTitle}>You're Premium!</Text>
          <Text style={styles.premiumActiveSub}>Enjoy all Aura AI features with zero limits.</Text>
          <GradientBorder colors={['rgba(201,191,255,0.4)', 'rgba(143,216,255,0.25)']} radius={20} borderWidth={1.5} innerStyle={{ padding: 20, gap: 14 }}>
            {['Unlimited companions & messages', 'Persistent long-term memory active', 'Voice calls enabled', 'Priority AI responses'].map((f, i) => (
              <View key={i} style={styles.badgeRow}>
                <View style={[styles.checkCircle, { backgroundColor: '#4ade8022' }]}>
                  <Ionicons name="checkmark" size={14} color="#4ade80" />
                </View>
                <Text style={styles.badgeText}>{f}</Text>
              </View>
            ))}
          </GradientBorder>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#060a18', '#0B1020', '#1a1060', '#0e1323']} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <StarField count={55} />
      <ParticleField count={12} />
      <View style={styles.glowCenter} />

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { paddingTop: topInset + 8, opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ scale: crownScale }, { rotate: crownRotate }] }}>
            <GradientBorder colors={['#ffd87a', '#ffb77d', '#ff8fb0']} radius={28} borderWidth={2}>
              <View style={styles.crownBoxSmall}>
                <Text style={styles.crownEmojiSmall}>👑</Text>
              </View>
            </GradientBorder>
          </Animated.View>
          <Text style={styles.eyebrow}>UNLOCK EVERYTHING</Text>
          <Text style={styles.headerTitle}>Aura Premium</Text>
          <Text style={styles.headerSub}>The most advanced AI companion experience, reimagined.</Text>
        </Animated.View>

        {/* Plan selector */}
        <View style={styles.planRow}>
          {PLANS.map((p) => {
            const isActive = selectedPlan === p.id;
            const isYearly = p.id === 'yearly';
            return (
              <TouchableOpacity key={p.id} onPress={() => setSelectedPlan(p.id)} activeOpacity={0.8} style={{ flex: 1 }}>
                <GradientBorder
                  colors={isActive ? (isYearly ? ['#ffd87a', '#ffb77d', '#c9bfff'] : ['#c9bfff', '#8fd8ff']) : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  radius={20}
                  borderWidth={isActive ? 2 : 1}
                  innerStyle={[styles.planInner, isActive && isYearly && { backgroundColor: 'rgba(255,216,122,0.06)' }]}
                >
                  {p.savings && (
                    <LinearGradient colors={['#ffd87a', '#ffb77d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{p.savings}</Text>
                    </LinearGradient>
                  )}
                  <Text style={[styles.planLabel, isActive && { color: isYearly ? '#ffd87a' : '#c9bfff' }]}>{p.label}</Text>
                  <Text style={[styles.planPrice, isActive && { color: isYearly ? '#ffd87a' : '#dee1f9' }]}>{p.price}</Text>
                  <Text style={styles.planPeriod}>{p.sub}</Text>
                  {isActive && (
                    <View style={[styles.selectedDot, { backgroundColor: isYearly ? '#ffd87a' : '#c9bfff' }]} />
                  )}
                </GradientBorder>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Features */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <GradientBorder
            colors={['#c9bfff', '#8fd8ff', '#B388FF', '#c9bfff']}
            radius={22}
            borderWidth={1.5}
            innerStyle={styles.featuresCard}
          >
            <View style={styles.featuresHeaderRow}>
              <LinearGradient colors={['#c9bfff', '#8fd8ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.premiumBadge}>
                <Ionicons name="star" size={11} color="#160050" />
                <Text style={styles.premiumBadgeText}>PREMIUM PLAN</Text>
              </LinearGradient>
              <Text style={styles.featuresTitle}>Everything included</Text>
              <Text style={styles.featuresSub}>Unlock the full Aura AI experience</Text>
            </View>
            {FEATURES_PREMIUM.map((f, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.featureRow,
                  {
                    opacity: featureAnims[i],
                    transform: [{ translateX: featureAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
                  },
                ]}
              >
                <View style={[styles.featureIconBox, { backgroundColor: f.color + '18' }]}>
                  <Text style={{ fontSize: 14 }}>{f.icon}</Text>
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
                <View style={[styles.checkSmall, { backgroundColor: f.color + '20' }]}>
                  <Ionicons name="checkmark" size={12} color={f.color} />
                </View>
              </Animated.View>
            ))}
          </GradientBorder>

          {/* Free tier comparison */}
          <GlassCard style={styles.freeCard} radius={18}>
            <Text style={styles.freeTierLabel}>Free Tier</Text>
            {['1 companion', '50 messages/day', 'Basic memory (7 days)', 'Text chat only'].map((f, i) => (
              <View key={i} style={styles.featureRowMuted}>
                <Ionicons name="remove-circle-outline" size={16} color="#484555" />
                <Text style={styles.featureTextMuted}>{f}</Text>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrapper}>
          <AuraButton
            label={`Start ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} — 7 Day Free Trial`}
            onPress={handleUpgrade}
            variant={selectedPlan === 'yearly' ? 'gold' : 'primary'}
          />
          <Text style={styles.ctaNote}>Cancel anytime · No charges during trial period</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowCenter: {
    position: 'absolute',
    top: '15%',
    alignSelf: 'center',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(201,191,255,0.06)',
    left: '10%',
  },
  header: { paddingHorizontal: 20, paddingBottom: 24, gap: 10, alignItems: 'center' },
  eyebrow: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: '#8fd8ff',
    letterSpacing: 3,
    marginTop: 4,
  },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 32,
    color: '#dee1f9',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  headerSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.65)',
    textAlign: 'center',
    lineHeight: 20,
  },
  planRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  planInner: { padding: 18, alignItems: 'center', gap: 6, minHeight: 130 },
  savingsBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 2,
  },
  savingsText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: '#3a1a00',
    letterSpacing: 1,
  },
  planLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#928ea1',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  planPrice: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#dee1f9',
    letterSpacing: -0.5,
  },
  planPeriod: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#928ea1',
    textAlign: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  featuresCard: { padding: 20, gap: 14 },
  featuresHeaderRow: { gap: 8, marginBottom: 4 },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  premiumBadgeText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: '#160050',
    letterSpacing: 1.2,
  },
  featuresTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: '#dee1f9',
    letterSpacing: -0.2,
  },
  featuresSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(201,196,216,0.6)',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(222,225,249,0.85)',
    flex: 1,
  },
  checkSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeCard: { padding: 18, gap: 10, opacity: 0.65 },
  freeTierLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#928ea1',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  featureRowMuted: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureTextMuted: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(146,142,161,0.65)',
  },
  ctaWrapper: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  ctaNote: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: 'rgba(146,142,161,0.55)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  crownBox: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  crownEmoji: { fontSize: 52 },
  crownBoxSmall: { padding: 14, alignItems: 'center', justifyContent: 'center' },
  crownEmojiSmall: { fontSize: 32 },
  premiumActiveContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 16 },
  premiumActiveTitle: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#dee1f9', letterSpacing: -0.3 },
  premiumActiveSub: { fontFamily: 'Manrope_400Regular', fontSize: 15, color: 'rgba(201,196,216,0.7)', textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(222,225,249,0.85)', flex: 1 },
});
