import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
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
import { useApp } from '@/context/AppContext';

const FEATURES_FREE = [
  '1 AI companion',
  '50 messages/day',
  'Basic memory (7 days)',
  'Text chat only',
  'Standard response speed',
];

const FEATURES_PREMIUM = [
  'Unlimited companions',
  'Unlimited messages',
  'Persistent long-term memory',
  'Voice calls (60 min/month)',
  'Priority AI responses',
  'Custom companion avatars',
  'Advanced memory search',
  'Relationship timeline',
];

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '$12.99', period: '/month', savings: null },
  { id: 'yearly', label: 'Yearly', price: '$7.99', period: '/month', savings: 'Save 38%' },
];

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useApp();
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 100;

  const handleUpgrade = () => {
    updateUser({ isPremium: true });
  };

  if (user?.isPremium) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <LinearGradient
          colors={['#0B1020', '#121A35', '#0e1323']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.premiumActiveContent}>
          <View style={styles.crownBox}>
            <Ionicons name="star" size={40} color="#ffb77d" />
          </View>
          <Text style={styles.premiumActiveTitle}>You're Premium!</Text>
          <Text style={styles.premiumActiveSub}>Enjoy all Aura AI features with no limits.</Text>
          <GlassCard style={styles.badgeCard} radius={16}>
            <View style={styles.badgeRow}>
              <Ionicons name="checkmark-circle" size={18} color="#8fd8ff" />
              <Text style={styles.badgeText}>Unlimited companions & messages</Text>
            </View>
            <View style={styles.badgeRow}>
              <Ionicons name="checkmark-circle" size={18} color="#8fd8ff" />
              <Text style={styles.badgeText}>Persistent long-term memory active</Text>
            </View>
            <View style={styles.badgeRow}>
              <Ionicons name="checkmark-circle" size={18} color="#8fd8ff" />
              <Text style={styles.badgeText}>Voice calls enabled</Text>
            </View>
          </GlassCard>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Ambient glow */}
      <View style={styles.ambientCenter} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset }]}>
          <Text style={styles.eyebrow}>UNLOCK EVERYTHING</Text>
          <Text style={styles.headerTitle}>Aura Premium</Text>
          <Text style={styles.headerSub}>The most advanced AI companion experience available.</Text>
        </View>

        {/* Plan selector */}
        <View style={styles.planRow}>
          {PLANS.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setSelectedPlan(p.id)}
              activeOpacity={0.8}
              style={styles.planBtnWrapper}
            >
              <GlassCard
                style={[styles.planCard, selectedPlan === p.id && styles.planCardActive]}
                radius={16}
              >
                {p.savings ? (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{p.savings}</Text>
                  </View>
                ) : null}
                <Text style={styles.planLabel}>{p.label}</Text>
                <Text style={styles.planPrice}>{p.price}</Text>
                <Text style={styles.planPeriod}>{p.period}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features comparison */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {/* Premium */}
          <GlassCard style={styles.featuresCard} radius={20}>
            <View style={styles.featuresHeader}>
              <LinearGradient
                colors={['#c9bfff', '#8fd8ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.premiumBadge}
              >
                <Ionicons name="star" size={12} color="#1a0063" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </LinearGradient>
              <Text style={styles.featuresTitle}>Everything included</Text>
            </View>
            {FEATURES_PREMIUM.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color="#c9bfff" />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </GlassCard>

          {/* Free */}
          <GlassCard style={styles.featuresCardMuted} radius={16}>
            <Text style={styles.freeTierLabel}>Free Tier</Text>
            {FEATURES_FREE.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="remove-circle-outline" size={18} color="#484555" />
                <Text style={styles.featureTextMuted}>{f}</Text>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrapper}>
          <AuraButton label="Start Premium — 7 Day Free Trial" onPress={handleUpgrade} />
          <Text style={styles.ctaNote}>Cancel anytime. No charges during trial.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  ambientCenter: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201,191,255,0.06)',
  },
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 8, alignItems: 'center' },
  eyebrow: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#8fd8ff',
    letterSpacing: 2.5,
  },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 30,
    color: '#dee1f9',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.7)',
    textAlign: 'center',
  },
  planRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  planBtnWrapper: { flex: 1 },
  planCard: { padding: 16, alignItems: 'center', gap: 4 },
  planCardActive: {
    borderColor: 'rgba(201,191,255,0.5)',
    backgroundColor: 'rgba(201,191,255,0.08)',
  },
  savingsBadge: {
    backgroundColor: 'rgba(201,191,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  savingsText: {
    fontFamily: 'Manrope_700Bold' as any,
    fontSize: 11,
    color: '#c9bfff',
    letterSpacing: 0.5,
  },
  planLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#928ea1',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  planPrice: {
    fontFamily: 'Sora_700Bold',
    fontSize: 26,
    color: '#dee1f9',
  },
  planPeriod: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#928ea1',
  },
  featuresCard: { padding: 20, gap: 12 },
  featuresCardMuted: { padding: 16, gap: 10, opacity: 0.7 },
  featuresHeader: { gap: 8 },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumBadgeText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: '#1a0063',
    letterSpacing: 1,
  },
  featuresTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    color: '#dee1f9',
  },
  freeTierLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#928ea1',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(222,225,249,0.8)',
  },
  featureTextMuted: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(146,142,161,0.7)',
  },
  ctaWrapper: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  ctaNote: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: 'rgba(146,142,161,0.6)',
    textAlign: 'center',
  },
  premiumActiveContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  crownBox: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(255,183,125,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,183,125,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumActiveTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 26,
    color: '#dee1f9',
  },
  premiumActiveSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: 'rgba(201,196,216,0.7)',
    textAlign: 'center',
  },
  badgeCard: { padding: 20, gap: 12, width: '100%' },
  badgeRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  badgeText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(222,225,249,0.85)',
  },
});
