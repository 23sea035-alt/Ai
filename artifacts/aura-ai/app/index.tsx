import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MAX_WIDTH = 420;

function Orb({
  size,
  top,
  left,
  bottom,
  right,
  color,
  duration,
  delay,
}: {
  size: number;
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  color: string;
  duration: number;
  delay?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay ?? 0),
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, left != null ? 60 : -60],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        top,
        left,
        bottom,
        right,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [
          { translateX },
          { translateY },
          { scale },
        ],
      }}
    />
  );
}

function GridPattern() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {Array.from({ length: Math.ceil(SCREEN_WIDTH / 40) }).map((_, col) => (
        <React.Fragment key={col}>
          {Array.from({ length: 40 }).map((_, row) => (
            <View
              key={`${col}-${row}`}
              style={{
                position: 'absolute',
                left: col * 40,
                top: row * 40,
                width: 1,
                height: 1,
                backgroundColor: 'rgba(168,85,247,0.04)',
              }}
            />
          ))}
        </React.Fragment>
      ))}
    </View>
  );
}

function SparkleField() {
  const sparkles = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * 100,
      size: 2 + Math.random() * 2,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    })),
  ).current;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {sparkles.map((s, i) => {
        const op = useRef(new Animated.Value(0.2)).current;
        useEffect(() => {
          Animated.loop(
            Animated.sequence([
              Animated.delay(s.delay * 1000),
              Animated.timing(op, {
                toValue: 1,
                duration: s.duration * 500,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(op, {
                toValue: 0.2,
                duration: s.duration * 500,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ]),
          ).start();
        }, []);
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: s.x,
              top: `${s.y}%` as any,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              backgroundColor: '#fff',
              opacity: op,
              shadowColor: '#c084fc',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 6,
            }}
          />
        );
      })}
    </View>
  );
}

function ParticleField() {
  const particles = useRef(
    Array.from({ length: 150 }, (_, i) => ({
      left: Math.random() * 100,
      size: 2 + Math.random() * 6,
      duration: 10000 + Math.random() * 18000,
      delay: Math.random() * 16000,
      isGlow: Math.random() > 0.8,
    })),
  ).current;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {particles.map((p, i) => {
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
                  toValue: -Dimensions.get('window').height * 0.55,
                  duration: p.duration,
                  easing: Easing.linear,
                  useNativeDriver: true,
                }),
                Animated.sequence([
                  Animated.timing(opAnim, {
                    toValue: 0.9,
                    duration: p.duration * 0.15,
                    useNativeDriver: true,
                  }),
                  Animated.timing(opAnim, {
                    toValue: 0.7,
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
            key={i}
            style={{
              position: 'absolute',
              left: `${p.left}%` as any,
              top: '100%',
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.isGlow
                ? 'rgba(255,255,255,0.4)'
                : 'rgba(192,132,252,0.9)',
              opacity: opAnim,
              transform: [{ translateY: yAnim }],
              shadowColor: '#c084fc',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: p.isGlow ? 0.2 : 0.5,
              shadowRadius: p.isGlow ? 10 : p.size * 2,
            }}
          />
        );
      })}
    </View>
  );
}

