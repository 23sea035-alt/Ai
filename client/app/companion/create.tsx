import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';

const PERSONALITIES = [
  { id: 'Analytical', quote: 'I will balance complex data analysis with a witty, engaging conversational style.' },
  { id: 'Empathetic', quote: 'I will listen deeply, reflect emotions, and offer compassionate perspectives.' },
  { id: 'Stoic', quote: 'I will remain calm, rational, and grounded in every interaction.' },
  { id: 'Playful', quote: 'I will infuse every conversation with wit, humor, and joyful curiosity.' },
  { id: 'Formal', quote: 'I will communicate with precision, respect, and elegant articulation.' },
];

const VOICES = [
  { id: 'nebula', label: 'Nebula (Alto)', sub: 'Smooth, resonant, and calm' },
  { id: 'titan', label: 'Titan (Bass)', sub: 'Deep, authoritative, rhythmic' },
];

function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 15000 + 8000,
      delay: Math.random() * 12000,
    }));
  }, []);

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
            toValue: -500,
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

function AmbientOrbs() {
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb1,
          {
            opacity: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }),
            transform: [{ scale: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb2,
          {
            opacity: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.8] }),
            transform: [{ scale: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
          },
        ]}
      />
    </>
  );
}

export default function CreateCompanionScreen() {
  const safeInsets = useSafeAreaInsets();
  const { addCompanion } = useApp();
  const [name, setName] = useState('Aurora');
  const [selectedPersonality, setSelectedPersonality] = useState('Analytical');
  const [selectedVoice, setSelectedVoice] = useState('nebula');
  const [isCommitting, setIsCommitting] = useState(false);

  const topPad = Platform.OS === 'web' ? 14 : safeInsets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 : safeInsets.bottom + 24;

  const personalityQuote = PERSONALITIES.find(p => p.id === selectedPersonality)?.quote ?? PERSONALITIES[0].quote;

  const handleCommit = () => {
    if (!name.trim()) return;
    setIsCommitting(true);
    setTimeout(() => {
      addCompanion({
        name: name.trim(),
        persona: selectedPersonality,
        traits: [selectedPersonality],
        colorFrom: '#8b5cf6',
        colorTo: '#c084fc',
        lastActive: 'Just created',
        lastMessage: 'Ready to meet you...',
      });
      setIsCommitting(false);
      router.back();
    }, 1800);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        locations={[0.2, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <AmbientOrbs />
      <Particles />

      <View style={[styles.containerInner, { paddingTop: topPad }]}>
        <View style={styles.mainHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Neural Forge</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.statusRow}>
            <View style={styles.syncBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.syncText}>Syncing · Live</Text>
            </View>
            <View style={styles.neuralBadge}>
              <Ionicons name="hardware-chip-outline" size={12} color="#d8b4fe" />
              <Text style={styles.neuralText}>Neural Core v2.4 Active</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>COMPANION NAME</Text>
            <TextInput
              style={styles.inputField}
              value={name}
              onChangeText={setName}
              placeholder="Enter name..."
              placeholderTextColor="rgba(216,180,254,0.5)"
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>PERSONALITY CORE</Text>
            <View style={styles.chipsContainer}>
              {PERSONALITIES.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.chip, selectedPersonality === p.id && styles.chipActive]}
                  onPress={() => setSelectedPersonality(p.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, selectedPersonality === p.id && styles.chipTextActive]}>
                    {p.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.quoteBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#c084fc" />
              <Text style={styles.quoteText}>{personalityQuote}</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>VOCAL FREQUENCY</Text>
            {VOICES.map(v => (
              <TouchableOpacity
                key={v.id}
                style={[styles.voiceOption, selectedVoice === v.id && styles.voiceOptionSelected]}
                onPress={() => setSelectedVoice(v.id)}
                activeOpacity={0.8}
              >
                <View style={styles.voiceInfo}>
                  <Text style={styles.voiceLabel}>{v.label}</Text>
                  <Text style={styles.voiceSub}>{v.sub}</Text>
                </View>
                <View style={[styles.radioCircle, selectedVoice === v.id && styles.radioCircleSelected]} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.commitBtn}
            onPress={handleCommit}
            disabled={isCommitting}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8b5cf6', '#a855f7']}
              style={styles.commitGrad}
            >
              <Ionicons
                name={isCommitting ? 'sync-outline' : 'checkmark-circle-outline'}
                size={18}
                color="#fff"
              />
              <Text style={styles.commitText}>
                {isCommitting ? 'Stabilizing neural weights...' : 'Commit Configuration'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.syncNote}>
            <Ionicons name="sync-outline" size={12} color="rgba(216,180,254,0.65)" />
            <Text style={styles.syncNoteText}>Syncing may take a few seconds to stabilize neural weights.</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  orb1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '60%',
    height: '60%',
    backgroundColor: '#c084fc',
    borderRadius: 1000,
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 120,
    elevation: 0,
  },
  orb2: {
    position: 'absolute',
    top: '30%',
    right: '-20%',
    width: '50%',
    height: '50%',
    backgroundColor: '#3b82f6',
    borderRadius: 1000,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 120,
    elevation: 0,
  },

  particleField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(192,132,252,0.8)',
  },

  containerInner: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 35, 0.45)',
    overflow: 'hidden',
    zIndex: 2,
  },

  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 30,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.5)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    fontFamily: 'Sora_700Bold',
  },
  headerPlaceholder: { width: 44 },

  scroll: { flex: 1, paddingHorizontal: 20 },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 40,
    borderWidth: 0.5,
    borderColor: 'rgba(52,211,153,0.4)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 0,
  },
  syncText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34d399',
    fontFamily: 'Manrope_700Bold',
  },
  neuralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139,92,246,0.4)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: 'rgba(192,132,252,0.5)',
  },
  neuralText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d8b4fe',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.3,
  },

  formCard: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 40,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(216,180,254,0.9)',
    fontFamily: 'Sora_700Bold',
    marginBottom: 10,
  },
  inputField: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.4)',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Manrope_600SemiBold',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    borderRadius: 60,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  chipActive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.3,
  },
  chipTextActive: {
    color: '#fff',
  },
  chipActiveBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
  },

  quoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(139,92,246,0.25)',
    borderLeftWidth: 4,
    borderLeftColor: '#c084fc',
    padding: 18,
    borderRadius: 28,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 21,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },

  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  voiceOptionSelected: {
    backgroundColor: 'rgba(139,92,246,0.35)',
    borderColor: '#c084fc',
  },
  voiceInfo: { flex: 1 },
  voiceLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Sora_800ExtraBold',
    marginBottom: 4,
  },
  voiceSub: {
    fontSize: 13,
    color: 'rgba(216,180,254,0.85)',
    fontFamily: 'Manrope_500Medium',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(216,180,254,0.6)',
  },
  radioCircleSelected: {
    backgroundColor: '#c084fc',
    borderColor: '#c084fc',
    shadowColor: 'rgba(192,132,252,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 0,
  },

  commitBtn: {
    borderRadius: 60,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 12,
    shadowColor: 'rgba(139,92,246,0.4)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 8,
  },
  commitGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  commitText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Sora_800ExtraBold',
  },

  syncNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  syncNoteText: {
    fontSize: 12,
    color: 'rgba(216,180,254,0.65)',
    fontFamily: 'Manrope_500Medium',
    letterSpacing: 0.3,
  },
});
