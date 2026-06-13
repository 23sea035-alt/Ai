import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraOrb } from '@/components/AuraOrb';
import { GlassCard } from '@/components/GlassCard';

const WAVEFORM_BARS = 24;

export default function VoiceCallScreen() {
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [duration, setDuration] = useState(0);
  const waveAnims = useRef(Array.from({ length: WAVEFORM_BARS }, () => new Animated.Value(0.2))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const animateWaveform = () => {
    waveAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 30),
          Animated.timing(anim, {
            toValue: 0.3 + Math.random() * 0.7,
            duration: 200 + Math.random() * 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 200,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const handleMic = () => {
    if (callState === 'idle' || callState === 'speaking') {
      setCallState('listening');
      setIsListening(true);
      animateWaveform();
      if (!timerRef.current) {
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      }
    } else {
      setCallState('speaking');
      setIsListening(false);
      waveAnims.forEach((a) =>
        Animated.timing(a, { toValue: 0.2, duration: 300, useNativeDriver: true }).start()
      );
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#080d1d', '#0B1020', '#121A35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Ambient glows */}
      <View style={styles.ambientPurple} pointerEvents="none" />
      <View style={styles.ambientBlue} pointerEvents="none" />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={handleEnd} style={styles.topBtn}>
          <Ionicons name="chevron-down" size={24} color="#dee1f9" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Voice Call</Text>
        <TouchableOpacity style={styles.topBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#dee1f9" />
        </TouchableOpacity>
      </View>

      {/* Main orb */}
      <View style={styles.orbSection}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <AuraOrb size={200} colorFrom="#c9bfff" colorTo="#8fd8ff" pulsate />
        </Animated.View>
        <Text style={styles.companionName}>Aurora</Text>
        <Text style={styles.callStatus}>
          {callState === 'idle' && 'Tap mic to begin'}
          {callState === 'listening' && 'Listening...'}
          {callState === 'speaking' && 'Aurora is speaking...'}
        </Text>
        {duration > 0 && <Text style={styles.duration}>{formatDuration(duration)}</Text>}
      </View>

      {/* Waveform */}
      <View style={styles.waveformArea}>
        <GlassCard style={styles.waveformCard} radius={20}>
          <View style={styles.waveform}>
            {waveAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    backgroundColor: i % 3 === 0 ? '#c9bfff' : i % 3 === 1 ? '#8fd8ff' : '#B388FF',
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.waveformLabel}>
            {isListening ? 'Voice detected' : 'Tap mic to speak'}
          </Text>
        </GlassCard>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: bottomPad + 24 }]}>
        <TouchableOpacity style={styles.controlBtn}>
          <GlassCard style={styles.controlCard} radius={999}>
            <Ionicons name="volume-mute-outline" size={24} color="#dee1f9" />
          </GlassCard>
          <Text style={styles.controlLabel}>Mute</Text>
        </TouchableOpacity>

        {/* Big mic button */}
        <View style={styles.micWrapper}>
          <TouchableOpacity
            onPress={handleMic}
            activeOpacity={0.85}
            style={styles.micButtonOuter}
          >
            <LinearGradient
              colors={isListening ? ['#ffb77d', '#ff8c4b'] : ['#c9bfff', '#8fd8ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.micButton}
            >
              <Ionicons
                name={isListening ? 'mic' : 'mic-outline'}
                size={32}
                color="#1a0063"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.controlBtn} onPress={handleEnd}>
          <GlassCard style={[styles.controlCard, styles.endCallCard]} radius={999}>
            <Ionicons name="call" size={24} color="#ffb4ab" />
          </GlassCard>
          <Text style={[styles.controlLabel, { color: '#ffb4ab' }]}>End</Text>
        </TouchableOpacity>
      </View>

      {/* AI disclosure */}
      <GlassCard style={[styles.disclosureBanner, { bottom: bottomPad + 100 }]} radius={12}>
        <Ionicons name="information-circle-outline" size={14} color="#8fd8ff" />
        <Text style={styles.disclosureText}>AI companion — not a real person</Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080d1d' },
  ambientPurple: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201,191,255,0.07)',
  },
  ambientBlue: {
    position: 'absolute',
    bottom: '20%',
    right: '5%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(143,216,255,0.05)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 17,
    color: '#dee1f9',
  },
  orbSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  companionName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  callStatus: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.7)',
    letterSpacing: 0.3,
  },
  duration: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#8fd8ff',
    letterSpacing: 2,
  },
  waveformArea: { paddingHorizontal: 20, marginBottom: 16 },
  waveformCard: { padding: 16, alignItems: 'center', gap: 10 },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 40 },
  waveBar: {
    width: 3,
    height: 32,
    borderRadius: 2,
    opacity: 0.8,
  },
  waveformLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#928ea1',
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  controlBtn: { alignItems: 'center', gap: 8 },
  controlCard: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  endCallCard: { backgroundColor: 'rgba(255,180,171,0.1)' },
  controlLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#928ea1',
  },
  micWrapper: { alignItems: 'center' },
  micButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#c9bfff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  micButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclosureBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  disclosureText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: 'rgba(143,216,255,0.7)',
    letterSpacing: 0.3,
  },
});
