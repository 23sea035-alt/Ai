import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View, ViewStyle } from 'react-native';

interface CompanionAvatarProps {
  seed: string;
  size?: number;
  colorFrom?: string;
  colorTo?: string;
  pulsate?: boolean;
  style?: ViewStyle;
  showOnlineIndicator?: boolean;
}

export function CompanionAvatar({
  seed,
  size = 64,
  colorFrom = '#c9bfff',
  colorTo = '#8fd8ff',
  pulsate = false,
  style,
  showOnlineIndicator = false,
}: CompanionAvatarProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const ringAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulsate) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.04,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
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
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1.15,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulsate]);

  const avatarUrl = `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(seed)}&size=${Math.round(size * 2)}&backgroundColor=0b1020,141428`;

  const indicatorSize = size * 0.22;

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Expanding glow ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: colorFrom + '50',
          transform: [{ scale: ringAnim }],
          opacity: glowAnim,
        }}
      />
      {/* Main animated wrapper */}
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Shadow glow */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: size / 2,
            shadowColor: colorFrom,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: size * 0.35,
            elevation: 12,
          }}
        />
        {/* Avatar circle */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: colorFrom + '70',
          }}
        >
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[colorFrom + '28', colorTo + '38']}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </Animated.View>

      {/* Online indicator */}
      {showOnlineIndicator && (
        <View
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: indicatorSize,
            height: indicatorSize,
            borderRadius: indicatorSize / 2,
            backgroundColor: '#4ade80',
            borderWidth: 2,
            borderColor: '#0e1323',
          }}
        />
      )}
    </View>
  );
}
