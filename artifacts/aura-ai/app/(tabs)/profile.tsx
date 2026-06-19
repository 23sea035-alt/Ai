import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';

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

function PremiumGlow({ children }: { children: React.ReactNode }) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(168,85,247,0.7)', '#c084fc'],
  });

  return (
    <Animated.View style={[styles.upgradeCardOuter, { borderColor }]}>
      {children}
    </Animated.View>
  );
}

export default function ProfileScreen() {
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

  const userName = user?.name ?? 'Atheek';
  const userEmail = user?.email ?? 'ahmathatheeq@gmail.com';
  const userAvatarUri = user?.avatarUri;

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
        <View style={[styles.statusBar, { paddingTop: topPad }]}>
          <Text style={styles.statusTime}>9:41</Text>
          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={14} color="rgba(255,255,255,0.92)" />
            <Ionicons name="battery-full" size={16} color="rgba(255,255,255,0.92)" />
          </View>
        </View>

        <View style={styles.mainHeader}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconCircle} activeOpacity={0.8} onPress={() => router.push('/settings')}>
              <Ionicons name="options-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} activeOpacity={0.8} onPress={() => Alert.alert('More', 'Help, feedback, about')}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.profileCard} activeOpacity={0.85} onPress={() => router.push('/edit-profile')}>
            <LinearGradient
              colors={['#c084fc', '#7c3aed']}
              style={styles.profileAvatar}
            >
              {userAvatarUri ? (
                <Image source={{ uri: userAvatarUri }} style={{ width: 80, height: 80, borderRadius: 40 }} />
              ) : (
                <Ionicons name="rocket-outline" size={38} color="#fff" />
              )}
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileSub}>{userEmail} · @{userName?.toLowerCase().replace(/\s+/g, '')}</Text>
              <View style={styles.editProfileBtn}>
                <Ionicons name="pencil-outline" size={12} color="#fff" />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statNumber}>142</Text>
              <Text style={styles.statLabel}>Conversations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statNumber}>45</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.settingCard}
            activeOpacity={0.7}
            onPress={() => router.push('/settings')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="settings-outline" size={18} color="#c084fc" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Full Settings</Text>
                <Text style={styles.settingSub}>Account, security, experience & more</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={14} color="rgba(216,180,254,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            activeOpacity={0.7}
            onPress={() => router.push('/edit-profile')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="person-outline" size={18} color="#c084fc" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Personal Information</Text>
                <Text style={styles.settingSub}>Name, email, profile photo</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={14} color="rgba(216,180,254,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="notifications-outline" size={18} color="#c084fc" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingSub}>Daily insights, memory reminders</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={14} color="rgba(216,180,254,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            activeOpacity={0.7}
            onPress={() => router.push('/privacy')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="shield-half-outline" size={18} color="#c084fc" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Privacy Center</Text>
                <Text style={styles.settingSub}>Your data, encryption, exports</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={14} color="rgba(216,180,254,0.5)" />
          </TouchableOpacity>

          <PremiumGlow>
            <TouchableOpacity
              style={styles.upgradeCardInner}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/premium')}
            >
              <View style={styles.upgradeLeft}>
                <Ionicons name="diamond-outline" size={20} color="#fbbf24" />
                <View style={styles.upgradeText}>
                  <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
                  <Text style={styles.upgradeSub}>Unlock custom avatars, voice modes & more</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.upgradeBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/premium')}
              >
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </PremiumGlow>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={16} color="#f87171" />
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

  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  headerTitle: {
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
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: 40,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
    fontFamily: 'Sora_800ExtraBold',
    marginBottom: 2,
  },
  profileSub: {
    fontSize: 13,
    color: 'rgba(216,180,254,0.9)',
    fontFamily: 'Manrope_500Medium',
    marginBottom: 10,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(168,85,247,0.3)',
    borderWidth: 0.5,
    borderColor: 'rgba(168,85,247,0.5)',
    borderRadius: 40,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Manrope_600SemiBold',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 36,
    paddingVertical: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    fontFamily: 'Sora_800ExtraBold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(216,180,254,0.85)',
    marginTop: 4,
    fontFamily: 'Manrope_600SemiBold',
  },

  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
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
    fontSize: 12,
    color: 'rgba(216,180,254,0.8)',
    fontFamily: 'Manrope_500Medium',
  },

  upgradeCardOuter: {
    borderRadius: 36,
    borderWidth: 1.5,
    marginVertical: 20,
    overflow: 'hidden',
  },
  upgradeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 36,
    backgroundColor: 'rgba(139,92,246,0.35)',
  },
  upgradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  upgradeText: { flex: 1 },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fbbf24',
    fontFamily: 'Sora_800ExtraBold',
    marginBottom: 2,
  },
  upgradeSub: {
    fontSize: 12,
    color: 'rgba(216,180,254,0.9)',
    fontFamily: 'Manrope_500Medium',
  },
  upgradeBtn: {
    backgroundColor: '#fbbf24',
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  upgradeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e1b4b',
    fontFamily: 'Sora_800ExtraBold',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
    borderRadius: 60,
    paddingVertical: 14,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f87171',
    fontFamily: 'Sora_800ExtraBold',
  },

  versionFooter: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(168,85,247,0.2)',
    gap: 4,
  },
  versionText: {
    fontSize: 11,
    color: 'rgba(216,180,254,0.55)',
    fontFamily: 'Manrope_500Medium',
    letterSpacing: 0.3,
  },
  versionTag: {
    fontSize: 11,
    color: 'rgba(216,180,254,0.55)',
    fontFamily: 'Manrope_500Medium',
  },
});
