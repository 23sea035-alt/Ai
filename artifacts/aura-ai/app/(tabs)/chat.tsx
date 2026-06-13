import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
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

import { AuraOrb } from '@/components/AuraOrb';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';

export default function ChatHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { companions, messages } = useApp();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  const getLastMessage = (companionId: string) => {
    const msgs = messages[companionId];
    if (msgs && msgs.length > 0) {
      return msgs[msgs.length - 1].content;
    }
    return companions.find(c => c.id === companionId)?.lastMessage ?? 'Start a conversation...';
  };

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
        <Text style={styles.headerTitle}>Conversations</Text>
        <TouchableOpacity onPress={() => router.push('/companion/create')} style={styles.newBtn}>
          <Ionicons name="add" size={22} color="#c9bfff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <GlassCard style={styles.searchBar} radius={16}>
          <Ionicons name="search-outline" size={18} color="#928ea1" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companions..."
            placeholderTextColor="rgba(146,142,161,0.5)"
          />
        </GlassCard>
      </View>

      {/* List */}
      <FlatList
        data={companions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad, gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
            activeOpacity={0.8}
          >
            <GlassCard style={styles.chatItem} radius={18}>
              <AuraOrb size={52} colorFrom={item.colorFrom} colorTo={item.colorTo} pulsate={false} label={item.name[0]} />
              <View style={styles.chatInfo}>
                <View style={styles.chatInfoRow}>
                  <Text style={styles.chatName}>{item.name}</Text>
                  <Text style={styles.chatTime}>{item.lastActive ?? 'now'}</Text>
                </View>
                <Text style={styles.chatLast} numberOfLines={1}>
                  {getLastMessage(item.id)}
                </Text>
              </View>
              <View style={styles.chatArrow}>
                <Ionicons name="chevron-forward" size={16} color="rgba(201,196,216,0.4)" />
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="rgba(146,142,161,0.4)" />
            <Text style={styles.emptyTitle}>No companions yet</Text>
            <Text style={styles.emptySub}>Create your first AI companion to begin</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201,191,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,191,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: { paddingHorizontal: 20, paddingBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#dee1f9',
  },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  chatInfo: { flex: 1, gap: 4 },
  chatInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 15,
    color: '#dee1f9',
  },
  chatTime: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#928ea1',
  },
  chatLast: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(201,196,216,0.6)',
  },
  chatArrow: { paddingLeft: 4 },
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
