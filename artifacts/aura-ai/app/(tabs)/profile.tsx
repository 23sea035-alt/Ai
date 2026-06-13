import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
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

const MENU_SECTIONS = [
  {
    title: 'My Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', route: null },
      { icon: 'notifications-outline', label: 'Notifications', route: null },
      { icon: 'lock-closed-outline', label: 'Privacy & Security', route: null },
    ],
  },
  {
    title: 'App',
    items: [
      { icon: 'mic-outline', label: 'Voice Settings', route: '/voice-call' },
      { icon: 'settings-outline', label: 'Settings', route: '/settings' },
      { icon: 'shield-checkmark-outline', label: 'Safety Center', route: null },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help & Support', route: null },
      { icon: 'star-outline', label: 'Rate Aura AI', route: null },
      { icon: 'share-social-outline', label: 'Invite Friends', route: null },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, companions } = useApp();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  const handleLogout = () => {
    logout();
    router.replace('/welcome');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={[styles.profileHeader, { paddingTop: topInset + 8 }]}>
          <View style={styles.avatarWrapper}>
            <AuraOrb size={80} colorFrom="#c9bfff" colorTo="#8fd8ff" pulsate label={user?.name?.[0]?.toUpperCase() ?? 'A'} />
            {user?.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color="#1a0063" />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{user?.name ?? 'Your Name'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? 'your@email.com'}</Text>
          {user?.isPremium ? (
            <View style={styles.premiumRow}>
              <Ionicons name="star-sharp" size={14} color="#ffb77d" />
              <Text style={styles.premiumLabel}>Premium Member</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push('/(tabs)/premium')}>
              <View style={styles.upgradeChip}>
                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard} radius={16}>
            <Text style={styles.statNum}>{companions.length}</Text>
            <Text style={styles.statLabel}>Companions</Text>
          </GlassCard>
          <GlassCard style={styles.statCard} radius={16}>
            <Text style={styles.statNum}>6</Text>
            <Text style={styles.statLabel}>Memories</Text>
          </GlassCard>
          <GlassCard style={styles.statCard} radius={16}>
            <Text style={styles.statNum}>850</Text>
            <Text style={styles.statLabel}>Aura Pts</Text>
          </GlassCard>
        </View>

        {/* Menu sections */}
        <View style={styles.menuWrapper}>
          {MENU_SECTIONS.map((section) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.title}</Text>
              <GlassCard style={styles.menuCard} radius={18}>
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.menuItem,
                      idx < section.items.length - 1 && styles.menuItemBorder,
                    ]}
                    onPress={() => item.route && router.push(item.route as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconBox}>
                        <Ionicons name={item.icon as any} size={18} color="#c9bfff" />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="rgba(201,196,216,0.3)" />
                  </TouchableOpacity>
                ))}
              </GlassCard>
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <GlassCard style={styles.logoutCard} radius={16}>
              <Ionicons name="log-out-outline" size={20} color="#ffb4ab" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </GlassCard>
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.versionText}>Aura AI v1.0.0 — Luminous Intelligence</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  profileHeader: { alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 20 },
  avatarWrapper: { position: 'relative' },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffb77d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#dee1f9',
    letterSpacing: -0.2,
  },
  profileEmail: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.6)',
  },
  premiumRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  premiumLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#ffb77d',
  },
  upgradeChip: {
    backgroundColor: 'rgba(201,191,255,0.1)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(201,191,255,0.25)',
  },
  upgradeText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#c9bfff',
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 4 },
  statCard: { flex: 1, padding: 14, alignItems: 'center', gap: 4 },
  statNum: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: '#dee1f9',
  },
  statLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#928ea1',
  },
  menuWrapper: { paddingHorizontal: 20, gap: 16 },
  menuSection: { gap: 8 },
  menuSectionTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: 'rgba(146,142,161,0.8)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  menuCard: { overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(201,191,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: '#dee1f9',
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  logoutText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    color: '#ffb4ab',
  },
  versionText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: 'rgba(146,142,161,0.4)',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
