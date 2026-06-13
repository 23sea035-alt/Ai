import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraButton } from '@/components/AuraButton';
import { GradientBorder } from '@/components/GradientBorder';
import { useApp } from '@/context/AppContext';

const REFERRAL_CODE = 'AURA2026';
const SHARE_OPTIONS = [
  { icon: '💬', label: 'Messages', color: '#4ade80' },
  { icon: '📸', label: 'Instagram', color: '#ff8fb0' },
  { icon: '🐦', label: 'Twitter', color: '#60a5fa' },
  { icon: '📧', label: 'Email', color: '#ffb77d' },
  { icon: '🔗', label: 'Copy Link', color: '#c9bfff' },
  { icon: '📤', label: 'More', color: '#B388FF' },
];

export default function InviteScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const [copied, setCopied] = useState(false);
  const [friends] = useState(3);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    Share.share({
      message: `Join me on Aura AI — the most immersive AI companion app! Use my code ${REFERRAL_CODE} for a free week of Premium. https://aura.ai/invite`,
      title: 'Invite a friend to Aura AI',
    }).catch(() => {});
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient colors={['#060a18', '#0B1020', '#121A35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <GradientBorder colors={['rgba(201,191,255,0.35)', 'rgba(143,216,255,0.15)']} radius={14} borderWidth={1} innerStyle={styles.backInner}>
            <Ionicons name="arrow-back" size={20} color="#dee1f9" />
          </GradientBorder>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={styles.heroTitle}>Invite & Earn</Text>
          <Text style={styles.heroSub}>Share Aura AI with friends. When they join, you both get 1 week of Premium free.</Text>
        </View>

        {/* Referral code */}
        <GradientBorder colors={['#c9bfff', '#8fd8ff', '#B388FF']} radius={20} borderWidth={2} innerStyle={styles.codeCard}>
          <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
          <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
          <TouchableOpacity onPress={handleCopy} activeOpacity={0.8} style={styles.copyBtn}>
            <LinearGradient
              colors={copied ? ['#4ade80', '#22c55e'] : ['#c9bfff', '#8fd8ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.copyGrad}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color="#160050" />
              <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy Code'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GradientBorder>

        {/* Progress */}
        <GradientBorder colors={['#ffb77d88', '#ffb77d33']} radius={18} borderWidth={1.5} innerStyle={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={{ fontSize: 20 }}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressTitle}>{friends} friends joined</Text>
              <Text style={styles.progressSub}>{5 - friends} more for a bonus month of Premium</Text>
            </View>
            <Text style={styles.progressBig}>{friends}/5</Text>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient colors={['#ffb77d', '#ffd87a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressBarFill, { width: `${(friends / 5) * 100}%` }]} />
          </View>
        </GradientBorder>

        {/* Share options */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SHARE VIA</Text>
          <View style={styles.shareGrid}>
            {SHARE_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.label} onPress={handleShare} activeOpacity={0.8} style={styles.shareWrapper}>
                <GradientBorder colors={[opt.color + '88', opt.color + '33']} radius={18} borderWidth={1.5} innerStyle={styles.shareCard}>
                  <Text style={{ fontSize: 24 }}>{opt.icon}</Text>
                  <Text style={[styles.shareLabel, { color: opt.color }]}>{opt.label}</Text>
                </GradientBorder>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <AuraButton label="Share Aura AI" onPress={handleShare} variant="primary" />

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          <GradientBorder colors={['rgba(201,191,255,0.2)', 'rgba(143,216,255,0.1)']} radius={20} borderWidth={1} innerStyle={styles.stepsCard}>
            {[
              { step: '1', text: 'Share your unique referral code', color: '#c9bfff' },
              { step: '2', text: 'Friend signs up using your code', color: '#8fd8ff' },
              { step: '3', text: 'You both get 7 days Premium free', color: '#4ade80' },
            ].map((s, idx, arr) => (
              <View key={s.step} style={[styles.stepRow, idx < arr.length - 1 && styles.stepBorder]}>
                <View style={[styles.stepNum, { backgroundColor: s.color + '22', borderColor: s.color + '55' }]}>
                  <Text style={[styles.stepNumText, { color: s.color }]}>{s.step}</Text>
                </View>
                <Text style={styles.stepText}>{s.text}</Text>
              </View>
            ))}
          </GradientBorder>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTop: { position: 'absolute', top: -60, left: '10%', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(201,191,255,0.07)' },
  glowBottom: { position: 'absolute', bottom: '20%', right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(143,216,255,0.04)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: {},
  backInner: { padding: 10 },
  headerTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#dee1f9' },
  scroll: { paddingHorizontal: 20, gap: 20 },
  heroSection: { alignItems: 'center', gap: 10, paddingTop: 8 },
  heroEmoji: { fontSize: 48 },
  heroTitle: { fontFamily: 'Sora_700Bold', fontSize: 26, color: '#dee1f9', letterSpacing: -0.3 },
  heroSub: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(201,196,216,0.7)', textAlign: 'center', lineHeight: 21, maxWidth: 300 },
  codeCard: { padding: 24, alignItems: 'center', gap: 12 },
  codeLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: '#8fd8ff', letterSpacing: 2.5 },
  codeText: { fontFamily: 'Sora_700Bold', fontSize: 34, color: '#dee1f9', letterSpacing: 6 },
  copyBtn: { borderRadius: 999, overflow: 'hidden' },
  copyGrad: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  copyText: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#160050' },
  progressCard: { padding: 18, gap: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  progressTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#dee1f9' },
  progressSub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#928ea1', marginTop: 2 },
  progressBig: { fontFamily: 'Sora_700Bold', fontSize: 20, color: '#ffb77d' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  section: { gap: 10 },
  sectionLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: 'rgba(146,142,161,0.7)', letterSpacing: 2, paddingHorizontal: 4 },
  shareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shareWrapper: { width: '30%' },
  shareCard: { padding: 14, alignItems: 'center', gap: 8 },
  shareLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
  stepsCard: { overflow: 'hidden' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  stepNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  stepNumText: { fontFamily: 'Sora_600SemiBold', fontSize: 14 },
  stepText: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(222,225,249,0.8)', flex: 1 },
});
