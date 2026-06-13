import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
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

const MOCK_MEMORIES = [
  { id: '1', companion: 'Aurora', content: 'User enjoys late-night creative sessions and feels most inspired during the full moon.', category: 'Preference', date: '2 days ago', color: '#c9bfff' },
  { id: '2', companion: 'Aurora', content: 'User\'s sister is named Mia and they have a close relationship.', category: 'Personal', date: '1 week ago', color: '#8fd8ff' },
  { id: '3', companion: 'Orion', content: 'User is working on a mobile app project and aims to launch in Q3 2026.', category: 'Goal', date: '3 days ago', color: '#ffb77d' },
  { id: '4', companion: 'Aurora', content: 'User practices morning meditation — usually 10-15 minutes.', category: 'Habit', date: '5 days ago', color: '#c9bfff' },
  { id: '5', companion: 'Lyra', content: 'User prefers science fiction over fantasy and loves Ursula K. Le Guin.', category: 'Preference', date: '1 week ago', color: '#917eff' },
  { id: '6', companion: 'Orion', content: 'User wants to improve their public speaking skills.', category: 'Goal', date: '2 weeks ago', color: '#8fd8ff' },
];

const CATEGORIES = ['All', 'Preference', 'Personal', 'Goal', 'Habit'];
const CATEGORY_COLORS: Record<string, string> = {
  Preference: '#c9bfff',
  Personal: '#8fd8ff',
  Goal: '#ffb77d',
  Habit: '#917eff',
};

export default function MemoryScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  const filtered = MOCK_MEMORIES.filter(m => {
    const matchSearch = m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.companion.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <View>
          <Text style={styles.eyebrow}>YOUR MIND</Text>
          <Text style={styles.headerTitle}>Memory Timeline</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{MOCK_MEMORIES.length}</Text>
          <Text style={styles.statLabel}>Memories</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <GlassCard style={styles.searchBar} radius={14}>
          <Ionicons name="search-outline" size={18} color="#928ea1" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search your memories..."
            placeholderTextColor="rgba(146,142,161,0.5)"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#928ea1" />
            </TouchableOpacity>
          ) : null}
        </GlassCard>
      </View>

      {/* Category chips */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}
        keyExtractor={(c) => c}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setActiveCategory(item)} activeOpacity={0.7}>
            <View
              style={[
                styles.chip,
                activeCategory === item && styles.chipActive,
              ]}
            >
              <Text style={[styles.chipText, activeCategory === item && styles.chipTextActive]}>
                {item}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Memory list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad, gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GlassCard style={styles.memoryCard} radius={16}>
            <View style={styles.memoryHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: (CATEGORY_COLORS[item.category] ?? '#c9bfff') + '18' }]}>
                <Text style={[styles.categoryText, { color: CATEGORY_COLORS[item.category] ?? '#c9bfff' }]}>
                  {item.category}
                </Text>
              </View>
              <Text style={styles.memoryDate}>{item.date}</Text>
            </View>
            <Text style={styles.memoryContent}>{item.content}</Text>
            <View style={styles.memoryFooter}>
              <View style={[styles.orbDot, { backgroundColor: item.color }]} />
              <Text style={styles.memoryCompanion}>via {item.companion}</Text>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="planet-outline" size={48} color="rgba(146,142,161,0.4)" />
            <Text style={styles.emptyTitle}>No memories found</Text>
            <Text style={styles.emptySub}>Start chatting to build your memory timeline</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
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
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  statBox: {
    backgroundColor: 'rgba(201,191,255,0.08)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#c9bfff',
  },
  statLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#928ea1',
    marginTop: 2,
  },
  searchWrapper: { paddingHorizontal: 20, paddingBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#dee1f9',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: 'rgba(201,191,255,0.15)',
    borderColor: 'rgba(201,191,255,0.35)',
  },
  chipText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#928ea1',
  },
  chipTextActive: { color: '#c9bfff' },
  memoryCard: { padding: 16, gap: 10 },
  memoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  categoryText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  memoryDate: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#928ea1',
  },
  memoryContent: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(222,225,249,0.85)',
    lineHeight: 21,
  },
  memoryFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orbDot: { width: 8, height: 8, borderRadius: 4 },
  memoryCompanion: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#928ea1',
  },
  emptyState: { alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    color: 'rgba(222,225,249,0.6)',
  },
  emptySub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(146,142,161,0.6)',
    textAlign: 'center',
  },
});
