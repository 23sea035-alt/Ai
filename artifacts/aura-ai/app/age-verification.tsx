import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useApp } from '@/context/AppContext';

const PARTICLE_COUNT = 50;

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 14000 + 9000,
      delay: Math.random() * 12000,
    })),
  []);
  return (
    <View style={styles.particleField} pointerEvents="none">
      {particles.map((p) => <Particle key={p.id} config={p} />)}
    </View>
  );
}

function Particle({ config }: { config: { left: number; size: number; duration: number; delay: number } }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.7, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, {
            toValue: -700,
            duration: config.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: `${config.left}%`,
          bottom: -20,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

function AmbientOrb({ style, duration = 12000 }: { style?: any; duration?: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }),
          transform: [
            { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
          ],
        },
      ]}
    />
  );
}

function StaticGradient() {
  return (
    <LinearGradient
      colors={['#4c1d95', '#2e1065', '#0f172a']}
      locations={[0.2, 0.5, 1]}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

function Toast({ message, visible, isError }: { message: string; visible: boolean; isError?: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(anim, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: anim,
          transform: [
            { translateX: -100 },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          ],
          borderColor: isError ? 'rgba(255,107,107,0.6)' : 'rgba(168,85,247,0.6)',
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

export default function AgeVerificationScreen() {
  const { updateUser } = useApp();
  const [year, setYear] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastError, setToastError] = useState(false);
  const [loading, setLoading] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(15)).current;
  const titleOp = useRef(new Animated.Value(0)).current;
  const subAnim = useRef(new Animated.Value(15)).current;
  const subOp = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(15)).current;
  const inputOp = useRef(new Animated.Value(0)).current;
  const cbAnim = useRef(new Animated.Value(15)).current;
  const cbOp = useRef(new Animated.Value(0)).current;
  const protectAnim = useRef(new Animated.Value(15)).current;
  const protectOp = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(15)).current;
  const btnOp = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(15)).current;
  const footerOp = useRef(new Animated.Value(0)).current;

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const showToast = useCallback((msg: string, isError?: boolean) => {
    setToastMsg(msg);
    setToastError(!!isError);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2600);
  }, []);

  useFocusEffect(useCallback(() => {
    cardAnim.setValue(0);
    [titleAnim, subAnim, inputAnim, cbAnim, protectAnim, btnAnim, footerAnim].forEach(a => a.setValue(15));
    [titleOp, subOp, inputOp, cbOp, protectOp, btnOp, footerOp].forEach(a => a.setValue(0));

    Animated.timing(cardAnim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    const stagger = (anim: Animated.Value, op: Animated.Value, delay: number) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(op, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      }, delay);
    };
    stagger(titleAnim, titleOp, 80);
    stagger(subAnim, subOp, 150);
    stagger(inputAnim, inputOp, 220);
    stagger(cbAnim, cbOp, 290);
    stagger(protectAnim, protectOp, 360);
    stagger(btnAnim, btnOp, 430);
    stagger(footerAnim, footerOp, 500);
  }, []));

  const currentYear = new Date().getFullYear();
  const birthYearNum = parseInt(year, 10);

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleVerify = () => {
    if (!year.trim()) {
      showToast('❌ Please enter your birth year.', true);
      shakeInput();
      return;
    }
    const y = parseInt(year.trim(), 10);
    if (isNaN(y) || year.trim().length !== 4 || y < 1900 || y > currentYear) {
      showToast(`❌ Please enter a valid 4-digit birth year (1900–${currentYear}).`, true);
      shakeInput();
      return;
    }
    const age = currentYear - y;
    if (age < 18) {
      showToast('⚠️ You must be at least 18 years old to access the premium Aura experience.', true);
      shakeInput();
      return;
    }
    if (!isChecked) {
      showToast('⚠️ Please confirm that you are over 18 to continue.', true);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('✨ Verification successful! Welcome to Aura AI Premium.', false);
      const age2 = currentYear - y;
      updateUser({ birthYear: y, isMinor: age2 < 18, ageVerified: true });
      setTimeout(() => router.push('/ai-disclosure'), 800);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <StaticGradient />

      <AmbientOrb style={styles.orb1} />
      <AmbientOrb style={styles.orb2} duration={15000} />
      <AmbientOrb style={styles.orb3} duration={18000} />

      <View style={styles.gridPattern} pointerEvents="none" />
      <Particles />

      {toastVisible && <Toast message={toastMsg} visible={toastVisible} isError={toastError} />}

      <Animated.View
        style={[
          styles.glassCard,
          {
            opacity: cardAnim,
            transform: [
              { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
              { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
            ],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.logoArea}>
            <LinearGradient colors={['#c084fc', '#7c3aed']} style={styles.logoIcon}>
              <Ionicons name="bulb" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.appName}>Aura AI</Text>
          </View>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#34d399" />
            <Text style={styles.securityBadgeText}> Secure</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Animated.Text style={[styles.verificationTitle, { opacity: titleOp, transform: [{ translateY: titleAnim }] }]}>
            Security Verification
          </Animated.Text>
          <Animated.Text style={[styles.verificationSub, { opacity: subOp, transform: [{ translateY: subAnim }] }]}>
            Please confirm your age to continue to the premium Aura experience.
          </Animated.Text>

          <Animated.View style={[styles.inputGroup, { opacity: inputOp, transform: [{ translateY: inputAnim }] }]}>
            <Text style={styles.inputLabel}>BIRTH YEAR</Text>
            <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: shakeAnim }] }]}>
              <Ionicons name="calendar-outline" size={18} color="#c084fc" style={styles.inputIcon} />
              <TextInput
                style={styles.yearInput}
                value={year}
                onChangeText={(t) => {
                  const digits = t.replace(/[^0-9]/g, '');
                  if (digits.length <= 4) setYear(digits);
                }}
                placeholder="YYYY"
                placeholderTextColor="rgba(216,180,254,0.5)"
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="done"
              />
            </Animated.View>
          </Animated.View>

          <Animated.View style={{ opacity: cbOp, transform: [{ translateY: cbAnim }], width: '100%' }}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsChecked(!isChecked)}
              activeOpacity={0.8}
            >
              <View style={[styles.customCheckbox, isChecked && styles.customCheckboxChecked]}>
                {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>I am over 18</Text>
            </TouchableOpacity>
            <Text style={styles.checkboxSub}>Legal age confirmation</Text>
          </Animated.View>

          <Animated.View style={[styles.protectionCard, { opacity: protectOp, transform: [{ translateY: protectAnim }] }]}>
            <Ionicons name="shield-checkmark" size={16} color="#c084fc" />
            <Text style={styles.protectionText}>
              Minor Protection · We use advanced encryption to protect user identities. Providing false information is a violation of our safety protocols.
            </Text>
          </Animated.View>

          <Animated.View style={[styles.btnWrap, { opacity: btnOp, transform: [{ translateY: btnAnim }] }]}>
            <TouchableOpacity
              style={[styles.verifyBtn, loading && styles.verifyBtnLoading]}
              onPress={handleVerify}
              onPressIn={() => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start()}
              onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()}
              activeOpacity={0.9}
              disabled={loading}
            >
              <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%' }}>
                <LinearGradient
                  colors={['#8b5cf6', '#c084fc']}
                  style={styles.verifyBtnGrad}
                >
                  {loading ? (
                    <>
                      <Ionicons name="sync" size={18} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
                      <Text style={styles.verifyBtnText}>Verifying...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="lock-closed" size={18} color="#fff" />
                      <Text style={styles.verifyBtnText}>Complete Verification</Text>
                    </>
                  )}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.footer, { opacity: footerOp, transform: [{ translateY: footerAnim }] }]}>
            <Ionicons name="hardware-chip-outline" size={12} color="#c084fc" />
            <Text style={styles.footerText}>Secure by Aura Cryptography Engine 4.0</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },

  orb1: {
    position: 'absolute',
    top: -100, left: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(168,85,247,0.3)',
  },
  orb2: {
    position: 'absolute',
    bottom: -150, right: -150,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(168,85,247,0.25)',
  },
  orb3: {
    position: 'absolute',
    top: '40%', right: -80,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(168,85,247,0.15)',
  },

  gridPattern: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.3,
  },

  particleField: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden', zIndex: 1,
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(192,132,252,0.8)',
  },

  glassCard: {
    maxWidth: 420, width: '100%',
    backgroundColor: 'rgba(15, 12, 35, 0.5)',
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    overflow: 'hidden',
    zIndex: 2,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 35 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 15,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 40,
    borderWidth: 0.5,
    borderColor: 'rgba(52,211,153,0.4)',
  },
  securityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34d399',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    alignItems: 'flex-start',
  },

  verificationTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  verificationSub: {
    fontSize: 14,
    color: 'rgba(216,180,254,0.85)',
    marginBottom: 28,
    lineHeight: 20,
  },

  inputGroup: {
    width: '100%',
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'rgba(216,180,254,0.9)',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.4)',
    borderRadius: 34,
    paddingHorizontal: 18,
  },
  inputIcon: {
    marginRight: 12,
  },
  yearInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    paddingVertical: 16,
    fontVariant: ['tabular-nums'],
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 6,
  },
  customCheckbox: {
    width: 26, height: 26,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.5)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCheckboxChecked: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  checkboxSub: {
    fontSize: 12,
    color: 'rgba(216,180,254,0.7)',
    marginLeft: 40,
    marginBottom: 16,
  },

  protectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 28,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#c084fc',
  },
  protectionText: {
    fontSize: 13,
    color: 'rgba(216,180,254,0.85)',
    lineHeight: 19,
    flex: 1,
  },

  btnWrap: {
    width: '100%',
    marginTop: 12,
  },
  verifyBtn: {
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: 'rgba(139,92,246,0.4)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
  },
  verifyBtnLoading: {
    opacity: 0.85,
  },
  verifyBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  verifyBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    width: '100%',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(216,180,254,0.6)',
  },

  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(25,20,50,0.98)',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 100,
    borderWidth: 1,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 35,
    elevation: 20,
  },
  toastText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});
