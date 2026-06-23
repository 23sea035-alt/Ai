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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraButton } from '@/components/AuraButton';
import { GradientBorder } from '@/components/GradientBorder';
import { COLORS, FONTS, SPACING, RADIUS, GLASS_STYLE, SHADOWS } from '@/constants/theme';

const PROMPTS = [
  { label: 'Love the companions!', color: COLORS.primary },
  { label: 'Great voice quality', color: COLORS.secondary },
  { label: 'Memory feature is amazing', color: COLORS.tertiary },
  { label: 'Beautiful design', color: '#4ade80' },
  { label: 'Feels so natural', color: COLORS.accentGlow },
  { label: 'Best app I\'ve used', color: '#ff8fb0' },
];

export default function RateAppScreen() {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const togglePrompt = (p: string) => {
    setSelectedPrompts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <LinearGradient colors={[COLORS.surfaceContainerLowest, COLORS.gradientStart, COLORS.gradientMid]} style={StyleSheet.absoluteFillObject} />
        <View style={styles.successContent}>
          <GradientBorder colors={['#ffd87a', COLORS.tertiary, '#ff9f5a']} radius={RADIUS.xxxl} borderWidth={2}>
            <View style={styles.successEmoji}>
              <Text style={{ fontSize: 52 }}>⭐</Text>
            </View>
          </GradientBorder>
          <Text style={styles.successTitle}>Thank you!</Text>
          <Text style={styles.successSub}>Your review helps us build a better experience for everyone.</Text>
          <AuraButton label="Back to Profile" onPress={() => router.back()} variant="secondary" style={{ paddingHorizontal: SPACING.containerMargin }} />
        </View>
      </View>
    );
  }

  const starColor = rating >= 4 ? '#ffd700' : rating >= 3 ? COLORS.tertiary : rating >= 1 ? '#ff8fb0' : COLORS.outlineVariant;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient colors={[COLORS.surfaceContainerLowest, COLORS.gradientStart, COLORS.gradientMid]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowTop} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <GradientBorder colors={[COLORS.primary + '59', COLORS.secondary + '26']} radius={RADIUS.xl} borderWidth={1} innerStyle={styles.backInner}>
            <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
          </GradientBorder>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Aura AI</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.appIconArea}>
          <GradientBorder colors={[COLORS.primary, COLORS.secondary, COLORS.accentGlow]} radius={28} borderWidth={2}>
            <LinearGradient colors={[COLORS.gradientEnd, COLORS.gradientStart]} style={styles.appIcon}>
              <Text style={styles.appIconText}>Aura</Text>
              <Text style={styles.appIconSub}>AI</Text>
            </LinearGradient>
          </GradientBorder>
          <Text style={styles.appName}>Aura AI</Text>
          <Text style={styles.appCategory}>Lifestyle · AI Companion</Text>
        </View>

        <GradientBorder colors={[starColor + '66', starColor + '22']} radius={RADIUS.xxl} borderWidth={1.5} innerStyle={styles.starsCard}>
          <Text style={styles.starsPrompt}>How would you rate your experience?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
                <Ionicons
                  name={(hovered || rating) >= s ? 'star' : 'star-outline'}
                  size={44}
                  color={(hovered || rating) >= s ? '#ffd700' : COLORS.outlineVariant}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap a star to rate' : rating === 1 ? 'Needs Improvement' : rating === 2 ? 'It\'s Okay' : rating === 3 ? 'Good' : rating === 4 ? 'Really Good!' : 'Absolutely Love It!'}
          </Text>
        </GradientBorder>

        {rating >= 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHAT DO YOU LOVE?</Text>
            <View style={styles.promptsGrid}>
              {PROMPTS.map((p) => {
                const sel = selectedPrompts.includes(p.label);
                return (
                  <TouchableOpacity key={p.label} onPress={() => togglePrompt(p.label)} activeOpacity={0.75} style={styles.promptWrapper}>
                    {sel ? (
                      <GradientBorder colors={[p.color + 'cc', p.color + '55']} radius={RADIUS.full} borderWidth={1.5} innerStyle={styles.promptInner}>
                        <Text style={[styles.promptText, { color: p.color }]}>{p.label}</Text>
                      </GradientBorder>
                    ) : (
                      <View style={styles.promptChip}>
                        <Text style={styles.promptTextOff}>{p.label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR REVIEW <Text style={{ color: COLORS.outlineVariant, letterSpacing: 0 }}>(optional)</Text></Text>
          <GradientBorder
            colors={focused ? [COLORS.primary, COLORS.secondary] : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.06)']}
            radius={RADIUS.xl}
            borderWidth={focused ? 1.5 : 1}
            innerStyle={styles.reviewInner}
          >
            <TextInput
              style={styles.reviewInput}
              value={review}
              onChangeText={setReview}
              placeholder="Share your experience with Aura AI…"
              placeholderTextColor={COLORS.outline + '73'}
              multiline
              numberOfLines={4}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </GradientBorder>
        </View>

        <AuraButton label={rating === 0 ? 'Select a Rating First' : 'Submit Review'} onPress={handleSubmit} disabled={rating === 0} variant={rating >= 4 ? 'gold' : 'primary'} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  glowTop: { position: 'absolute', top: -60, alignSelf: 'center', left: '15%', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,215,0,0.05)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.gutter, paddingBottom: SPACING.sm },
  backBtn: {},
  backInner: { padding: 10 },
  headerTitle: { ...FONTS.titleMd, fontFamily: 'Sora_700Bold', fontSize: 18, color: COLORS.onSurface },
  scroll: { paddingHorizontal: SPACING.containerMargin, gap: SPACING.md },
  appIconArea: { alignItems: 'center', gap: 10, paddingTop: SPACING.base },
  appIcon: { width: 90, height: 90, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  appIconText: { ...FONTS.titleMd, fontFamily: 'Sora_700Bold', fontSize: 20, color: COLORS.primary },
  appIconSub: { ...FONTS.caption, fontFamily: 'Sora_400Regular', fontSize: 13, color: COLORS.secondary },
  appName: { ...FONTS.titleMd, fontFamily: 'Sora_700Bold', color: COLORS.onSurface },
  appCategory: { ...FONTS.caption, color: COLORS.outline },
  starsCard: { padding: SPACING.md, alignItems: 'center', gap: SPACING.gutter },
  starsPrompt: { ...FONTS.bodyMd, fontFamily: 'Manrope_500Medium', color: COLORS.onSurface + 'CC', textAlign: 'center' },
  starsRow: { flexDirection: 'row', gap: SPACING.base },
  ratingLabel: { ...FONTS.caption, fontFamily: 'Manrope_600SemiBold', color: COLORS.onSurface },
  section: { gap: 10 },
  sectionLabel: { ...FONTS.caption, fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: COLORS.outline + 'B3', letterSpacing: 2 },
  promptsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.base },
  promptWrapper: {},
  promptInner: { paddingHorizontal: 14, paddingVertical: SPACING.base },
  promptText: { ...FONTS.caption, fontFamily: 'Manrope_600SemiBold' },
  promptChip: { paddingHorizontal: 14, paddingVertical: SPACING.base, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  promptTextOff: { ...FONTS.caption, fontFamily: 'Manrope_500Medium', color: COLORS.outline },
  reviewInner: { padding: 14 },
  reviewInput: { ...FONTS.bodyMd, color: COLORS.onSurface, minHeight: 100, textAlignVertical: 'top' },
  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.containerMargin, paddingHorizontal: 32 },
  successEmoji: { padding: SPACING.containerMargin },
  successTitle: { ...FONTS.headlineLgMobile, fontFamily: 'Sora_700Bold', color: COLORS.onSurface },
  successSub: { ...FONTS.bodyMd, color: COLORS.outline, textAlign: 'center', lineHeight: 22 },
});
