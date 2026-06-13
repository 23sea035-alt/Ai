import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: W, height: H } = Dimensions.get('screen');

interface StarDef {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  maxOpacity: number;
}

function buildStars(count: number): StarDef[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.75,
    size: 0.5 + Math.random() * 1.8,
    duration: 1800 + Math.random() * 3500,
    delay: Math.random() * 5000,
    maxOpacity: 0.25 + Math.random() * 0.6,
  }));
}

function Star({ s }: { s: StarDef }) {
  const op = useRef(new Animated.Value(s.maxOpacity * 0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(s.delay),
        Animated.timing(op, {
          toValue: s.maxOpacity,
          duration: s.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(op, {
          toValue: s.maxOpacity * 0.15,
          duration: s.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: s.x,
        top: s.y,
        width: s.size,
        height: s.size,
        borderRadius: s.size / 2,
        backgroundColor: '#ffffff',
        opacity: op,
      }}
    />
  );
}

export function StarField({ count = 90 }: { count?: number }) {
  const stars = useRef(buildStars(count)).current;
  return (
    <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none" }]}>
      {stars.map((s, i) => (
        <Star key={i} s={s} />
      ))}
    </View>
  );
}
