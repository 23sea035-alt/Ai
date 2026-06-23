import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';

const FEATURES = [
  { text: 'Unlimited Neural Chat', icon: 'infinite-outline' as const },
  { text: 'High-Fidelity Neural Voices', icon: 'mic-outline' as const },
  { text: 'Custom 3D Avatar Generation', icon: 'cube-outline' as const },
  { text: 'Priority GPU Access', icon: 'flash-outline' as const },
  { text: 'Memory Continuity (100GB)', icon: 'server-outline' as const },
];

const BASIC_FEATURES = [
  { text: '50 messages / day', icon: 'chatbubbles-outline' as const },
  { text: 'Standard AI Models', icon: 'hardware-chip-outline' as const },
  { text: 'Custom Avatars', icon: 'person-outline' as const },
];

function PremiumCard() {
  const { startCheckout, user } = useApp();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [premiumActivated, setPremiumActivated] = useState(false);
  const ctaScale = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    featureAnims.forEach((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 400, delay: 300 + i * 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
    );
    return () => loop.stop();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const handleUnlock = async () => {
    if (user?.isPremium || premiumActivated) return;
    setCheckoutLoading(true);
    try {
      const url = await startCheckout();
      if (url) {
        await Linking.openURL(url);
      }
    } catch {}
    setCheckoutLoading(false);
  };

  return (
    <Animated.View style={[styles.premiumCard, { transform: [{ translateY }] }]}>
      <LinearGradient
        colors={['rgba(139,92,246,0.3)', 'rgba(168,85,247,0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.recommendedBadge}>
        <Ionicons name="star" size={10} color="#1e1b4b" />
        <Text style={styles.recommendedText}>RECOMMENDED</Text>
      </View>

      <Text style={styles.planName}>Aura Premium</Text>
      <Text style={styles.price}>
        $19.99<Text style={styles.pricePeriod}> /month</Text>
      </Text>
      <Text style={styles.priceNote}>Billed monthly · Cancel anytime · 7-day free trial</Text>

      <View style={styles.featureList}>
        {FEATURES.map((f, i) => (
          <Animated.View
            key={f.text}
            style={[
              styles.featureRow,
              {
                opacity: featureAnims[i],
                transform: [{ translateX: featureAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
              },
            ]}
          >
            <Ionicons name={f.icon} size={16} color="#c084fc" />
            <Text style={styles.featureText}>{f.text}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View style={{ transform: [{ scale: ctaScale }], marginTop: 20 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleUnlock}
          onPressIn={() => Animated.spring(ctaScale, { toValue: 0.97, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true }).start()}
          disabled={checkoutLoading || user?.isPremium}
        >
          <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.ctaBtn}>
            <Ionicons name="diamond-outline" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>
              {user?.isPremium ? 'Already Premium' : checkoutLoading ? 'Activating...' : 'Unlock Premium'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function BasicCard() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const featureAnims = useRef(BASIC_FEATURES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    featureAnims.forEach((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 400, delay: 600 + i * 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
    );
  }, []);

  return (
    <View style={styles.basicCard}>
      <View style={styles.currentBadge}>
        <Ionicons name="checkmark-circle" size={12} color="#c084fc" />
        <Text style={styles.currentBadgeText}>Current Plan</Text>
      </View>

      <Text style={styles.basicPlanName}>Aura Basic</Text>
      <Text style={styles.basicPrice}>
        Free<Text style={styles.basicPriceNote}> forever</Text>
      </Text>

      <View style={styles.featureList}>
        {BASIC_FEATURES.map((f, i) => (
          <Animated.View
            key={f.text}
            style={[
              styles.featureRow,
              {
                opacity: featureAnims[i],
                transform: [{ translateX: featureAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
              },
            ]}
          >
            <Ionicons name={f.icon} size={16} color="#c084fc" />
            <Text style={styles.featureText}>{f.text}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === 'web' ? 14 : insets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        start={{ x: 0.2, y: 0.3 }}
        end={{ x: 0.8, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.logoTitle}>
          <LinearGradient colors={['#c084fc', '#7c3aed']} style={styles.logoIcon}>
            <Ionicons name="bulb" size={24} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>Aura AI</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.7}>
            <Ionicons name="person-circle-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
          <Text style={styles.heroTitle}>Elevate Your Aura</Text>
          <Text style={styles.heroSub}>
            Experience the next generation of companionship with high-fidelity digital intelligence.
          </Text>
        </Animated.View>

        <View style={styles.pricingContainer}>
          <PremiumCard />
          <BasicCard />
        </View>

        <View style={styles.communitySection}>
          <Text style={styles.communityText}>
            <Ionicons name="people-outline" size={14} color="#c084fc" /> Join 50,000+ souls transforming their digital journey
          </Text>
          <View style={styles.paymentIcons}>
            <Ionicons name="logo-apple" size={24} color="rgba(216,180,254,0.7)" />
            <Ionicons name="logo-google" size={24} color="rgba(216,180,254,0.7)" />
            <Ionicons name="card-outline" size={24} color="rgba(216,180,254,0.7)" />
            <Ionicons name="lock-closed-outline" size={24} color="rgba(216,180,254,0.7)" />
          </View>
          <Text style={styles.secureText}>
            <Ionicons name="shield-checkmark-outline" size={12} color="rgba(216,180,254,0.6)" /> Secure 256-bit encryption · 24/7 support
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  logoTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerIcons: { flexDirection: 'row', gap: 14 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 30,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },

  heroSection: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, alignItems: 'center', gap: 8 },
  heroTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(216,180,254,0.85)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },

  pricingContainer: { paddingHorizontal: 20, gap: 20, paddingBottom: 16 },

  premiumCard: {
    borderRadius: 44,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.6)',
    position: 'relative',
    overflow: 'hidden',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 16,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 40,
  },
  recommendedText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 11,
    color: '#1e1b4b',
    letterSpacing: 0.5,
  },
  planName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 4,
  },
  price: {
    fontFamily: 'Sora_700Bold',
    fontSize: 44,
    color: '#fff',
    letterSpacing: -1,
    marginTop: 12,
  },
  pricePeriod: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: 'rgba(216,180,254,0.7)',
  },
  priceNote: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: 'rgba(216,180,254,0.6)',
    marginTop: 4,
    marginBottom: 20,
  },
  featureList: { gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 60,
  },
  ctaBtnText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 16,
    color: '#fff',
  },

  basicCard: {
    backgroundColor: 'rgba(168,85,247,0.06)',
    borderRadius: 44,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139,92,246,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 30,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  currentBadgeText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 11,
    color: '#c084fc',
    letterSpacing: 0.5,
  },
  basicPlanName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  basicPrice: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#fff',
    marginTop: 12,
  },
  basicPriceNote: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(216,180,254,0.7)',
  },

  communitySection: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168,85,247,0.2)',
  },
  communityText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(216,180,254,0.75)',
    textAlign: 'center',
  },
  paymentIcons: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  secureText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: 'rgba(216,180,254,0.6)',
    textAlign: 'center',
  },
});
