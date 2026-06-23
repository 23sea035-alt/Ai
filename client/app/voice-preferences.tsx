import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VOICES = [
  { name: 'Nebula (Alto)', desc: 'Smooth, resonant, and calm' },
  { name: 'Titan (Bass)', desc: 'Deep, authoritative, rhythmic' },
  { name: 'Aurora (Soprano)', desc: 'Light, airy, inspiring' },
  { name: 'Echo (Tenor)', desc: 'Warm, narratorial, engaging' },
];

function VoiceRow({ item, index, selected, onSelect }: { item: typeof VOICES[0]; index: number; selected: boolean; onSelect: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: 200 + index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) },
        ],
      }}
    >
      <TouchableOpacity
        style={[styles.voiceCard, selected && styles.voiceCardActive]}
        activeOpacity={0.85}
        onPress={onSelect}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
      >
        <Animated.View style={[styles.voiceCardInner, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={selected ? ['#8b5cf6', '#a855f7'] : ['rgba(168,85,247,0.08)', 'rgba(168,85,247,0.08)']}
            style={styles.voiceIcon}
          >
            <Ionicons name="musical-note" size={22} color={selected ? '#fff' : '#c084fc'} />
          </LinearGradient>
          <View style={styles.voiceInfo}>
            <Text style={[styles.voiceName, selected && { color: '#c084fc' }]}>{item.name}</Text>
            <Text style={styles.voiceDesc}>{item.desc}</Text>
          </View>
          {selected && (
            <Ionicons name="checkmark-circle" size={24} color="#c084fc" />
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function VoicePreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = React.useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const topPad = Platform.OS === 'web' ? 14 : insets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.05)), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        start={{ x: 0.2, y: 0.3 }}
        end={{ x: 0.8, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <LinearGradient colors={['#c084fc', '#7c3aed']} style={styles.logoIcon}>
          <Ionicons name="bulb" size={20} color="#fff" />
        </LinearGradient>
        <Text style={styles.appName}>Aura AI</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: bottomPad, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.titleRow}>
            <Ionicons name="mic-outline" size={24} color="#c084fc" />
            <Text style={styles.title}>Voice Preferences</Text>
          </View>
          <Text style={styles.subtitle}>Choose the voice that resonates with your soul.</Text>

          <View style={styles.voiceList}>
            {VOICES.map((v, i) => (
              <VoiceRow key={v.name} item={v} index={i} selected={selected === i} onSelect={() => setSelected(i)} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 30,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#fff',
    letterSpacing: -0.5,
    flex: 1,
  },

  content: { paddingTop: 12, gap: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(216,180,254,0.7)',
    lineHeight: 21,
  },

  voiceList: { gap: 14, marginTop: 8 },
  voiceCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
    backgroundColor: 'rgba(168,85,247,0.08)',
    overflow: 'hidden',
  },
  voiceCardActive: {
    borderColor: 'rgba(168,85,247,0.6)',
  },
  voiceCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  voiceIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceInfo: { flex: 1, gap: 2 },
  voiceName: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  voiceDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(216,180,254,0.7)',
  },
});
