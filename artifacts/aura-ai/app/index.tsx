import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraOrb } from '@/components/AuraOrb';
import { ParticleField } from '@/components/ParticleField';
import { StarField } from '@/components/StarField';
import { useApp } from '@/context/AppContext';

const STATUS_TEXTS = [
  'Synchronizing Neural Links',
  'Calibrating Aura Field',
  'Initializing Personality Matrix',
  'Establishing Luminous Stream',
];

const RINGS = [
  { size: 320, opacity: 0.07, delay: 0 },
  { size: 250, opacity: 0.1, delay: 400 },
  { size: 180, opacity: 0.14, delay: 800 },
];

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [statusText, setStatusText] = useState(STATUS_TEXTS[0]);
  const [textOpacity] = useState(new Animated.Value(1));
  const ringRotate = useRef(new Animated.Value(0)).current;
  const ringRotate2 = useRef(new Animated.Value(0)).current;
  const bgGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bgGlow, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
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

    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(ringRotate2, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

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
    }, 3600);
    return () => clearTimeout(timer);
  }, [isLoading, user]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const spin = ringRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinBack = ringRotate2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060a18', '#0B1020', '#121A35', '#1A1F4B']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <StarField count={100} />
      <ParticleField count={22} />

      {/* Deep ambient glows */}
      <View style={styles.glowTopLeft} pointerEvents="none" />
      <View style={styles.glowBottomRight} pointerEvents="none" />
      <Animated.View
        style={[
          styles.glowCenter,
          {
            opacity: bgGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
          },
        ]}
        pointerEvents="none"
      />

      <View style={[styles.content, { paddingTop: topInset }]}>
        {/* Orbital rings + Orb */}
        <Animated.View
          style={[
            styles.orbContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Rings */}
          {RINGS.map((ring, i) => (
            <Animated.View
              key={i}
              style={[
                styles.ring,
                {
                  width: ring.size,
                  height: ring.size,
                  borderRadius: ring.size / 2,
                  opacity: ring.opacity,
                  borderColor: i % 2 === 0 ? '#c9bfff' : '#8fd8ff',
                  position: 'absolute',
                  transform: [{ rotate: i % 2 === 0 ? spin : spinBack }],
                },
              ]}
            />
          ))}
          {/* Dotted orbit */}
          <View style={styles.orbitDotContainer}>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * 2 * Math.PI;
              const r = 130;
              return (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: '#c9bfff',
                    opacity: 0.4,
                    left: 135 + r * Math.cos(angle) - 1.5,
                    top: 135 + r * Math.sin(angle) - 1.5,
                  }}
                />
              );
            })}
          </View>
          <AuraOrb size={220} colorFrom="#c9bfff" colorTo="#8fd8ff" pulsate />
        </Animated.View>

        {/* Branding */}
        <Animated.View
          style={[
            styles.branding,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.appName}>Aura AI</Text>
          <Text style={styles.tagline}>A E T H E R  ·  I N T E L L I G E N C E</Text>
        </Animated.View>

        {/* Progress */}
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]}>
              <View style={styles.progressGlow} />
            </Animated.View>
          </View>
          <Animated.Text style={[styles.statusText, { opacity: textOpacity }]}>
            {statusText}
          </Animated.Text>
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.attribution,
          { opacity: fadeAnim, bottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 24 },
        ]}
      >
        Powered by Luminous Intelligence
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTopLeft: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: 'rgba(201,191,255,0.09)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(143,216,255,0.06)',
  },
  glowCenter: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(145,126,255,0.08)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    paddingHorizontal: 20,
  },
  orbContainer: {
    width: 290,
    height: 290,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  orbitDotContainer: {
    position: 'absolute',
    width: 270,
    height: 270,
  },
  branding: { alignItems: 'center', gap: 10 },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 38,
    color: '#dee1f9',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(201,191,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: '#8fd8ff',
    letterSpacing: 3.5,
    opacity: 0.8,
  },
  progressContainer: { alignItems: 'center', gap: 14, width: '100%', maxWidth: 240 },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    overflow: 'visible',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#c9bfff',
    overflow: 'visible',
  },
  progressGlow: {
    position: 'absolute',
    right: -4,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c9bfff',
    shadowColor: '#c9bfff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  statusText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#928ea1',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  attribution: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: 'rgba(146,142,161,0.4)',
    letterSpacing: 0.5,
  },
});
