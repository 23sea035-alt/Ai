import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraButton } from '@/components/AuraButton';
import { GradientBorder } from '@/components/GradientBorder';

const FAQS = [
  { q: 'What is Aura AI?', a: 'Aura AI is a premium AI companion app that lets you build meaningful connections with AI personalities. Each companion has a unique personality, memory, and communication style.', icon: '🤖', color: '#c9bfff' },
  { q: 'How does memory work?', a: 'Your companions remember facts about you across conversations — your preferences, goals, relationships, and habits. Premium users get unlimited persistent memory.', icon: '🧠', color: '#8fd8ff' },
  { q: 'Is my data private?', a: 'Yes. All conversations are encrypted. You can download or delete your data at any time from Privacy & Security settings.', icon: '🔒', color: '#4ade80' },
  { q: 'Can I have multiple companions?', a: 'Free users get 1 companion. Premium users get unlimited companions with unique personalities.', icon: '👥', color: '#ffb77d' },
  { q: 'How do voice calls work?', a: 'Premium users can have real-time voice conversations with their companions (60 min/month). Tap the microphone icon in the chat screen to start.', icon: '🎙️', color: '#B388FF' },
  { q: 'How do I cancel Premium?', a: 'You can cancel anytime from your device\'s subscription settings (App Store or Google Play). Your access continues until the end of the billing period.', icon: '💳', color: '#ff8fb0' },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(0);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <GradientBorder colors={['#c9bfff66', '#8fd8ff33']} radius={20} borderWidth={1.5} innerStyle={styles.heroBanner}>
          <Text style={{ fontSize: 32 }}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroSub}>Browse FAQs or contact our team</Text>
          </View>
        </GradientBorder>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          {[
            { icon: '💬', label: 'Live Chat', color: '#c9bfff' },
            { icon: '📧', label: 'Email Us', color: '#8fd8ff' },
            { icon: '📖', label: 'Docs', color: '#ffb77d' },
          ].map((a) => (
            <TouchableOpacity key={a.label} activeOpacity={0.8} style={{ flex: 1 }}>
              <GradientBorder colors={[a.color + '66', a.color + '22']} radius={16} borderWidth={1.5} innerStyle={styles.quickCard}>
                <Text style={{ fontSize: 22 }}>{a.icon}</Text>
                <Text style={[styles.quickLabel, { color: a.color }]}>{a.label}</Text>
              </GradientBorder>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FREQUENTLY ASKED</Text>
          {FAQS.map((faq, idx) => (
            <GradientBorder
              key={idx}
              colors={expanded === idx ? [faq.color + '88', faq.color + '33'] : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
              radius={16}
              borderWidth={expanded === idx ? 1.5 : 1}
              innerStyle={{ overflow: 'hidden' }}
            >
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => setExpanded(expanded === idx ? null : idx)}
                activeOpacity={0.7}
              >
                <View style={[styles.faqIconBox, { backgroundColor: faq.color + '20' }]}>
                  <Text style={{ fontSize: 15 }}>{faq.icon}</Text>
                </View>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Ionicons
                  name={expanded === idx ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={expanded === idx ? faq.color : '#928ea1'}
                />
              </TouchableOpacity>
              {expanded === idx && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqA}>{faq.a}</Text>
                </View>
              )}
            </GradientBorder>
          ))}
        </View>

        {/* Contact */}
        <GradientBorder colors={['rgba(201,191,255,0.3)', 'rgba(143,216,255,0.15)']} radius={20} borderWidth={1.5} innerStyle={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>Our support team typically responds within 24 hours.</Text>
          <AuraButton label="Contact Support" onPress={() => {}} variant="secondary" />
        </GradientBorder>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTop: { position: 'absolute', top: -60, right: -40, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(201,191,255,0.06)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: {},
  backInner: { padding: 10 },
  headerTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#dee1f9' },
  scroll: { paddingHorizontal: 20, gap: 20 },
  heroBanner: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18 },
  heroTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#dee1f9' },
  heroSub: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#928ea1', marginTop: 3 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: { padding: 16, alignItems: 'center', gap: 8 },
  quickLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
  section: { gap: 10 },
  sectionLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: 'rgba(146,142,161,0.7)', letterSpacing: 2, paddingHorizontal: 4 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  faqIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  faqQ: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#dee1f9', flex: 1 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  faqA: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(201,196,216,0.75)', lineHeight: 21 },
  contactCard: { padding: 20, gap: 12, alignItems: 'center' },
  contactTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: '#dee1f9' },
  contactSub: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#928ea1', textAlign: 'center' },
});
