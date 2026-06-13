import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraOrb } from '@/components/AuraOrb';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';

const QUICK_ACTIONS = [
  { icon: 'planet-outline', color: '#8fd8ff', label: 'Memory', sub: '12 new links', route: '/memory' },
  { icon: 'star-outline', color: '#ffb77d', label: 'Rewards', sub: '850 Aura pts', route: '/premium' },
  { icon: 'mic-outline', color: '#c9bfff', label: 'Voice', sub: 'Start call', route: '/voice-call' },
  { icon: 'add-circle-outline', color: '#917eff', label: 'New', sub: 'Companion', route: '/companion/create' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, companions } = useApp();
  const scrollY = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.ambientLeft} pointerEvents="none" />
      <View style={styles.ambientRight} pointerEvents="none" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <View style={styles.headerLeft}>
          <AuraOrb size={38} colorFrom="#c9bfff" colorTo="#8fd8ff" pulsate={false} label={user?.name?.[0]?.toUpperCase() ?? 'A'} />
          <LinearGradient
            colors={['#c9bfff', '#8fd8ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>Aura AI</Text>
          </LinearGradient>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={22} color="#dee1f9" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color="#dee1f9" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad, gap: 24 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Welcome */}
        <View style={styles.section}>
          <Text style={styles.greetingLabel}>{greeting()}</Text>
          <Text style={styles.welcomeName}>Hello, {user?.name ?? 'Friend'}.</Text>
          <Text style={styles.welcomeSub}>Your AI companions are ready for you.</Text>
        </View>

        {/* Recent Companions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Chats</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.companionScroll}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingVertical: 4 }}
          >
            {companions.slice(0, 4).map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: c.id } })}
                activeOpacity={0.8}
              >
                <GlassCard style={styles.companionCard} radius={20}>
                  <AuraOrb size={56} colorFrom={c.colorFrom} colorTo={c.colorTo} pulsate label={c.name[0]} />
                  <Text style={styles.companionName}>{c.name}</Text>
                  <Text style={styles.companionTime}>{c.lastActive}</Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
            {/* Add new */}
            <TouchableOpacity onPress={() => router.push('/companion/create')} activeOpacity={0.8}>
              <GlassCard style={[styles.companionCard, styles.addCard]} radius={20}>
                <View style={styles.addIcon}>
                  <Ionicons name="add" size={24} color="#c9bfff" />
                </View>
                <Text style={styles.companionName}>New</Text>
                <Text style={styles.companionTime}>Create</Text>
              </GlassCard>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Daily Insight */}
        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          <Text style={styles.sectionTitle}>Daily Insight</Text>
          <View style={styles.insightBorder}>
            <GlassCard style={styles.insightCard} radius={20}>
              <View style={styles.ambientInsight} pointerEvents="none" />
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles" size={16} color="#c9bfff" />
                <Text style={styles.insightMeta}>GENERATED BY AURORA</Text>
              </View>
              <Text style={styles.insightQuote}>
                "Creativity is the residue of time{'\n'}wasted beautifully."
              </Text>
              <Text style={styles.insightBody}>
                Based on your recent sessions, today is ideal for divergent thinking. Shall we explore some new concepts together?
              </Text>
              <View style={styles.insightActions}>
                <TouchableOpacity
                  style={styles.chipBtn}
                  onPress={() => router.push({ pathname: '/chat/[id]', params: { id: 'aurora' } })}
                >
                  <Text style={styles.chipText}>Discuss This</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareBtn}>
                  <Ionicons name="share-outline" size={14} color="#928ea1" />
                  <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.8}
              >
                <GlassCard style={styles.quickCard} radius={20}>
                  <View style={[styles.quickIconBox, { backgroundColor: a.color + '15' }]}>
                    <Ionicons name={a.icon as any} size={22} color={a.color} />
                  </View>
                  <Text style={styles.quickLabel}>{a.label}</Text>
                  <Text style={styles.quickSub}>{a.sub}</Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* FAB - Voice */}
      <TouchableOpacity
        style={[styles.fab, { bottom: bottomPad - 20 }]}
        onPress={() => router.push('/voice-call')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#c9bfff', '#8fd8ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="mic" size={26} color="#1a0063" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  ambientLeft: {
    position: 'absolute',
    top: '30%',
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201,191,255,0.07)',
  },
  ambientRight: {
    position: 'absolute',
    bottom: '20%',
    right: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(143,216,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(14,19,35,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoGradient: { borderRadius: 4 },
  logoText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: 'transparent',
    paddingHorizontal: 0,
  },
  headerRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  sectionTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 17,
    color: '#dee1f9',
    paddingHorizontal: 20,
  },
  viewAll: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#c9bfff',
  },
  greetingLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#8fd8ff',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  welcomeName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#dee1f9',
    letterSpacing: -0.3,
    paddingHorizontal: 20,
  },
  welcomeSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.7)',
    paddingHorizontal: 20,
  },
  companionScroll: { marginHorizontal: -20 },
  companionCard: {
    width: 120,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  companionName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#dee1f9',
  },
  companionTime: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#928ea1',
  },
  addCard: { alignItems: 'center', justifyContent: 'center' },
  addIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(201,191,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(201,191,255,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBorder: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,191,255,0.2)',
  },
  insightCard: { padding: 20, gap: 12 },
  ambientInsight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(201,191,255,0.08)',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightMeta: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: 'rgba(201,196,216,0.7)',
    letterSpacing: 1.5,
  },
  insightQuote: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 17,
    color: '#dee1f9',
    lineHeight: 25,
    letterSpacing: -0.2,
  },
  insightBody: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.7)',
    lineHeight: 21,
  },
  insightActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chipBtn: {
    backgroundColor: 'rgba(201,191,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,191,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#c9bfff',
  },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shareText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#928ea1',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: '47%',
    padding: 16,
    gap: 8,
  },
  quickIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#dee1f9',
  },
  quickSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#928ea1',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    shadowColor: '#c9bfff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
