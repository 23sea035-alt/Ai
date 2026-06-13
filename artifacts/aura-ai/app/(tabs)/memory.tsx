import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { GradientBorder } from '@/components/GradientBorder';
import { ParticleField } from '@/components/ParticleField';

const MOCK_MEMORIES = [
  { id: '1', companion: 'Aurora', content: 'User enjoys late-night creative sessions and feels most inspired during the full moon.', category: 'Preference', date: '2 days ago', color: '#c9bfff', icon: '🌙' },
  { id: '2', companion: 'Aurora', content: "User's sister is named Mia and they have a close relationship.", category: 'Personal', date: '1 week ago', color: '#8fd8ff', icon: '👥' },
  { id: '3', companion: 'Orion', content: 'User is working on a mobile app project and aims to launch in Q3 2026.', category: 'Goal', date: '3 days ago', color: '#ffb77d', icon: '🎯' },
  { id: '4', companion: 'Aurora', content: 'User practices morning meditation — usually 10–15 minutes.', category: 'Habit', date: '5 days ago', color: '#4ade80', icon: '🧘' },
  { id: '5', companion: 'Lyra', content: 'User prefers science fiction over fantasy and loves Ursula K. Le Guin.', category: 'Preference', date: '1 week ago', color: '#917eff', icon: '📚' },
  { id: '6', companion: 'Orion', content: 'User wants to improve their public speaking skills.', category: 'Goal', date: '2 weeks ago', color: '#ff8fb0', icon: '🎤' },
];

const CATEGORIES = ['All', 'Preference', 'Personal', 'Goal', 'Habit'];
const CATEGORY_META: Record<string, { color: string; icon: string }> = {
  All: { color: '#dee1f9', icon: '🌌' },
  Preference: { color: '#c9bfff', icon: '💜' },
  Personal: { color: '#8fd8ff', icon: '💙' },
  Goal: { color: '#ffb77d', icon: '🎯' },
  Habit: { color: '#4ade80', icon: '🌱' },
};

function MemoryCard({ item, index }: { item: typeof MOCK_MEMORIES[0]; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 480,
      delay: index * 65,
      easing: Easing.out(Easing.back(1.05)),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
        ],
      }}
    >
      <GradientBorder
        colors={[item.color + 'aa', item.color + '30', 'rgba(255,255,255,0.06)']}
        radius={18}
        borderWidth={1.5}
        innerStyle={styles.memoryInner}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: item.color }]} />
        <View style={styles.memoryBody}>
          <View style={styles.memoryHeader}>
            <View style={[styles.categoryChip, { backgroundColor: item.color + '20' }]}>
              <Text style={{ fontSize: 11 }}>{item.icon}</Text>
              <Text style={[styles.categoryText, { color: item.color }]}>{item.category}</Text>
            </View>
            <Text style={styles.memoryDate}>{item.date}</Text>
          </View>
          <Text style={styles.memoryContent}>{item.content}</Text>
          <View style={styles.memoryFooter}>
            <View style={[styles.companionDot, { backgroundColor: item.color }]} />
            <Text style={styles.memoryCompanion}>via {item.companion}</Text>
          </View>
        </View>
      </GradientBorder>
    </Animated.View>
  );
}

export default function MemoryScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const headerFade = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const filtered = MOCK_MEMORIES.filter(m => {
    const matchSearch = m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.companion.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060a18', '#0B1020', '#0e1530', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ParticleField count={14} />
      <View style={styles.glowTop} />

      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: topInset, opacity: headerFade }]}>
        <View>
          <Text style={styles.eyebrow}>YOUR MIND</Text>
          <Text style={styles.headerTitle}>Memory Timeline</Text>
        </View>
        <GradientBorder
          colors={['#c9bfff', '#8fd8ff']}
          radius={14}
          borderWidth={1.5}
          innerStyle={styles.statBoxInner}
        >
          <Text style={styles.statNum}>{MOCK_MEMORIES.length}</Text>
          <Text style={styles.statLabel}>saved</Text>
        </GradientBorder>
      </Animated.View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <GradientBorder
          colors={['rgba(201,191,255,0.35)', 'rgba(143,216,255,0.2)', 'rgba(201,191,255,0.15)']}
          radius={16}
          borderWidth={1.5}
          innerStyle={styles.searchInner}
        >
          <Ionicons name="search-outline" size={17} color="#928ea1" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search your memories…"
            placeholderTextColor="rgba(146,142,161,0.45)"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={17} color="#928ea1" />
            </TouchableOpacity>
          ) : null}
        </GradientBorder>
      </View>

      {/* Category chips */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 14 }}
        keyExtractor={(c) => c}
        renderItem={({ item }) => {
          const isActive = activeCategory === item;
          const meta = CATEGORY_META[item];
          return (
            <TouchableOpacity onPress={() => setActiveCategory(item)} activeOpacity={0.7}>
              {isActive ? (
                <GradientBorder
                  colors={[meta.color + 'cc', meta.color + '55']}
                  radius={999}
                  borderWidth={1.5}
                  innerStyle={styles.chipActiveInner}
                >
                  <Text style={styles.chipIconSmall}>{meta.icon}</Text>
                  <Text style={[styles.chipText, { color: meta.color }]}>{item}</Text>
                </GradientBorder>
              ) : (
                <View style={styles.chip}>
                  <Text style={styles.chipIconSmall}>{meta.icon}</Text>
                  <Text style={styles.chipTextInactive}>{item}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Memory list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad, gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => <MemoryCard item={item} index={index} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <GradientBorder colors={['#c9bfff44', '#8fd8ff22']} radius={40} borderWidth={1.5}>
              <View style={styles.emptyOrb}>
                <Text style={{ fontSize: 32 }}>🧠</Text>
              </View>
            </GradientBorder>
            <Text style={styles.emptyTitle}>No memories found</Text>
            <Text style={styles.emptySub}>Start chatting to build your memory timeline</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(143,216,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  eyebrow: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: '#8fd8ff',
    letterSpacing: 2.5,
    marginBottom: 3,
  },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 26,
    color: '#dee1f9',
    letterSpacing: -0.4,
  },
  statBoxInner: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  statNum: { fontFamily: 'Sora_700Bold', fontSize: 22, color: '#c9bfff' },
  statLabel: { fontFamily: 'Manrope_400Regular', fontSize: 10, color: '#928ea1' },
  searchWrapper: { paddingHorizontal: 20, paddingBottom: 12 },
  searchInner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#dee1f9',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActiveInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipIconSmall: { fontSize: 12 },
  chipText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13 },
  chipTextInactive: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#928ea1' },
  memoryInner: { flexDirection: 'row', overflow: 'hidden' },
  accentBar: { width: 3, borderRadius: 2, marginRight: 14, marginVertical: 4, marginLeft: 4 },
  memoryBody: { flex: 1, paddingVertical: 14, paddingRight: 14, gap: 10 },
  memoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, letterSpacing: 0.4 },
  memoryDate: { fontFamily: 'Manrope_400Regular', fontSize: 11, color: '#928ea1' },
  memoryContent: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(222,225,249,0.88)',
    lineHeight: 21,
  },
  memoryFooter: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  companionDot: { width: 7, height: 7, borderRadius: 3.5 },
  memoryCompanion: { fontFamily: 'Manrope_500Medium', fontSize: 12, color: '#928ea1' },
  emptyState: { alignItems: 'center', gap: 14, paddingTop: 80 },
  emptyOrb: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 18, color: 'rgba(222,225,249,0.65)' },
  emptySub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(146,142,161,0.55)',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
});
