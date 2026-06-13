import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraButton } from '@/components/AuraButton';
import { AuraOrb } from '@/components/AuraOrb';
import { GlassCard } from '@/components/GlassCard';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

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
  }, []);

  const orb1Translate = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  const orb2Translate = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 20;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1F4B', '#0e1323', '#080d1d']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Atmospheric orbs */}
      <Animated.View
        style={[styles.ambientOrb1, { transform: [{ translateY: orb1Translate }] }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.ambientOrb2, { transform: [{ translateY: orb2Translate }] }]}
        pointerEvents="none"
      />

      {/* Center visual */}
      <View style={styles.centerVisual} pointerEvents="none">
        <View style={styles.ringOuter}>
          <View style={styles.ringInner} />
          <View style={styles.orbCenter}>
            <AuraOrb size={120} colorFrom="#c9bfff" colorTo="#B388FF" pulsate />
          </View>
        </View>
      </View>

      {/* Bottom card */}
      <Animated.View
        style={[
          styles.cardWrapper,
          { paddingBottom: bottomPad, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <GlassCard style={styles.card} radius={32}>
          <View style={styles.cardContent}>
            <Text style={styles.headline}>Your companion,{'\n'}anywhere, anytime.</Text>
            <Text style={styles.subtext}>
              Experience a sentient AI that learns from your world and grows with you.
            </Text>

            <View style={styles.actions}>
              <AuraButton
                label="Get Started"
                onPress={() => router.push('/onboarding')}
                style={styles.primaryBtn}
              />
              <AuraButton
                label="Log In"
                onPress={() => router.push('/(auth)/login')}
                variant="secondary"
                style={styles.secondaryBtn}
              />
            </View>

            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
            </Text>
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1323', justifyContent: 'flex-end' },
  ambientOrb1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(179,136,255,0.12)',
  },
  ambientOrb2: {
    position: 'absolute',
    bottom: -50,
    right: -100,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(143,216,255,0.06)',
  },
  centerVisual: {
    position: 'absolute',
    top: '12%',
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.5,
  },
  ringOuter: {
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  orbCenter: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    paddingHorizontal: 16,
  },
  card: { padding: 0 },
  cardContent: { padding: 28, gap: 20 },
  headline: {
    fontFamily: 'Sora_700Bold',
    fontSize: 26,
    color: '#dee1f9',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  subtext: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: 'rgba(201,196,216,0.8)',
    lineHeight: 22,
  },
  actions: { gap: 12, marginTop: 4 },
  primaryBtn: {},
  secondaryBtn: {},
  terms: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: 'rgba(146,142,161,0.7)',
    textAlign: 'center',
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: '#928ea1',
  },
});
