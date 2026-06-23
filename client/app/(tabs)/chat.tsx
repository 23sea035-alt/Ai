import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
import { COLORS, FONTS, SPACING } from '@/constants/theme';

const CHATS = [
  { name: 'New AI', avatar: '✨', gradient: ['#f97316', '#ef4444'] as const, preview: "Let's start something amazing together... I'm ready to explore your ideas.", time: 'Now', category: 'new', badge: 'NEW' },
  { name: 'Lyra', avatar: '🎵', gradient: ['#ec4899', '#be185d'] as const, preview: "I've analyzed your sleep patterns and found interesting correlations with your creativity peaks.", time: '5m ago', category: 'active' },
  { name: 'Zen', avatar: '🌿', gradient: ['#10b981', '#047857'] as const, preview: 'Your digital garden is blooming with 12 new insights today. Shall we review them?', time: '12m ago', category: 'active' },
  { name: 'Echo', avatar: '🔊', gradient: ['#06b6d4', '#0891b2'] as const, preview: "The summary of the philosophy lecture is ready. Key takeaway: 'Perception shapes reality.'", time: '1h ago', category: 'active' },
  { name: 'Atlas', avatar: '🗺️', gradient: ['#8b5cf6', '#6d28d9'] as const, preview: 'I have located the coordinates you mentioned. The energy signature is remarkable.', time: '2h ago', category: 'active' },
  { name: 'Vara', avatar: '💫', gradient: ['#f59e0b', '#d97706'] as const, preview: "That project sounds fascinating! Let's brainstorm some surreal concepts together.", time: '3h ago', category: 'active' },
];

function ChatRow({ item, index, onPress }: { item: typeof CHATS[0]; index: number; onPress: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 50,
      easing: Easing.out(Easing.back(1.05)),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
          { scale: scaleAnim },
        ],
      }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.chatItem}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
      >
        <LinearGradient colors={item.gradient} style={styles.avatarChat}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </LinearGradient>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatPreview} numberOfLines={1}>{item.preview}</Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.chatTime}>{item.time}</Text>
          {item.badge && (
            <LinearGradient colors={['#f97316', '#ef4444']} style={styles.badgeNew}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </LinearGradient>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ChatHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === 'web' ? 14 : insets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const filtered = CHATS.filter(c => {
    if (currentFilter === 'new' && c.category !== 'new') return false;
    if (currentFilter === 'active' && c.category !== 'active') return false;
    if (search.trim() !== '') {
      return c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.preview.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const chips = [
    { label: 'All', filter: 'all', icon: 'compass-outline' as const },
    { label: 'New AI', filter: 'new', icon: 'sparkles-outline' as const },
    { label: 'Active', filter: 'active', icon: 'chatbubbles-outline' as const },
  ];

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

      <View style={styles.searchWrapper}>
        <View style={styles.searchInner}>
          <Ionicons name="search" size={16} style={styles.searchIcon} color="rgba(216,180,254,0.7)" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations..."
            placeholderTextColor="rgba(216,180,254,0.55)"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <Animated.View
            style={[
              styles.searchGlow,
              { opacity: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
            ]}
            pointerEvents="none"
          />
        </View>
      </View>

      <View style={styles.chipsSection}>
        {chips.map(chip => {
          const isActive = currentFilter === chip.filter;
          return (
            <TouchableOpacity
              key={chip.filter}
              onPress={() => setCurrentFilter(chip.filter)}
              activeOpacity={0.8}
              style={{ borderRadius: 40, overflow: 'hidden' }}
            >
              {isActive ? (
                <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.chipActive}>
                  <Ionicons name={chip.icon} size={12} color="#fff" />
                  <Text style={[styles.chipText, styles.chipTextActive]}>{chip.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.chip}>
                  <Ionicons name={chip.icon} size={12} color="#f0e6ff" />
                  <Text style={styles.chipText}>{chip.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{
          paddingHorizontal: SPACING.containerMargin,
          paddingBottom: bottomPad,
          gap: 14,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <ChatRow
            item={item}
            index={index}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.name.toLowerCase() } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={56} color="rgba(168,85,247,0.5)" />
            <Text style={styles.emptyTitle}>No conversations found</Text>
            <Text style={styles.emptySub}>Try a different search or filter</Text>
          </View>
        }
      />
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168,85,247,0.2)',
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

  searchWrapper: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  searchInner: { position: 'relative' },
  searchGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 44,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  searchIcon: { position: 'absolute', left: 20, top: 20, zIndex: 1 },
  searchInput: {
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.35)',
    borderRadius: 44,
    paddingHorizontal: 52,
    height: 52,
    fontSize: 16,
    fontFamily: 'Manrope_500Medium',
    color: '#fff',
  },

  chipsSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(168,85,247,0.18)',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
  },
  chipActive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  chipText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#f0e6ff',
    letterSpacing: 0.3,
  },
  chipTextActive: {
    color: '#fff',
  },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 28,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
  },
  avatarChat: {
    width: 58,
    height: 58,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28 },
  chatInfo: { flex: 1, gap: 6 },
  chatName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 17,
    color: '#fff',
    letterSpacing: -0.3,
  },
  chatPreview: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(216,180,254,0.75)',
    lineHeight: 18,
  },
  chatMeta: { alignItems: 'flex-end', gap: 6 },
  chatTime: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: 'rgba(216,180,254,0.55)',
  },
  badgeNew: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 30,
  },
  badgeText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.5,
  },

  emptyState: { alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    color: 'rgba(222,225,249,0.65)',
  },
  emptySub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(146,142,161,0.55)',
    textAlign: 'center',
  },
});
