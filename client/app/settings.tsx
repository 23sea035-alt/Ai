import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Alert,
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

import { useApp } from '@/context/AppContext';

const SETTINGS_SECTIONS: {
  header: string;
  items: { id: string; icon: string; label: string; sub: string; value?: string }[];
}[] = [
  {
    header: 'ACCOUNT MANAGEMENT',
    items: [
      { id: 'personal-info', icon: 'person-outline', label: 'Personal Information', sub: 'Name, email, profile details' },
      { id: 'security-password', icon: 'lock-closed-outline', label: 'Security & Password', sub: 'FaceID, 2FA, change password' },
      { id: 'subscriptions', icon: 'receipt-outline', label: 'Subscriptions', sub: 'Premium plan, billing history' },
    ],
  },
  {
    header: 'EXPERIENCE',
    items: [
      { id: 'theme', icon: 'color-palette-outline', label: 'Theme', sub: 'Dark Luminous · Cosmic Purple', value: 'Dark Luminous' },
      { id: 'voice', icon: 'mic-outline', label: 'Voice Settings', sub: 'Nova (Female) · Warm, Atmospheric', value: 'Nova' },
      { id: 'notifications', icon: 'notifications-outline', label: 'Notifications', sub: 'Daily insights, memory reminders' },
    ],
  },
  {
    header: 'PRIVACY & LEGAL',
    items: [
      { id: 'privacy-center', icon: 'shield-half-outline', label: 'Privacy Center', sub: 'Your data, encryption, exports' },
      { id: 'terms', icon: 'document-text-outline', label: 'Terms of Service', sub: 'Legal agreement, updates' },
    ],
  },
];

const SETTING_ACTIONS: Record<string, () => void> = {
  'personal-info': () => router.push('/edit-profile'),
  'security-password': () => router.push('/safety'),
  'subscriptions': () => router.push('/(tabs)/premium'),
  'theme': () => Alert.alert('Theme', 'Dark Luminous selected · More themes coming'),
  'voice': () => router.push('/voice-preferences'),
  'notifications': () => router.push('/notifications'),
  'privacy-center': () => router.push('/privacy'),
  'terms': () => router.push('/help'),
};

function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 15000 + 8000,
      delay: Math.random() * 12000,
    }));
  }, []);

  return (
    <View style={styles.particleField} pointerEvents="none">
      {particles.map((p) => <Particle key={p.id} config={p} />)}
    </View>
  );
}

