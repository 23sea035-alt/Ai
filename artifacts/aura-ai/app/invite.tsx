import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

const INVITE_LINK = 'aura.ai/invite/lucas_aura_2024';

const SOCIALS = [
  { name: 'iMessage', icon: 'chatbubble', color: '#007AFF' },
  { name: 'WhatsApp', icon: 'chatbox', color: '#25D366' },
  { name: 'Telegram', icon: 'send', color: '#0088CC' },
];

export default function InviteScreen() {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const btnScale = useRef(new Animated.Value(1)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entryAnim]);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={['#0B1020', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />


      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite Friends</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.entryWrapper, {
        opacity: entryAnim,
        transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad, paddingHorizontal: SPACING.containerMargin, gap: SPACING.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroOrb} />
          <Text style={styles.heroTitle}>Share the Future</Text>
          <Text style={styles.heroSub}>
            Invite a friend to experience Aura AI. They'll get{' '}
            <Text style={styles.heroHighlight}>1 Month Premium</Text> free, and you'll
            unlock exclusive rewards.
          </Text>
        </View>

        {/* Reward Preview */}
        <View style={styles.rewardCard}>
          <View style={styles.rewardGlow} />
          <View style={styles.rewardTop}>
            <View>
              <Text style={styles.rewardLabel}>FRIEND'S WELCOME REWARD</Text>
              <Text style={styles.rewardTitle}>Full Premium Access</Text>
            </View>
            <Ionicons name="trophy" size={32} color={COLORS.secondary} />
          </View>
          <View style={styles.rewardStats}>
            <View style={styles.rewardStat}>
              <Text style={styles.rewardStatLabel}>Duration</Text>
              <Text style={styles.rewardStatValue}>30 Days</Text>
            </View>
            <View style={styles.rewardStat}>
              <Text style={styles.rewardStatLabel}>Credits</Text>
              <Text style={styles.rewardStatValue}>Unlimited</Text>
            </View>
          </View>
        </View>

        {/* Invite Link */}
        <View style={styles.linkSection}>
          <Text style={styles.linkLabel}>YOUR UNIQUE INVITE LINK</Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkText} numberOfLines={1}>{INVITE_LINK}</Text>
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity onPress={handleCopy} activeOpacity={0.9} style={styles.copyBtn} onPressIn={() => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start()} onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()}>
                <LinearGradient
                  colors={copied ? ['#4ade80', '#22c55e'] : ['#917eff', '#00c1fd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.copyGrad}
                >
                  <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Social Sharing */}
        <View style={styles.socialGrid}>
          {SOCIALS.map(s => (
            <TouchableOpacity key={s.name} activeOpacity={0.85} style={[styles.socialCard, pressedItem === s.name && { backgroundColor: `${COLORS.primary}15` }]} onPressIn={() => setPressedItem(s.name)} onPressOut={() => setPressedItem(null)}>
              <View style={[styles.socialIconWrap, { backgroundColor: `${s.color}20` }]}>
                <Ionicons name={s.icon as any} size={24} color={s.color} />
              </View>
              <Text style={styles.socialName}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visual Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Better together.</Text>
            <Text style={styles.bannerSub}>Shared intelligence is the most powerful tool.</Text>
          </View>
        </View>
      </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  entryWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.containerMargin,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassStroke,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
  heroSection: { alignItems: 'center', gap: 12, paddingTop: 16 },
  heroOrb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 28,
    color: COLORS.onSurface,
  },
  heroSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  heroHighlight: {
    color: COLORS.secondary,
    fontFamily: 'Manrope_600SemiBold',
  },
  rewardCard: {
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    borderRadius: RADIUS.lg,
    padding: 24,
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  rewardGlow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(201,191,255,0.2)',
  },
  rewardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rewardLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    letterSpacing: 2.4,
    color: COLORS.primary,
    marginBottom: 4,
  },
  rewardTitle: {
    fontFamily: 'Sora_500Medium',
    fontSize: 20,
    color: COLORS.onSurface,
  },
  rewardStats: { flexDirection: 'row', gap: 8 },
  rewardStat: {
    flex: 1,
    backgroundColor: COLORS.glassFill,
    borderRadius: RADIUS.md,
    padding: 12,
    gap: 4,
  },
  rewardStatLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: COLORS.outline,
  },
  rewardStatValue: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    color: COLORS.onSurface,
  },
  linkSection: { gap: 12 },
  linkLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    letterSpacing: 2.4,
    color: COLORS.outline,
    paddingHorizontal: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    borderRadius: RADIUS.lg,
    paddingLeft: 16,
    overflow: 'hidden',
  },
  linkText: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: COLORS.onSurface,
  },
  copyBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  copyGrad: { paddingHorizontal: 24, paddingVertical: 12 },
  copyText: {
    fontFamily: 'Sora_500Medium',
    fontSize: 15,
    color: '#28008a',
  },
  socialGrid: { flexDirection: 'row', gap: 16 },
  socialCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  socialName: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: COLORS.onSurface,
  },
  banner: {
    height: 192,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    padding: 24,
    gap: 4,
  },
  bannerTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 17,
    color: '#ffffff',
  },
  bannerSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: COLORS.outline,
  },
});
