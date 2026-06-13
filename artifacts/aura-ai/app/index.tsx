import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraOrb } from '@/components/AuraOrb';
import { useApp } from '@/context/AppContext';

const STATUS_TEXTS = [
  'Synchronizing Neural Links',
  'Calibrating Aura Field',
  'Initializing Personality Matrix',
  'Establishing Luminous Stream',
];

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [statusText, setStatusText] = useState(STATUS_TEXTS[0]);
  const [textOpacity] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, 500);

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < STATUS_TEXTS.length) {
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setStatusText(STATUS_TEXTS[idx]);
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      } else {
        clearInterval(interval);
      }
    }, 900);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (user?.onboardingDone) {
        router.replace('/(tabs)');
      } else if (user) {
        router.replace('/onboarding');
      } else {
        router.replace('/welcome');
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [isLoading, user]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#1A1F4B']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Ambient glows */}
      <View style={styles.glowTopLeft} pointerEvents="none" />
      <View style={styles.glowBottomRight} pointerEvents="none" />

      <View style={[styles.content, { paddingTop: topInset }]}>
        {/* Orb */}
        <Animated.View
          style={[
            styles.orbContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <AuraOrb size={220} colorFrom="#c9bfff" colorTo="#8fd8ff" pulsate />
        </Animated.View>

        {/* Branding */}
        <Animated.View
          style={[
            styles.branding,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
          <Text style={styles.appName}>Aura AI</Text>
          <Text style={styles.tagline}>AI COMPANION</Text>
        </Animated.View>

        {/* Progress */}
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <Animated.Text style={[styles.statusText, { opacity: textOpacity }]}>
            {statusText}
          </Animated.Text>
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.attribution,
          { opacity: fadeAnim, bottom: insets.bottom + 24 },
        ]}
      >
        Powered by Luminous Intelligence
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  glowTopLeft: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(201,191,255,0.08)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(143,216,255,0.05)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: 20,
  },
  orbContainer: { alignItems: 'center', justifyContent: 'center' },
  branding: { alignItems: 'center', gap: 8 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoLetter: {
    fontFamily: 'Sora_700Bold',
    fontSize: 32,
    color: '#c9bfff',
  },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 32,
    color: '#dee1f9',
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#8fd8ff',
    letterSpacing: 3,
    opacity: 0.7,
  },
  progressContainer: { alignItems: 'center', gap: 12, width: '100%', maxWidth: 220 },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#c9bfff',
  },
  statusText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#928ea1',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  attribution: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: 'rgba(146,142,161,0.5)',
  },
});