function Particle({ config }: { config: { left: number; size: number; duration: number; delay: number } }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.6, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, {
            toValue: -500,
            duration: config.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: `${config.left}%`,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

function AmbientOrbs() {
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb1,
          {
            opacity: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }),
            transform: [{ scale: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb2,
          {
            opacity: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.8] }),
            transform: [{ scale: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
          },
        ]}
      />
    </>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const topPad = Platform.OS === 'web' ? 14 : insets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const userName = user?.name ?? 'Alex Rivera';

  const handleLogout = () => {
    Alert.alert(
      'Log out of Aura AI?',
      undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => { logout(); router.replace('/welcome'); },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        locations={[0.2, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <AmbientOrbs />
      <Particles />

      <Animated.View
        style={[
          styles.containerInner,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.mainHeader, { paddingTop: topPad }]}>
          <View style={styles.logoArea}>
            <View style={styles.logoTitle}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.92)" />
              </TouchableOpacity>
              <View style={styles.logoIcon}>
                <Ionicons name="pulse" size={22} color="#fff" />
              </View>
              <Text style={styles.appName}>Aura AI</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconCircle} activeOpacity={0.8} onPress={() => Alert.alert('Notifications', 'No new notifications · All quiet in the cosmos')}>
                <Ionicons name="notifications-outline" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle} activeOpacity={0.8} onPress={() => Alert.alert('Profile', `${userName} · Premium Companion`)}>
                <Ionicons name="person-circle-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.profileCard} activeOpacity={0.85}>
            <View style={styles.profileAvatar}>
              <Ionicons name="rocket-outline" size={34} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.premiumBadge}>
                <Ionicons name="diamond" size={11} color="#1e1b4b" /> Aura Premium Member · ∞ Synced
              </Text>
            </View>
          </TouchableOpacity>

          {SETTINGS_SECTIONS.map((section) => (
            <View key={section.header} style={styles.settingsSection}>
              <Text style={styles.sectionHeader}>{section.header}</Text>
              <View style={styles.settingsCard}>
                {section.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.settingItem}
                    activeOpacity={0.7}
                    onPress={SETTING_ACTIONS[item.id]}
                  >
                    <View style={styles.settingLeft}>
                      <View style={styles.settingIcon}>
                        <Ionicons name={item.icon as any} size={18} color="#c084fc" />
                      </View>
                      <View style={styles.settingText}>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        <Text style={styles.settingSub}>{item.sub}</Text>
                      </View>
                    </View>
                    <View style={styles.settingRight}>
                      {'value' in item && item.value ? (
                        <Text style={styles.settingValue}>{item.value}</Text>
                      ) : null}
                      <Ionicons name="chevron-forward" size={14} color="rgba(216,180,254,0.5)" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#f87171" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.versionFooter}>
            <Text style={styles.versionText}>Aura AI v2.4.0 (2024)</Text>
            <Text style={styles.versionTag}>
              <Ionicons name="sparkles" size={12} color="#c084fc" /> Made with Luminous Intelligence
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  orb1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '60%',
    height: '60%',
    backgroundColor: '#c084fc',
    borderRadius: 1000,
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 120,
    elevation: 0,
  },
  orb2: {
    position: 'absolute',
    top: '30%',
    right: '-20%',
    width: '50%',
    height: '50%',
    backgroundColor: '#3b82f6',
    borderRadius: 1000,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 120,
    elevation: 0,
  },

  particleField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(192,132,252,0.7)',
  },

  containerInner: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 35, 0.5)',
    overflow: 'hidden',
    zIndex: 2,
  },

  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  statusTime: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.2,
    fontFamily: 'Sora_600SemiBold',
  },
  statusIcons: { flexDirection: 'row', gap: 6, alignItems: 'center' },

  mainHeader: { paddingHorizontal: 24, paddingVertical: 8 },
  logoArea: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    backgroundColor: '#7c3aed',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: 'Sora_700Bold',
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

  scroll: { flex: 1, paddingHorizontal: 20 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderRadius: 40,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    backgroundColor: 'rgba(168,85,247,0.15)',
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
    fontFamily: 'Sora_800ExtraBold',
    marginBottom: 4,
  },
  premiumBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fbbf24',
    fontFamily: 'Manrope_600SemiBold',
  },

  settingsSection: { marginBottom: 28 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(216,180,254,0.8)',
    fontFamily: 'Sora_700Bold',
    marginBottom: 14,
    paddingLeft: 8,
  },
  settingsCard: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(168,85,247,0.2)',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 32,
    backgroundColor: 'rgba(139,92,246,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1 },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Sora_700Bold',
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 13,
    color: 'rgba(216,180,254,0.8)',
    fontFamily: 'Manrope_500Medium',
  },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d8b4fe',
    fontFamily: 'Manrope_600SemiBold',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.6)',
    borderRadius: 60,
    paddingVertical: 16,
    marginVertical: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f87171',
    fontFamily: 'Sora_800ExtraBold',
  },

  versionFooter: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(168,85,247,0.2)',
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(216,180,254,0.55)',
    fontFamily: 'Manrope_500Medium',
    letterSpacing: 0.3,
  },
  versionTag: {
    fontSize: 12,
    color: 'rgba(216,180,254,0.55)',
    fontFamily: 'Manrope_500Medium',
  },
});
