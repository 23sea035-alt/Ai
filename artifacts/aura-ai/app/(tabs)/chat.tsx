import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
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

import { CompanionAvatar } from '@/components/CompanionAvatar';
import { GlassCard } from '@/components/GlassCard';
import { ParticleField } from '@/components/ParticleField';
import { Companion, useApp } from '@/context/AppContext';

function AnimatedChatRow({ item, index, onPress }: { item: Companion; index: number; onPress: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 70,
      easing: Easing.out(Easing.back(1.05)),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
        ],
      }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <GlassCard style={styles.chatItem} radius={18}>
          <CompanionAvatar
            seed={item.name}
            size={52}
            colorFrom={item.colorFrom}
            colorTo={item.colorTo}
            pulsate={false}
            showOnlineIndicator={index === 0}
          />
          <View style={styles.chatInfo}>
            <View style={styles.chatInfoRow}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatTime}>{item.lastActive ?? 'now'}</Text>
            </View>
            <Text style={styles.chatLast} numberOfLines={1}>
              {item.lastMessage ?? 'Start a conversation...'}
            </Text>
          </View>
          <View style={styles.chatRight}>
            {index === 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>3</Text></View>}
            <Ionicons name="chevron-forward" size={15} color="rgba(201,196,216,0.3)" />
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ChatHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { companions, messages } = useApp();
  const headerFade = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const getLastMessage = (companionId: string) => {
    const msgs = messages[companionId];
    if (msgs && msgs.length > 0) return msgs[msgs.length - 1].content;
    return companions.find((c) => c.id === companionId)?.lastMessage ?? 'Start a conversation...';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060a18', '#0B1020', '#121A35', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ParticleField count={12} />

      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: topInset, opacity: headerFade }]}>
        <View>
          <Text style={styles.headerTitle}>Conversations</Text>
          <Text style={styles.headerSub}>{companions.length} companions</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/companion/create')} style={styles.newBtn}>
          <Ionicons name="add" size={22} color="#c9bfff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <GlassCard style={styles.searchBar} radius={16}>
          <Ionicons name="search-outline" size={17} color="#928ea1" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companions..."
            placeholderTextColor="rgba(146,142,161,0.5)"
          />
          <View style={styles.searchMic}>
            <Ionicons name="mic-outline" size={16} color="#928ea1" />
          </View>
        </GlassCard>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {['All', 'Active', 'Favorites'].map((f, i) => (
          <TouchableOpacity key={f} activeOpacity={0.75}>
            <View style={[styles.filterChip, i === 0 && styles.filterChipActive]}>
              <Text style={[styles.filterText, i === 0 && styles.filterTextActive]}>{f}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={companions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad, gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <AnimatedChatRow
            item={item}
            index={index}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyOrb}>
              <Ionicons name="chatbubbles-outline" size={36} color="rgba(201,191,255,0.4)" />
            </View>
            <Text style={styles.emptyTitle}>No companions yet</Text>
            <Text style={styles.emptySub}>Create your first AI companion to begin your journey</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/companion/create')}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#c9bfff', '#8fd8ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtnGrad}>
                <Text style={styles.emptyBtnText}>Create Companion</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 26,
    color: '#dee1f9',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#928ea1',
    marginTop: 2,
  },
  newBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(201,191,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,191,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: { paddingHorizontal: 20, paddingBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#dee1f9',
  },
  searchMic: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(201,191,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(201,191,255,0.15)',
    borderColor: 'rgba(201,191,255,0.35)',
  },
  filterText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#928ea1',
  },
  filterTextActive: { color: '#c9bfff' },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  chatInfo: { flex: 1, gap: 5 },
  chatInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 15,
    color: '#dee1f9',
  },
  chatTime: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#928ea1',
  },
  chatLast: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(201,196,216,0.55)',
  },
  chatRight: { alignItems: 'center', gap: 6 },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#c9bfff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: '#1a0063',
  },
  emptyState: { alignItems: 'center', gap: 14, paddingTop: 80 },
  emptyOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(201,191,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(201,191,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    color: 'rgba(222,225,249,0.7)',
  },
  emptySub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(146,142,161,0.6)',
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 20,
  },
  emptyBtn: { borderRadius: 999, overflow: 'hidden', marginTop: 6 },
  emptyBtnGrad: { paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 15,
    color: '#1a0063',
  },
});