function DotLoader() {
  const dots = useRef(
    Array.from({ length: 3 }, (_, i) => ({
      anim: new Animated.Value(0.6),
      delay: i * 200,
    })),
  ).current;

  useEffect(() => {
    dots.forEach((d) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(d.delay),
          Animated.timing(d.anim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(d.anim, {
            toValue: 0.6,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ]),
      ).start();
    });
  }, []);

  return (
    <View style={styles.dotRow}>
      {dots.map((d, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: d.anim,
              transform: [
                {
                  scale: d.anim.interpolate({
                    inputRange: [0.6, 1],
                    outputRange: [0.6, 1.1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

function CalibrationRing({ progress }: { progress: Animated.Value }) {
  const spin = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;
  const spin3 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.timing(spin2, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.timing(spin3, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const deg1 = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const deg2 = spin2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const deg3 = spin3.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });
  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const progressNum = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  const [percentColor, setPercentColor] = useState('#c084fc');
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const listenerId = progress.addListener(({ value }) => {
      const val = Math.round(value * 100);
      setDisplayValue(val);
      if (val < 30) {
        setPercentColor('#c084fc');
      } else if (val < 60) {
        setPercentColor('#a78bfa');
      } else if (val < 85) {
        setPercentColor('#8b5cf6');
      } else {
        setPercentColor('#34d399');
      }
    });
    return () => progress.removeListener(listenerId);
  }, []);

  return (
    <View style={styles.calContainer}>
      {/* Pulse background */}
      <Animated.View
        style={[
          styles.calPulseBg,
          {
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />

      {/* Ring layer 1 - slow spin with dot */}
      <Animated.View
        style={[
          styles.calRing,
          {
            inset: 0,
            borderColor: 'rgba(168,85,247,0.15)',
            transform: [{ rotate: deg1 }],
          },
        ]}
      >
        <View style={styles.calRingDot1} />
      </Animated.View>

      {/* Ring layer 2 - fast spin with gradient */}
      <Animated.View
        style={[
          styles.calRing,
          {
            inset: -4,
            borderColor: 'transparent',
            borderTopColor: '#c084fc',
            borderRightColor: '#8b5cf6',
            transform: [{ rotate: deg2 }],
          },
        ]}
      />

      {/* Ring layer 3 - reverse */}
      <Animated.View
        style={[
          styles.calRing,
          {
            inset: -8,
            borderColor: 'transparent',
            borderBottomColor: 'rgba(192,132,252,0.7)',
            borderLeftColor: 'rgba(139,92,246,0.7)',
            transform: [{ rotate: deg3 }],
          },
        ]}
      />

      {/* Inner ring */}
      <View style={[styles.calRing, { inset: 8, borderColor: 'rgba(168,85,247,0.08)', borderWidth: 1.5 }]} />
      <View style={[styles.calRing, { inset: 16, borderColor: 'rgba(168,85,247,0.06)', borderWidth: 1 }]} />

      {/* Center */}
      <View style={styles.calCenter}>
        <Text style={styles.calLabel}>Calibrating</Text>
        <View style={styles.calValueRow}>
          <Text style={styles.calValue}>
            {displayValue}
          </Text>
          <Text style={[styles.calPercent, { color: percentColor }]}>%</Text>
        </View>
        <DotLoader />
      </View>
    </View>
  );
}

function CardAura() {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const deg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: '-30%',
        left: '-30%',
        width: '160%',
        height: '160%',
        borderRadius: 500,
        backgroundColor: 'transparent',
        transform: [{ rotate: deg }],
      }}
    >
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: 500,
          backgroundColor: 'rgba(192,132,252,0.04)',
        }}
      />
    </Animated.View>
  );
}

function Toast({ visible, message }: { visible: boolean; message: string }) {
  const op = useRef(new Animated.Value(0)).current;
  const trans = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(op, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(trans, {
          toValue: -12,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(op, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(trans, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 100,
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Animated.View
        style={{
          paddingHorizontal: 28,
          paddingVertical: 14,
          borderRadius: 100,
          borderWidth: 1,
          borderColor: 'rgba(168,85,247,0.6)',
          backgroundColor: 'rgba(25,20,50,0.98)',
          opacity: op,
          transform: [{ translateY: trans }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 15 },
          shadowOpacity: 0.4,
          shadowRadius: 35,
          elevation: 20,
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontWeight: '700',
            fontSize: 14,
            fontFamily: 'Sora_700Bold',
            includeFontPadding: false,
          }}
        >
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { isLoading } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;
  const fieldAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current;
  const cardShadowAnim = useRef(new Animated.Value(0)).current;
  const [toastVisible, setToastVisible] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        setCompleted(true);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2600);
        Animated.sequence([
          Animated.parallel([
            Animated.timing(cardScaleAnim, {
              toValue: 1.015,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(cardShadowAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: false,
            }),
          ]),
          Animated.delay(800),
          Animated.parallel([
            Animated.timing(cardScaleAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(cardShadowAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: false,
            }),
          ]),
        ]).start();
      });
    }, 400);

    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Label pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(labelAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(labelAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();

    // Field text pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fieldAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(fieldAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 5500);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const logoScale = logoPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });
  const logoGlow = logoPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const labelLetterSpacing = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.2, 1.6],
  });
  const labelOpacity = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const fieldLetterSpacing = fieldAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.4],
  });
  const fieldOpacity = fieldAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const cardGlowOpacity = cardShadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        locations={[0.2, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Orbs */}
      <Orb size={400} top={-150} left={-150} color="rgba(168,85,247,0.35)" duration={16000} />
      <Orb size={500} bottom={-200} right={-200} color="rgba(59,130,246,0.3)" duration={20000} />
      <Orb size={300} top={350} right={-80} color="rgba(192,132,252,0.25)" duration={18000} />
      <Orb size={200} bottom={80} left={-60} color="rgba(139,92,246,0.3)" duration={12000} delay={2} />

      <GridPattern />
      <ParticleField />
      <SparkleField />

      {/* Glass card */}
      <View style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.cardOuter,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: cardScaleAnim }],
            },
          ]}
        >
          <BlurView intensity={36} tint="dark" style={styles.glassCard}>
            <CardAura />
            <CardAura />

            {/* Logo */}
            <View style={styles.logoWrapper}>
              <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                <LinearGradient
                  colors={['#c084fc', '#7c3aed']}
                  style={styles.logoIcon}
                >
                  <Ionicons name="bulb" size={44} color="#fff" />
                </LinearGradient>
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    borderRadius: 32,
                    borderWidth: 2,
                    borderColor: 'rgba(192,132,252,0.4)',
                    opacity: logoGlow,
                  }}
                />
              </Animated.View>
            </View>

            {/* Brand name with gradient */}
            <Text style={styles.brandName}>Aura AI</Text>
            <Text style={styles.subtitle}>AI COMPANION</Text>

            {/* Calibration ring */}
            <CalibrationRing progress={progressAnim} />

            {/* Field text */}
            <Animated.Text
              style={[
                styles.fieldText,
                {
                  letterSpacing: fieldLetterSpacing as any,
                  opacity: fieldOpacity,
                },
              ]}
            >
              AURA FIELD
            </Animated.Text>

            {/* Footer */}
            <View style={styles.footer}>
              <Ionicons name="star" size={12} color="#c084fc" />
              <Text style={styles.footerText}>Powered by Luminous Intelligence</Text>
            </View>
          </BlurView>
        </Animated.View>
      </View>

      <Toast visible={toastVisible} message="✨ Aura AI fully calibrated · Ready for connection ✨" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardOuter: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
  },
  glassCard: {
    borderRadius: 56,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    backgroundColor: 'rgba(15,12,35,0.45)',
  },

  logoWrapper: {
    marginBottom: 20,
    zIndex: 2,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },

  brandName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: 'Sora_800ExtraBold',
    marginBottom: 2,
    textShadowColor: 'rgba(192,132,252,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    zIndex: 2,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(216,180,254,0.85)',
    letterSpacing: 0.8,
    fontFamily: 'Manrope_600SemiBold',
    textTransform: 'uppercase',
    marginBottom: 32,
    zIndex: 2,
  },

  calContainer: {
    position: 'relative',
    width: 190,
    height: 190,
    marginVertical: 16,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  calPulseBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 95,
    backgroundColor: 'transparent',
    shadowColor: 'rgba(168,85,247,0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 0,
  },
  calRing: {
    position: 'absolute',
    borderRadius: 95,
    borderWidth: 2.5,
  },
  calRingDot1: {
    position: 'absolute',
    top: -4,
    left: '50%',
    width: 10,
    height: 10,
    marginLeft: -5,
    borderRadius: 5,
    backgroundColor: '#c084fc',
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 0,
  },
  calCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  calLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'rgba(216,180,254,0.9)',
    fontFamily: 'Sora_700Bold',
    marginBottom: 2,
  },
  calValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Sora_800ExtraBold',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(192,132,252,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  calPercent: {
    fontSize: 15,
    fontWeight: '700',
    color: '#c084fc',
    fontFamily: 'Sora_700Bold',
  },

  dotRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c084fc',
    shadowColor: 'rgba(192,132,252,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 0,
  },

  fieldText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'rgba(216,180,254,0.7)',
    fontFamily: 'Sora_700Bold',
    marginTop: 8,
    zIndex: 2,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 36,
    paddingTop: 22,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(168,85,247,0.2)',
    width: '100%',
    zIndex: 2,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(216,180,254,0.6)',
    fontFamily: 'Manrope_500Medium',
    letterSpacing: 0.3,
  },
});
