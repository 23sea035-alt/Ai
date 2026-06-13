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
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';

const DISCLOSURES = [
  {
    icon: 'hardware-chip-outline' as const,
    title: 'Aura is Artificial Intelligence',
    body: 'Aura is an AI system — not a human. It is designed to be helpful and supportive, but it is not sentient and has no consciousness.',
  },
  {
    icon: 'infinite-outline' as const,
    title: 'Conversations are Private',
    body: 'Your chats are stored locally and used only to provide you with continuity. We never sell your personal data.',
  },
  {
    icon: 'time-outline' as const,
    title: 'Break Reminders',
    body: 'Aura will remind you to take breaks from conversations. Long sessions are fine, but balance matters.',
  },
  {
    icon: 'heart-outline' as const,
    title: 'Crisis Resources',
    body: 'If you express thoughts of self-harm, Aura will always surface real crisis resources (988 Lifeline in the US) and encourage you to seek help.',
  },
];

export default function AIDisclosureScreen() {
  const insets = useSafeAreaInsets();
  const { updateUser, user } = useApp();
  const [accepted, setAccepted] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleAccept = () => {
    updateUser({ aiDisclosureAccepted: true, onboardingDone: true });
    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/register');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#1A1F4B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrapper}>
          <View style={styles.iconBox}>
            <Ionicons name="information-circle" size={40} color="#c9bfff" />
          </View>
        </View>

        <Text style={styles.eyebrow}>TRANSPARENCY</Text>
        <Text style={styles.title}>Before you begin</Text>
        <Text style={styles.subtitle}>
          As required by the AI Companion Regulations of 2026, please review these important disclosures.
        </Text>

        <View style={styles.disclosures}>
          {DISCLOSURES.map((d, i) => (
            <GlassCard key={i} style={styles.disclosureCard} radius={16}>
              <View style={styles.disclosureRow}>
                <View style={styles.disclosureIconBox}>
                  <Ionicons name={d.icon} size={22} color="#c9bfff" />
                </View>
                <View style={styles.disclosureText}>
                  <Text style={styles.disclosureTitle}>{d.title}</Text>
                  <Text style={styles.disclosureBody}>{d.body}</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Acceptance toggle */}
        <TouchableOpacity
          style={styles.acceptRow}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
            {accepted && <Ionicons name="checkmark" size={14} color="#1a0063" />}
          </View>
          <Text style={styles.acceptText}>
            I understand that Aura is an AI and I have read the above disclosures.
          </Text>
        </TouchableOpacity>

        <AuraButton
          label="I Understand, Let's Go"
          onPress={handleAccept}
          disabled={!accepted}
          style={styles.btn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  scroll: { paddingHorizontal: 20, gap: 16 },
  iconWrapper: { alignItems: 'center', paddingVertical: 16 },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(201,191,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,191,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#8fd8ff',
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.7)',
    lineHeight: 21,
  },
  disclosures: { gap: 10 },
  disclosureCard: { padding: 16 },
  disclosureRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  disclosureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(201,191,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  disclosureText: { flex: 1, gap: 4 },
  disclosureTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#dee1f9',
  },
  disclosureBody: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(201,196,216,0.7)',
    lineHeight: 19,
  },
  acceptRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(201,191,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: '#c9bfff',
    borderColor: '#c9bfff',
  },
  acceptText: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(201,196,216,0.8)',
    lineHeight: 20,
  },
  btn: { marginTop: 8 },
});
