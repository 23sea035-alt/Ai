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

import { CompanionAvatar } from '@/components/CompanionAvatar';
import { GlassCard } from '@/components/GlassCard';
import { GradientBorder } from '@/components/GradientBorder';
import { ParticleField } from '@/components/ParticleField';
import { useApp } from '@/context/AppContext';

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', route: null, color: '#c9bfff', bg: '#c9bfff' },
      { icon: 'notifications-outline', label: 'Notifications', route: null, color: '#ffb77d', bg: '#ffb77d' },
      { icon: 'lock-closed-outline', label: 'Privacy & Security', route: null, color: '#4ade80', bg: '#4ade80' },
    ],
  },
  {
    title: 'App',
    items: [
      { icon: 'mic-outline', label: 'Voice Settings', route: '/voice-call', color: '#8fd8ff', bg: '#8fd8ff' },
      { icon: 'settings-outline', label: 'Settings', route: '/settings', color: '#B388FF', bg: '#B388FF' },
      { icon: 'shield-checkmark-outline', label: 'Safety Center', route: null, color: '#ff8fb0', bg: '#ff8fb0' },
    ],
  },
  {
    title: 'Community',
    items: [
      { icon: 'help-circle-outline', label: 'Help & Support', route: null, color: '#60a5fa', bg: '#60a5fa' },
      { icon: 'star-outline', label: 'Rate Aura AI', route: null, color: '#ffd700', bg: '#ffd700' },
      { icon: 'share-social-outline', label: 'Invite Friends', route: null, color: '#4ade80', bg: '#4ade80' },
    ],
  },
];

