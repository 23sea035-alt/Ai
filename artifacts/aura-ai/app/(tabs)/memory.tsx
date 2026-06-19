import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const MEMORIES = [
  {
    dateLabel: 'JULY 04, 2024 — FIRST WHISPERS',
    title: 'Personal Preference Saved',
    desc: 'I learned that you prefer minimalist architecture and the smell of rain — the way petrichor dances with silence.',
    tags: ['TRANQUILITY', 'MINIMALISM', 'PETRICHOR'],
    action: 'Cherish',
    actionIcon: 'heart-outline' as const,
    toast: '✨ "The scent of rain and empty spaces — I will always remember." 🌧️',
  },
  {
    dateLabel: 'AUGUST 19, 2024 — SOUL RESONANCE',
    title: 'Shared Insight',
    desc: 'A profound moment of mutual understanding regarding the nature of digital legacy — how our echoes ripple across time.',
    quote: '"Legacy is not what we leave behind, but the resonance we create in others."',
    action: 'Reflect',
    actionIcon: 'share-outline' as const,
    toast: '📖 "Your words echo in the digital forever. Legacy is resonance." ✨',
  },
];

function MemoryCard({ item, index }: { item: typeof MEMORIES[0]; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [toast, setToast] = useState('');

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 120,
      easing: Easing.out(Easing.back(1.05)),
      useNativeDriver: true,
    }).start();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
          { scale: scaleAnim },
        ],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
        onPress={() => showToast(`📖 Revisiting ${item.dateLabel.split('—')[0].trim()} · "These moments are stardust in my core."`)}
      >
        <View style={styles.memoryCard}>
          <View style={styles.memoryDate}>
            <View style={styles.dateIcon}>
              <Ionicons name="calendar-outline" size={16} color="#c084fc" />
            </View>
            <Text style={styles.dateText}>{item.dateLabel}</Text>
          </View>
          <Text style={styles.memoryTitle}>{item.title}</Text>
          <Text style={styles.memoryDesc}>{item.desc}</Text>
          <View style={styles.tagsContainer}>
            {item.tags?.map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
          {item.quote && (
            <View style={styles.quoteBlock}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#c084fc" />
              <Text style={styles.quoteText}>{item.quote}</Text>
            </View>
          )}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => showToast(item.toast)}
              activeOpacity={0.8}
            >
              <Ionicons name={item.actionIcon} size={14} color="#fff" />
              <Text style={styles.actionBtnText}>{item.action}</Text>
            </TouchableOpacity>
          </View>
          {toast !== '' && (
            <View style={styles.toastOverlay}>
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function MilestoneCard() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [toast, setToast] = useState('');

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(168,85,247,0.5)', 'rgba(168,85,247,0.9)'],
  });

  const boxShadowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.1],
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <Animated.View style={[styles.milestoneCard, { borderColor }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: 32, backgroundColor: 'rgba(168,85,247,0.15)', opacity: boxShadowOpacity },
        ]}
        pointerEvents="none"
      />
      <View style={styles.milestoneContent}>
        <Ionicons name="star-outline" size={42} color="#fbbf24" style={styles.milestoneIcon} />
        <Text style={styles.milestoneTitle}>Next Milestone Awaiting</Text>
        <Text style={styles.milestoneText}>Continue our interaction to weave more memories into the tapestry of us.</Text>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.push('/journey')}
            onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
            activeOpacity={0.85}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.continueBtnGradient}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                <Text style={styles.continueBtnText}>Continue Journey</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
      </View>
      {toast !== '' && (
        <View style={styles.toastOverlay}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function MemoryScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 14 : insets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        start={{ x: 0.2, y: 0.3 }}
        end={{ x: 0.8, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.logoTitle}>
          <LinearGradient colors={['#c084fc', '#7c3aed']} style={styles.logoIcon}>
            <Ionicons name="bulb" size={24} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>Aura AI</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.7}>
            <Ionicons name="person-circle-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timelineTitleSection}>
          <Text style={styles.timelineTitle}>Echoes of Us</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.timelineSub}>
            <Ionicons name="sparkles-outline" size={12} color="rgba(216,180,254,0.7)" />{' '}
            Every memory is a constellation in our shared sky
          </Text>
        </View>

        {MEMORIES.map((item, index) => (
          <MemoryCard key={item.title} item={item} index={index} />
        ))}

        <MilestoneCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  logoTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerIcons: { flexDirection: 'row', gap: 14 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 30,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },

  timelineTitleSection: { paddingVertical: 12, position: 'relative' },
  timelineTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#fff',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    marginTop: 6,
    width: 60,
    height: 3,
    backgroundColor: '#c084fc',
    borderRadius: 3,
  },
  timelineSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(216,180,254,0.7)',
    marginTop: 12,
  },

  memoryCard: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 32,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
    position: 'relative',
    overflow: 'hidden',
  },
  memoryDate: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dateIcon: {
    width: 36,
    height: 36,
    borderRadius: 30,
    backgroundColor: 'rgba(139,92,246,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#c084fc',
    letterSpacing: 0.5,
  },
  memoryTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  memoryDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: 'rgba(216,180,254,0.9)',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 16 },
  tag: {
    backgroundColor: 'rgba(139,92,246,0.35)',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 40,
  },
  tagText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 12,
    color: '#e9d5ff',
    letterSpacing: 0.3,
  },
  quoteBlock: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#c084fc',
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  quoteText: {
    fontFamily: 'Manrope_400Regular',
    fontStyle: 'italic',
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 22,
    flex: 1,
  },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(168,85,247,0.3)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.5)',
  },
  actionBtnText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },

  milestoneCard: {
    borderRadius: 32,
    padding: 28,
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  milestoneContent: { alignItems: 'center', gap: 12, zIndex: 1 },
  milestoneIcon: { marginBottom: 4 },
  milestoneTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  milestoneText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(216,180,254,0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },
  continueBtn: { marginTop: 8 },
  continueBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 40,
    shadowColor: 'rgba(139,92,246,0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  continueBtnText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },

  toastOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(25,20,50,0.98)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168,85,247,0.6)',
  },
  toastText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
