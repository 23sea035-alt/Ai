import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: W, height: H } = Dimensions.get('screen');
const COLORS = ['#c9bfff', '#8fd8ff', '#B388FF', '#917eff', '#ffffff'];

interface ParticleDef {
  x: number;
  startY: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function buildParticles(count: number): ParticleDef[] {
  return Array.from({ length: count }, (_, i) => ({
    x: rand(0, W),
    startY: rand(H * 0.2, H),
    size: rand(1, 3),
    duration: rand(9000, 18000),
    delay: rand(0, 8000),
    opacity: rand(0.15, 0.55),
    color: COLORS[i % COLORS.length],
  }));
}

function Dot({ p }: { p: ParticleDef }) {
  const yAnim = useRef(new Animated.Value(0)).current;
  const opAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      yAnim.setValue(0);
      opAnim.setValue(0);
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(yAnim, {
            toValue: -H * 0.55,
            duration: p.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opAnim, {
              toValue: p.opacity,
              duration: p.duration * 0.15,
              useNativeDriver: true,
            }),
            Animated.timing(opAnim, {
              toValue: p.opacity * 0.8,
              duration: p.duration * 0.7,
              useNativeDriver: true,
            }),
            Animated.timing(opAnim, {
              toValue: 0,
              duration: p.duration * 0.15,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(run);
    };
    run();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: p.x,
        top: p.startY,
        width: p.size,
        height: p.size,
        borderRadius: p.size / 2,
        backgroundColor: p.color,
        opacity: opAnim,
        transform: [{ translateY: yAnim }],
        shadowColor: p.color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: p.size * 2.5,
      }}
    />
  );
}

export function ParticleField({ count = 28 }: { count?: number }) {
  const particles = useRef(buildParticles(count)).current;
  return (
    <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none" }]}>
      {particles.map((p, i) => (
        <Dot key={i} p={p} />
      ))}
    </View>
  );
}
