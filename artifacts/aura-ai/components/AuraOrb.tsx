import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface AuraOrbProps {
  size?: number;
  colorFrom?: string;
  colorTo?: string;
  label?: string;
  style?: ViewStyle;
  pulsate?: boolean;
}

export function AuraOrb({
  size = 64,
  colorFrom = '#c9bfff',
  colorTo = '#8fd8ff',
  label,
  style,
  pulsate = true,
}: AuraOrbProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulsate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.07,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(ringPulse, {
            toValue: 1.18,
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ringPulse, {
            toValue: 1,
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim2, {
        toValue: 1,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    ).start();
  }, [pulsate]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spinReverse = rotateAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const shimmerX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-size, size * 1.5],
  });

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Outer expanding ring */}
      {pulsate && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: size / 2,
              borderWidth: 1,
              borderColor: colorFrom + '30',
              transform: [{ scale: ringPulse }],
              opacity: glowAnim,
            },
          ]}
        />
      )}

      {/* Shadow glow */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: size / 2,
            shadowColor: colorFrom,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: pulsate ? (glowAnim as any) : 0.5,
            shadowRadius: size * 0.4,
            elevation: 15,
          },
        ]}
      />

      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colorFrom + '40',
            transform: pulsate ? [{ scale: pulseAnim }] : [],
          },
        ]}
      />

      {/* Rotating gradient layer 1 */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: size / 2, transform: [{ rotate: spin }] },
        ]}
      >
        <LinearGradient
          colors={[colorFrom, colorTo, colorFrom + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: size / 2, opacity: 0.9 }]}
        />
      </Animated.View>

      {/* Counter-rotating layer 2 for depth */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: size / 2, transform: [{ rotate: spinReverse }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', colorTo + '60', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: size / 2 }]}
        />
      </Animated.View>

      {/* Inner glass overlay */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: size / 2,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.18)',
          },
        ]}
      />

      {/* Shimmer sweep */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: size * 0.35,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,0.15)',
          transform: [{ translateX: shimmerX }, { skewX: '-20deg' }],
          overflow: 'hidden',
        }}
        pointerEvents="none"
      />

      {/* Label */}
      {label ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <Text
            style={[
              styles.label,
              { fontSize: size * 0.35 },
            ]}
          >
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  glowRing: {
    position: 'absolute',
    borderWidth: 1,
  },
  label: {
    fontFamily: 'Sora_700Bold',
    color: '#dee1f9',
    textShadowColor: 'rgba(201,191,255,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
