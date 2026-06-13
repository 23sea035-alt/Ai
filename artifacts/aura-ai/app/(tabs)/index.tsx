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

import { AuraOrb } from '@/components/AuraOrb';
import { CompanionAvatar } from '@/components/CompanionAvatar';
import { GlassCard } from '@/components/GlassCard';
import { ParticleField } from '@/components/ParticleField';
import { useApp } from '@/context/AppContext';

const QUICK_ACTIONS = [
  { icon: 'planet-outline', color: '#8fd8ff', label: 'Memory', sub: '12 new links', route: '/memory' },
  { icon: 'star-outline', color: '#ffb77d', label: 'Rewards', sub: '850 Aura pts', route: '/premium' },
  { icon: 'mic-outline', color: '#c9bfff', label: 'Voice', sub: 'Start call', route: '/voice-call' },
  { icon: 'add-circle-outline', color: '#917eff', label: 'New', sub: 'Companion', route: '/companion/create' },
];

const STATS = [
  { label: 'Sessions', value: '142', icon: '💬' },
  { label: 'Memories', value: '38', icon: '🧠' },
  { label: 'Aura Pts', value: '850', icon: '✨' },
];

function useStaggeredEnter(count: number, baseDelay = 100) {
  const anims = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;
  useEffect(() => {
    anims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 550,
        delay: baseDelay + i * 80,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }).start();
    });
  }, []);
  return anims;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, companions } = useApp();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const heroPulse = useRef(new Animated.Value(1)).current;

  const sectionAnims = useStaggeredEnter(5, 200);
  const statAnims = useStaggeredEnter(3, 400);
  const quickAnims = useStaggeredEnter(4, 600);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(heroPulse, {
          toValue: 1.04,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(heroPulse, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const featured = companions[0];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060a18', '#0B1020', '#121A35', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ParticleField count={16} />
      <View style={styles.ambientLeft} pointerEvents="none" />
      <View style={styles.ambientRight} pointerEvents="none" />

      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: topInset, opacity: headerFade }]}>
        <View style={styles.headerLeft}>
          <AuraOrb size={36} colorFrom="#c9bfff" colorTo="#8fd8ff" pulsate={false} label={user?.name?.[0]?.toUpperCase() ?? 'A'} />
          <Text style={styles.logoText}>Aura AI</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#dee1f9" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color="#dee1f9" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad, gap: 22 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Welcome greeting */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: sectionAnims[0],
              transform: [{ translateY: sectionAnims[0].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}
        >
          <Text style={styles.greetingLabel}>{greeting()}</Text>
          <Text style={styles.welcomeName}>Hello, {user?.name ?? 'Friend'}.</Text>
          <Text style={styles.welcomeSub}>Your AI companions are ready for you.</Text>
        </Animated.View>

        {/* Stats row */}
        <Animated.View
          style={[
            styles.statsSection,
            {
              opacity: sectionAnims[1],
              transform: [{ translateY: sectionAnims[1].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}
        >
          {STATS.map((stat, i) => (
            <Animated.View
              key={stat.label}
              style={{
                flex: 1,
                opacity: statAnims[i],
                transform: [{ scale: statAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
              }}
            >
              <GlassCard style={styles.statCard} radius={16}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </GlassCard>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Featured Companion Hero */}
        {featured && (
          <Animated.View
            style={[
              { paddingHorizontal: 20 },
              {
                opacity: sectionAnims[2],
                transform: [{ translateY: sectionAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: featured.id } })}
            >
              <GlassCard style={styles.heroCard} radius={24} glowColor={featured.colorFrom} shimmer>
                <LinearGradient
                  colors={[featured.colorFrom + '18', featured.colorTo + '10', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.heroLeft}>
                  <View style={[styles.heroTag, { backgroundColor: featured.colorFrom + '20' }]}>
                    <Text style={[styles.heroTagText, { color: featured.colorFrom }]}>FEATURED</Text>
                  </View>
                  <Text style={styles.heroName}>{featured.name}</Text>
                  <Text style={styles.heroPersona} numberOfLines={2}>{featured.persona}</Text>
                  <View style={styles.heroCta}>
                    <Text style={styles.heroCtaText}>Chat Now</Text>
                    <Ionicons name="arrow-forward" size={14} color="#c9bfff" />
                  </View>
                </View>
                <Animated.View style={{ transform: [{ scale: heroPulse }] }}>
                  <CompanionAvatar
                    seed={featured.name}
                    size={88}
                    colorFrom={featured.colorFrom}
                    colorTo={featured.colorTo}
                    pulsate
                  />
                </Animated.View>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Recent Companions */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: sectionAnims[3],
              transform: [{ translateY: sectionAnims[3].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}
        >
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
            {companions.slice(0, 4).map((c, i) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: c.id } })}
                activeOpacity={0.8}
              >
                <GlassCard style={styles.companionCard} radius={20}>
                  <CompanionAvatar
                    seed={c.name}
                    size={56}
                    colorFrom={c.colorFrom}
                    colorTo={c.colorTo}
                    pulsate={i === 0}
                    showOnlineIndicator={i === 0}
                  />
                  <Text style={styles.companionName}>{c.name}</Text>
                  <Text style={styles.companionTime}>{c.lastActive}</Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
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
        </Animated.View>

        {/* Daily Insight */}
        <Animated.View
          style={[
            { paddingHorizontal: 20 },
            {
              opacity: sectionAnims[4],
              transform: [{ translateY: sectionAnims[4].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}
        >
          <View style={styles.insightBorder}>
            <GlassCard style={styles.insightCard} radius={20}>
              <View style={styles.ambientInsight} pointerEvents="none" />
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles" size={14} color="#c9bfff" />
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
                  <Ionicons name="share-outline" size={13} color="#928ea1" />
                  <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((a, i) => (
              <Animated.View
                key={a.label}
                style={{
                  width: '47%',
                  opacity: quickAnims[i],
                  transform: [{ scale: quickAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }],
                }}
              >
                <TouchableOpacity
                  onPress={() => router.push(a.route as any)}
                  activeOpacity={0.8}
                >
                  <GlassCard style={styles.quickCard} radius={20}>
                    <View style={[styles.quickIconBox, { backgroundColor: a.color + '18' }]}>
                      <Ionicons name={a.icon as any} size={22} color={a.color} />
                    </View>
                    <Text style={styles.quickLabel}>{a.label}</Text>
                    <Text style={styles.quickSub}>{a.sub}</Text>
                  </GlassCard>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* FAB */}
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
        <View style={styles.fabGlow} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  ambientLeft: {
    position: 'absolute',
    top: '25%',
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(201,191,255,0.07)',
  },
  ambientRight: {
    position: 'absolute',
    bottom: '15%',
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(143,216,255,0.04)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(6,10,24,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  headerRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#c9bfff',
    borderWidth: 1.5,
    borderColor: '#060a18',
  },
  scroll: { flex: 1 },
  section: { gap: 12 },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { fontSize: 18 },
  statValue: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#928ea1',
    letterSpacing: 0.5,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    overflow: 'hidden',
  },
  heroLeft: { flex: 1, gap: 8, paddingRight: 12 },
  heroTag: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  heroTagText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 9,
    letterSpacing: 2.5,
  },
  heroName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  heroPersona: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(201,196,216,0.7)',
    lineHeight: 19,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  heroCtaText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#c9bfff',
  },
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
    marginTop: 18,
  },
  welcomeName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 30,
    color: '#dee1f9',
    letterSpacing: -0.4,
    paddingHorizontal: 20,
  },
  welcomeSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.65)',
    paddingHorizontal: 20,
  },
  companionScroll: { marginHorizontal: -20 },
  companionCard: {
    width: 122,
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
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(201,191,255,0.07)',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightMeta: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: 'rgba(201,196,216,0.65)',
    letterSpacing: 1.5,
  },
  insightQuote: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 17,
    color: '#dee1f9',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  insightBody: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.65)',
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
    padding: 16,
    gap: 8,
  },
  quickIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'visible',
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#c9bfff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
});
