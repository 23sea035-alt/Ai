import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/theme';

const QUOTES = [
  '"Creativity is the residue of time wasted beautifully."',
  '"Imagination is the only weapon in the war with reality."',
  '"Do not go where the path may lead, go instead where there is no path and leave a trail."',
  '"You can\'t use up creativity. The more you use, the more you have."',
  '"The creative adult is the child who survived."',
  '"Art washes away from the soul the dust of everyday life."',
];

const INSIGHT_MESSAGES = [
  "Based on your morning meditation and deep work session, today is an ideal day for divergent thinking. Shall we explore some new concepts for your project?",
  "Divergent thinking: try morphing abstract concepts into visual poetry.",
  "How about blending sonic landscapes with your project's core idea?",
  "The residue of creativity can lead to unexpected breakthroughs. Brainstorm with colors.",
  "Your deep work session suggests exploring non-linear storytelling.",
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 8;
  const topPad = Platform.OS === 'web' ? 14 : insets.top + 6;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [insightMsg, setInsightMsg] = useState(INSIGHT_MESSAGES[0]);
  const [memoryLinks, setMemoryLinks] = useState(12);
  const [auraPoints, setAuraPoints] = useState(850);

  const auroraScale = useRef(new Animated.Value(1)).current;
  const orionScale = useRef(new Animated.Value(1)).current;
  const memoryScale = useRef(new Animated.Value(1)).current;
  const rewardScale = useRef(new Animated.Value(1)).current;
  const discussScale = useRef(new Animated.Value(1)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const pressScale = useCallback((anim: Animated.Value) => ({
    onPressIn: () => Animated.spring(anim, { toValue: 0.96, useNativeDriver: true, friction: 8 }).start(),
    onPressOut: () => Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }).start(),
  }), []);

  const handleDiscuss = () => {
    router.push({ pathname: '/chat/[id]', params: { id: 'aurora' } });
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `${quote}\n\n— ${insightMsg}` });
    } catch {}
  };

  const handleDoubleQuote = useCallback(() => {
    const newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(newQuote);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#5b21b6', '#2e1065', '#0f172a']}
        start={{ x: 0.3, y: 0.4 }}
        end={{ x: 0.7, y: 0.6 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.ambientGlow} pointerEvents="none" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 80, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.header, { paddingTop: topPad }]}>
            <View style={styles.logoArea}>
              <LinearGradient colors={['#a855f7', '#3b82f6']} style={styles.logoIcon}>
                <Ionicons name="bulb" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.appName}>Aura AI</Text>
            </View>
            <TouchableOpacity
              style={styles.profileTrigger}
              onPress={() => setDropdownVisible(!dropdownVisible)}
              activeOpacity={0.7}
            >
              <Ionicons name="person-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {dropdownVisible && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setDropdownVisible(false); router.push('/(tabs)/profile'); }}>
                <Ionicons name="id-card-outline" size={18} color="#fff" />
                <Text style={styles.dropdownText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setDropdownVisible(false); router.push('/settings'); }}>
                <Ionicons name="settings-outline" size={18} color="#fff" />
                <Text style={styles.dropdownText}>Settings</Text>
              </TouchableOpacity>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setDropdownVisible(false); }}>
                <Ionicons name="log-out-outline" size={18} color="#fff" />
                <Text style={styles.dropdownText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.connectionsSection}>
            <Text style={styles.sectionLabel}>
              <Ionicons name="git-network-outline" size={12} color="rgba(216,180,254,0.8)" /> CONNECTIONS · LIVE
            </Text>

            <Animated.View style={{ transform: [{ scale: auroraScale }] }}>
              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: 'aurora' } })}
                {...pressScale(auroraScale)}
                activeOpacity={0.85}
              >
                <View style={styles.contactInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarEmoji}>✨</Text>
                  </View>
                  <View>
                    <Text style={styles.contactName}>Aurora</Text>
                    <Text style={styles.contactStatus}>
                      <View style={styles.activeDot} />
                      Active Now
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="rgba(216,180,254,0.5)" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: orionScale }] }}>
              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: 'orion' } })}
                {...pressScale(orionScale)}
                activeOpacity={0.85}
              >
                <View style={styles.contactInfo}>
                  <View style={[styles.avatar, styles.avatarOrion]}>
                    <Text style={styles.avatarEmoji}>🌌</Text>
                  </View>
                  <View>
                    <Text style={styles.contactName}>Orion</Text>
                    <Text style={[styles.contactStatus, styles.contactStatusOffline]}>
                      <Ionicons name="time-outline" size={10} color="rgba(255,255,255,0.5)" /> 2m ago
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="rgba(216,180,254,0.5)" />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.insightWrapper}>
            <View style={styles.insightHeader}>
              <View style={styles.insightBadge}>
                <Ionicons name="sparkles" size={10} color="#e9d5ff" />
                <Text style={styles.insightBadgeText}>DAILY INSIGHT</Text>
              </View>
              <Ionicons name="chatbox-ellipses-outline" size={24} color="rgba(168,85,247,0.6)" />
            </View>

            <TouchableOpacity onPress={handleDoubleQuote} activeOpacity={1}>
              <Text style={styles.quoteText}>{quote}</Text>
            </TouchableOpacity>
            <Text style={styles.insightMessage}>{insightMsg}</Text>

            <View style={styles.actionButtons}>
              <Animated.View style={{ flex: 1, transform: [{ scale: discussScale }] }}>
                <TouchableOpacity
                  style={styles.discussBtn}
                  onPress={handleDiscuss}
                  {...pressScale(discussScale)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="chatbubble-ellipses" size={14} color="#fff" />
                  <Text style={styles.discussText}>Discuss This</Text>
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.7}>
                <Ionicons name="share-outline" size={14} color="#fff" />
                <Text style={styles.shareText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Animated.View style={{ flex: 1, transform: [{ scale: memoryScale }] }}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => setMemoryLinks(prev => prev + 2)}
                {...pressScale(memoryScale)}
                activeOpacity={0.85}
              >
                <View style={styles.statIcon}>
                  <Ionicons name="git-merge-outline" size={22} color="#d8b4fe" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Memory</Text>
                  <Text style={styles.statNumber}>
                    {memoryLinks} <Text style={styles.statUnit}>new links</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ flex: 1, transform: [{ scale: rewardScale }] }}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => setAuraPoints(prev => prev + 50)}
                {...pressScale(rewardScale)}
                activeOpacity={0.85}
              >
                <View style={styles.statIcon}>
                  <Ionicons name="diamond-outline" size={22} color="#d8b4fe" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Rewards</Text>
                  <Text style={styles.statNumber}>
                    {auraPoints} <Text style={styles.statUnit}>Aura pts</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          onPress={() => router.push('/voice-call')}
          onPressIn={() => Animated.spring(fabScale, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start()}
          onPressOut={() => Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#a855f7', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="mic" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  ambientGlow: {
    position: 'absolute',
    top: '10%',
    right: '-20%',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: 500,
  },
  scroll: { flex: 1 },
  content: { gap: 0, minHeight: Dimensions.get('window').height },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  statusTime: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  statusIcons: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  logoArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 26,
    letterSpacing: -0.5,
    color: COLORS.onSurface,
  },
  profileTrigger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(168,85,247,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(25,20,45,0.96)',
    borderRadius: 26,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(168,85,247,0.3)',
    marginBottom: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dropdownText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: '#fff',
  },
  dropdownDivider: {
    height: 0.5,
    backgroundColor: 'rgba(168,85,247,0.3)',
    marginVertical: 6,
  },
  connectionsSection: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
  sectionLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 1,
    color: 'rgba(216,180,254,0.8)',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactCard: {
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: 26,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  contactInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarOrion: { backgroundColor: '#06b6d4' },
  avatarEmoji: { fontSize: 22 },
  contactName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 17,
    color: '#fff',
  },
  contactStatus: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#34d399',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactStatusOffline: { color: 'rgba(255,255,255,0.5)' },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
    marginRight: 4,
  },
  insightWrapper: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: 'rgba(45,30,75,0.55)',
    borderRadius: 40,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.5)',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(168,85,247,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 40,
  },
  insightBadgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#e9d5ff',
    letterSpacing: 0.5,
  },
  quoteText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 21,
    lineHeight: 28,
    color: '#f3e8ff',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  insightMessage: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(243,232,255,0.85)',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 14,
  },
  discussBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#8b5cf6',
    borderRadius: 40,
    paddingVertical: 12,
    shadowColor: 'rgba(139,92,246,0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 6,
  },
  discussText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(168,85,247,0.5)',
  },
  shareText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(45,30,75,0.6)',
    borderRadius: 28,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139,92,246,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: { flex: 1 },
  statLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: 'rgba(216,180,254,0.9)',
    marginBottom: 2,
  },
  statNumber: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: '#fff',
    letterSpacing: -0.5,
  },
  statUnit: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#c084fc',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 80,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: 'rgba(139,92,246,0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
