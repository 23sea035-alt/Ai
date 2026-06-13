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
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';

export default function AgeVerificationScreen() {
  const insets = useSafeAreaInsets();
  const { updateUser } = useApp();
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleContinue = () => {
    const birthYear = parseInt(year);
    if (!year || isNaN(birthYear) || birthYear < 1900 || birthYear > 2013) {
      setError('Please enter a valid birth year (e.g. 1995)');
      return;
    }
    const age = 2026 - birthYear;
    const isMinor = age < 18;
    updateUser({ birthYear, isMinor, ageVerified: true });
    router.push('/ai-disclosure');
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#dee1f9" />
        </TouchableOpacity>

        <View style={styles.iconWrapper}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={36} color="#c9bfff" />
          </View>
          <View style={styles.iconGlow} />
        </View>

        <Text style={styles.title}>Age Verification</Text>
        <Text style={styles.subtitle}>
          We need your birth year to provide the right experience and comply with safety regulations.
        </Text>

        <GlassCard style={styles.card} radius={24}>
          <Text style={styles.fieldLabel}>BIRTH YEAR</Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={(t) => { setYear(t); setError(''); }}
            placeholder="e.g. 1995"
            placeholderTextColor="rgba(146,142,161,0.5)"
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="done"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </GlassCard>

        {/* Legal note */}
        <GlassCard style={styles.noteCard} radius={16}>
          <View style={styles.noteRow}>
            <Ionicons name="shield-checkmark" size={18} color="#8fd8ff" />
            <Text style={styles.noteText}>
              Users under 18 receive age-appropriate content and enhanced safety features per 2026 companion AI regulations.
            </Text>
          </View>
        </GlassCard>

        <AuraButton
          label="Continue"
          onPress={handleContinue}
          style={styles.btn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  scroll: { paddingHorizontal: 20, gap: 20 },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginVertical: 8,
  },
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
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(201,191,255,0.08)',
  },
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: 'rgba(201,196,216,0.75)',
    lineHeight: 22,
  },
  card: { padding: 20, gap: 12 },
  fieldLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#8fd8ff',
    letterSpacing: 2,
  },
  input: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 32,
    color: '#dee1f9',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,191,255,0.3)',
    paddingBottom: 8,
  },
  errorText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#ffb4ab',
  },
  noteCard: { padding: 16 },
  noteRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  noteText: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(201,196,216,0.7)',
    lineHeight: 19,
  },
  btn: { marginTop: 8 },
});
