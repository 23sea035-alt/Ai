import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleSend = () => {
    if (!email.trim()) return;
    setSent(true);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#dee1f9" />
        </TouchableOpacity>

        <View style={styles.iconWrapper}>
          <View style={styles.iconBox}>
            <Ionicons name={sent ? 'checkmark-circle' : 'mail-open-outline'} size={40} color="#c9bfff" />
          </View>
        </View>

        <Text style={styles.title}>{sent ? 'Check your email' : 'Forgot Password?'}</Text>
        <Text style={styles.subtitle}>
          {sent
            ? `We've sent a password reset link to ${email}. Check your inbox and follow the instructions.`
            : 'Enter your email address and we\'ll send you a link to reset your password.'}
        </Text>

        {!sent && (
          <GlassCard style={styles.card} radius={24}>
            <View style={styles.fieldWrapper}>
              <Ionicons name="mail-outline" size={20} color="#928ea1" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="rgba(146,142,161,0.6)"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSend}
              />
            </View>
            <AuraButton label="Send Reset Link" onPress={handleSend} disabled={!email.trim()} />
          </GlassCard>
        )}

        {sent && (
          <AuraButton label="Back to Login" onPress={() => router.replace('/(auth)/login')} />
        )}
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
  iconWrapper: { alignItems: 'center', paddingVertical: 12 },
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
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#dee1f9',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: 'rgba(201,196,216,0.7)',
    lineHeight: 22,
  },
  card: { padding: 20, gap: 14 },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    height: 52,
  },
  fieldIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#dee1f9',
    height: '100%',
  },
});
