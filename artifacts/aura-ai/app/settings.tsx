import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useApp();
  const [breakReminders, setBreakReminders] = useState(true);
  const [aiDisclosure, setAiDisclosure] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const SETTINGS_SECTIONS = [
    {
      title: 'Privacy & Safety',
      items: [
        {
          label: 'AI Disclosure Banner',
          sub: 'Always show AI indicator',
          value: aiDisclosure,
          onChange: setAiDisclosure,
          icon: 'information-circle-outline',
          required: true,
        },
        {
          label: 'Break Reminders',
          sub: 'Notifications after extended sessions',
          value: breakReminders,
          onChange: setBreakReminders,
          icon: 'time-outline',
          required: user?.isMinor,
        },
        {
          label: 'Long-Term Memory',
          sub: 'Allow Aura to remember facts about you',
          value: memoryEnabled,
          onChange: setMemoryEnabled,
          icon: 'planet-outline',
          required: false,
        },
      ],
    },
    {
      title: 'Interactions',
      items: [
        {
          label: 'Voice Mode',
          sub: 'Enable speech-to-text and TTS',
          value: voiceEnabled,
          onChange: setVoiceEnabled,
          icon: 'mic-outline',
          required: false,
        },
        {
          label: 'Push Notifications',
          sub: 'Companion messages and check-ins',
          value: notifications,
          onChange: setNotifications,
          icon: 'notifications-outline',
          required: false,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#0e1323']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#dee1f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad, gap: 20, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User info card */}
        <GlassCard style={styles.userCard} radius={20}>
          <View style={styles.userInfo}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{user?.name?.[0]?.toUpperCase() ?? 'A'}</Text>
            </View>
            <View style={styles.userText}>
              <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
            </View>
          </View>
          {user?.isMinor && (
            <View style={styles.minorBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#8fd8ff" />
              <Text style={styles.minorText}>Minor mode active — enhanced safety</Text>
            </View>
          )}
        </GlassCard>

        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <GlassCard style={styles.sectionCard} radius={18}>
              {section.items.map((item, idx) => (
                <View
                  key={item.label}
                  style={[
                    styles.settingRow,
                    idx < section.items.length - 1 && styles.settingRowBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconBox}>
                      <Ionicons name={item.icon as any} size={18} color="#c9bfff" />
                    </View>
                    <View style={styles.settingText}>
                      <View style={styles.settingLabelRow}>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        {item.required && (
                          <Text style={styles.requiredTag}>Required</Text>
                        )}
                      </View>
                      <Text style={styles.settingSub}>{item.sub}</Text>
                    </View>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.required ? undefined : item.onChange}
                    disabled={!!item.required}
                    trackColor={{ false: 'rgba(72,69,85,0.5)', true: 'rgba(201,191,255,0.5)' }}
                    thumbColor={item.value ? '#c9bfff' : '#484555'}
                  />
                </View>
              ))}
            </GlassCard>
          </View>
        ))}

        {/* About */}
        <GlassCard style={styles.aboutCard} radius={16}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutKey}>App Version</Text>
            <Text style={styles.aboutVal}>1.0.0</Text>
          </View>
          <View style={[styles.aboutRow, styles.aboutRowBorder]}>
            <Text style={styles.aboutKey}>Build</Text>
            <Text style={styles.aboutVal}>Luminous Intelligence</Text>
          </View>
          <TouchableOpacity style={styles.aboutRow}>
            <Text style={styles.aboutKey}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={14} color="#928ea1" />
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 18,
    color: '#dee1f9',
  },
  userCard: { padding: 16, gap: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(201,191,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201,191,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: '#c9bfff',
  },
  userText: { gap: 2 },
  userName: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    color: '#dee1f9',
  },
  userEmail: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#928ea1',
  },
  minorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(143,216,255,0.08)',
    borderRadius: 10,
    padding: 10,
  },
  minorText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#8fd8ff',
  },
  section: { gap: 8 },
  sectionLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: 'rgba(146,142,161,0.8)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  sectionCard: { overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(201,191,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1, gap: 2 },
  settingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#dee1f9',
  },
  requiredTag: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: '#8fd8ff',
    backgroundColor: 'rgba(143,216,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    letterSpacing: 0.3,
  },
  settingSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#928ea1',
  },
  aboutCard: { overflow: 'hidden' },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  aboutRowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  aboutKey: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#dee1f9',
  },
  aboutVal: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#928ea1',
  },
});
