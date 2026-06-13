import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

const PROMPTS = [
  { label: 'Love the companions! ✨', color: '#c9bfff' },
  { label: 'Great voice quality 🎙️', color: '#8fd8ff' },
  { label: 'Memory feature is amazing 🧠', color: '#ffb77d' },
  { label: 'Beautiful design 🎨', color: '#4ade80' },
  { label: 'Feels so natural 💬', color: '#B388FF' },
  { label: 'Best app I\'ve used 🏆', color: '#ff8fb0' },
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
        <LinearGradient colors={['#060a18', '#0B1020', '#121A35']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.successContent}>
          <GradientBorder colors={['#ffd87a', '#ffb77d', '#ff9f5a']} radius={36} borderWidth={2}>
            <View style={styles.successEmoji}>
              <Text style={{ fontSize: 52 }}>⭐</Text>
            </View>
          </GradientBorder>
          <Text style={styles.successTitle}>Thank you!</Text>
          <Text style={styles.successSub}>Your review helps us build a better experience for everyone.</Text>
          <AuraButton label="Back to Profile" onPress={() => router.back()} variant="secondary" style={{ paddingHorizontal: 20 }} />
        </View>
      </View>
    );
  }

  const starColor = rating >= 4 ? '#ffd700' : rating >= 3 ? '#ffb77d' : rating >= 1 ? '#ff8fb0' : '#484555';

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient colors={['#060a18', '#0B1020', '#121A35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowTop} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <GradientBorder colors={['rgba(201,191,255,0.35)', 'rgba(143,216,255,0.15)']} radius={14} borderWidth={1} innerStyle={styles.backInner}>
            <Ionicons name="arrow-back" size={20} color="#dee1f9" />
          </GradientBorder>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Aura AI</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* App icon area */}
        <View style={styles.appIconArea}>
          <GradientBorder colors={['#c9bfff', '#8fd8ff', '#B388FF']} radius={28} borderWidth={2}>
            <LinearGradient colors={['#1A1F4B', '#0B1020']} style={styles.appIcon}>
              <Text style={styles.appIconText}>Aura</Text>
              <Text style={styles.appIconSub}>AI</Text>
            </LinearGradient>
          </GradientBorder>
          <Text style={styles.appName}>Aura AI</Text>
          <Text style={styles.appCategory}>Lifestyle · AI Companion</Text>
        </View>

        {/* Stars */}
        <GradientBorder colors={[starColor + '66', starColor + '22']} radius={20} borderWidth={1.5} innerStyle={styles.starsCard}>
          <Text style={styles.starsPrompt}>How would you rate your experience?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
                <Ionicons
                  name={(hovered || rating) >= s ? 'star' : 'star-outline'}
                  size={44}
                  color={(hovered || rating) >= s ? '#ffd700' : '#484555'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap a star to rate' : rating === 1 ? 'Needs Improvement' : rating === 2 ? 'It\'s Okay' : rating === 3 ? 'Good' : rating === 4 ? 'Really Good!' : '⭐ Absolutely Love It!'}
          </Text>
        </GradientBorder>

        {/* Quick prompts */}
        {rating >= 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHAT DO YOU LOVE?</Text>
            <View style={styles.promptsGrid}>
              {PROMPTS.map((p) => {
                const sel = selectedPrompts.includes(p.label);
                return (
                  <TouchableOpacity key={p.label} onPress={() => togglePrompt(p.label)} activeOpacity={0.75} style={styles.promptWrapper}>
                    {sel ? (
                      <GradientBorder colors={[p.color + 'cc', p.color + '55']} radius={999} borderWidth={1.5} innerStyle={styles.promptInner}>
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

        {/* Text review */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR REVIEW <Text style={{ color: '#484555', letterSpacing: 0 }}>(optional)</Text></Text>
          <GradientBorder
            colors={focused ? ['#c9bfff', '#8fd8ff'] : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.06)']}
            radius={16}
            borderWidth={focused ? 1.5 : 1}
            innerStyle={styles.reviewInner}
          >
            <TextInput
              style={styles.reviewInput}
              value={review}
              onChangeText={setReview}
              placeholder="Share your experience with Aura AI…"
              placeholderTextColor="rgba(146,142,161,0.45)"
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
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTop: { position: 'absolute', top: -60, alignSelf: 'center', left: '15%', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,215,0,0.05)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: {},
  backInner: { padding: 10 },
  headerTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#dee1f9' },
  scroll: { paddingHorizontal: 20, gap: 24 },
  appIconArea: { alignItems: 'center', gap: 10, paddingTop: 8 },
  appIcon: { width: 90, height: 90, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  appIconText: { fontFamily: 'Sora_700Bold', fontSize: 20, color: '#c9bfff' },
  appIconSub: { fontFamily: 'Sora_400Regular', fontSize: 13, color: '#8fd8ff' },
  appName: { fontFamily: 'Sora_700Bold', fontSize: 20, color: '#dee1f9' },
  appCategory: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#928ea1' },
  starsCard: { padding: 24, alignItems: 'center', gap: 16 },
  starsPrompt: { fontFamily: 'Manrope_500Medium', fontSize: 15, color: 'rgba(222,225,249,0.8)', textAlign: 'center' },
  starsRow: { flexDirection: 'row', gap: 8 },
  ratingLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#dee1f9' },
  section: { gap: 10 },
  sectionLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: 'rgba(146,142,161,0.7)', letterSpacing: 2 },
  promptsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  promptWrapper: {},
  promptInner: { paddingHorizontal: 14, paddingVertical: 8 },
  promptText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13 },
  promptChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  promptTextOff: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#928ea1' },
  reviewInner: { padding: 14 },
  reviewInput: { fontFamily: 'Manrope_400Regular', fontSize: 15, color: '#dee1f9', minHeight: 100, textAlignVertical: 'top' },
  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 32 },
  successEmoji: { padding: 20 },
  successTitle: { fontFamily: 'Sora_700Bold', fontSize: 28, color: '#dee1f9' },
  successSub: { fontFamily: 'Manrope_400Regular', fontSize: 15, color: '#928ea1', textAlign: 'center', lineHeight: 22 },
});