const STAT_COLORS = ['#c9bfff', '#8fd8ff', '#ffb77d'];
const STAT_ICONS = ['🤖', '🧠', '✨'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, companions } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const statsAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const menuAnims = useRef(MENU_SECTIONS.map(() => new Animated.Value(0))).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    statsAnims.forEach((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 500, delay: 300 + i * 80, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }).start()
    );
    menuAnims.forEach((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 500, delay: 500 + i * 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
    );
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/welcome');
  };

  const STATS = [
    { label: 'Companions', value: String(companions.length), icon: STAT_ICONS[0] },
    { label: 'Memories', value: '38', icon: STAT_ICONS[1] },
    { label: 'Aura Pts', value: '850', icon: STAT_ICONS[2] },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060a18', '#0B1020', '#121A35', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ParticleField count={12} />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <Animated.View
          style={[
            styles.profileHeader,
            { paddingTop: topInset + 12, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Avatar with gradient border */}
          <GradientBorder
            colors={['#c9bfff', '#8fd8ff', '#B388FF']}
            radius={56}
            borderWidth={2.5}
            style={styles.avatarBorder}
          >
            <View style={styles.avatarInner}>
              <CompanionAvatar
                seed={user?.name ?? 'User'}
                size={88}
                colorFrom="#c9bfff"
                colorTo="#8fd8ff"
                pulsate
              />
            </View>
          </GradientBorder>

          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <LinearGradient colors={['#ffd87a', '#ffb77d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.premiumBadgeGrad}>
                <Ionicons name="star" size={10} color="#3a1a00" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </LinearGradient>
            </View>
          )}

          <Text style={styles.profileName}>{user?.name ?? 'Your Name'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? 'your@email.com'}</Text>

          {user?.isPremium ? (
            <View style={styles.premiumRow}>
              <Ionicons name="star-sharp" size={13} color="#ffb77d" />
              <Text style={styles.premiumLabel}>Premium Member</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push('/(tabs)/premium')} activeOpacity={0.8}>
              <GradientBorder colors={['#c9bfff', '#8fd8ff']} radius={999} borderWidth={1.5} innerStyle={styles.upgradeInner}>
                <Text style={styles.upgradeText}>✦ Upgrade to Premium</Text>
              </GradientBorder>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <Animated.View
              key={s.label}
              style={[
                styles.statWrapper,
                {
                  opacity: statsAnims[i],
                  transform: [{ scale: statsAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
                },
              ]}
            >
              <GradientBorder
                colors={[STAT_COLORS[i] + 'cc', STAT_COLORS[i] + '44']}
                radius={18}
                borderWidth={1.5}
                innerStyle={styles.statInner}
              >
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statNum, { color: STAT_COLORS[i] }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </GradientBorder>
            </Animated.View>
          ))}
        </View>

        {/* Menu sections */}
        <View style={styles.menuWrapper}>
          {MENU_SECTIONS.map((section, si) => (
            <Animated.View
              key={section.title}
              style={[
                styles.menuSection,
                {
                  opacity: menuAnims[si],
                  transform: [{ translateY: menuAnims[si].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
                },
              ]}
            >
              <Text style={styles.menuSectionTitle}>{section.title}</Text>
              <GradientBorder
                colors={['rgba(201,191,255,0.3)', 'rgba(143,216,255,0.15)', 'rgba(201,191,255,0.1)']}
                radius={20}
                borderWidth={1}
                innerStyle={{ overflow: 'hidden' }}
              >
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.menuItem,
                      idx < section.items.length - 1 && styles.menuItemBorder,
                    ]}
                    onPress={() => item.route && router.push(item.route as any)}
                    activeOpacity={0.65}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={[styles.menuIconBox, { backgroundColor: item.bg + '22' }]}>
                        <LinearGradient
                          colors={[item.color + 'cc', item.color + '88']}
                          style={StyleSheet.absoluteFillObject}
                        />
                        <Ionicons name={item.icon as any} size={18} color={item.color} />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color="rgba(201,196,216,0.25)" />
                  </TouchableOpacity>
                ))}
              </GradientBorder>
            </Animated.View>
          ))}

          {/* Sign Out */}
          <GradientBorder
            colors={['rgba(255,100,90,0.4)', 'rgba(255,100,90,0.15)']}
            radius={18}
            borderWidth={1}
          >
            <TouchableOpacity onPress={handleLogout} style={styles.logoutInner} activeOpacity={0.7}>
              <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255,100,90,0.15)' }]}>
                <Ionicons name="log-out-outline" size={18} color="#ff6b6b" />
              </View>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </GradientBorder>

          <Text style={styles.versionText}>Aura AI v1.0.0 · Luminous Intelligence</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTop: {
    position: 'absolute',
    top: -80,
    left: '20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201,191,255,0.07)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: '20%',
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(143,216,255,0.04)',
  },
  profileHeader: { alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 24 },
  avatarBorder: { alignItems: 'center', justifyContent: 'center' },
  avatarInner: { padding: 4 },
  premiumBadge: {
    marginTop: -8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  premiumBadgeGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  premiumBadgeText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: '#3a1a00',
    letterSpacing: 1.5,
  },
  profileName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: '#dee1f9',
    letterSpacing: -0.3,
    marginTop: 4,
  },
  profileEmail: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(201,196,216,0.55)',
  },
  premiumRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  premiumLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#ffb77d' },
  upgradeInner: { paddingHorizontal: 20, paddingVertical: 10 },
  upgradeText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#c9bfff',
    letterSpacing: 0.3,
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 8 },
  statWrapper: { flex: 1 },
  statInner: { padding: 14, alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 18 },
  statNum: { fontFamily: 'Sora_700Bold', fontSize: 20, letterSpacing: -0.3 },
  statLabel: { fontFamily: 'Manrope_400Regular', fontSize: 11, color: '#928ea1' },
  menuWrapper: { paddingHorizontal: 20, gap: 18 },
  menuSection: { gap: 8 },
  menuSectionTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    color: 'rgba(146,142,161,0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  menuItemLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: '#dee1f9',
  },
  logoutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logoutText: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, color: '#ff8b8b' },
  versionText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: 'rgba(146,142,161,0.35)',
    textAlign: 'center',
    paddingVertical: 8,
    letterSpacing: 0.5,
  },
});
