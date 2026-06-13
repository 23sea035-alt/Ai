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

import { GradientBorder } from '@/components/GradientBorder';

const NOTIFICATION_SECTIONS = [
  {
    title: 'Companion Messages',
    items: [
      { id: 'msg_push', icon: '💬', label: 'Push Notifications', sub: 'New messages from your companions', color: '#c9bfff', defaultOn: true },
      { id: 'msg_badge', icon: '🔴', label: 'App Badge Count', sub: 'Show unread badge on app icon', color: '#8fd8ff', defaultOn: true },
      { id: 'msg_sound', icon: '🔔', label: 'Notification Sound', sub: 'Play sound for new messages', color: '#ffb77d', defaultOn: false },
    ],
  },
  {
    title: 'Check-ins & Reminders',
    items: [
      { id: 'checkin', icon: '🌅', label: 'Daily Check-ins', sub: 'Morning greetings from your companion', color: '#4ade80', defaultOn: true },
      { id: 'break', icon: '⏸️', label: 'Break Reminders', sub: 'Remind me to take breaks', color: '#60a5fa', defaultOn: false },
      { id: 'streak', icon: '🔥', label: 'Streak Reminders', sub: 'Keep your conversation streak alive', color: '#ffb77d', defaultOn: true },
    ],
  },
  {
    title: 'Updates & News',
    items: [
      { id: 'feature', icon: '✨', label: 'New Features', sub: 'Be first to know about updates', color: '#B388FF', defaultOn: true },
      { id: 'promo', icon: '🎁', label: 'Promotions', sub: 'Special offers and discounts', color: '#ff8fb0', defaultOn: false },
    ],
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NOTIFICATION_SECTIONS.forEach(s => s.items.forEach(i => { init[i.id] = i.defaultOn; }));
    return init;
  });

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const toggle = (id: string) => setValues(prev => ({ ...prev, [id]: !prev[id] }));
  const enabledCount = Object.values(values).filter(Boolean).length;

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Summary badge */}
        <GradientBorder colors={['#ffb77d88', '#ffb77d30']} radius={18} borderWidth={1.5} innerStyle={styles.summaryInner}>
          <Text style={{ fontSize: 24 }}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>{enabledCount} notifications active</Text>
            <Text style={styles.summarySub}>Tap any toggle to customize</Text>
          </View>
        </GradientBorder>

        {NOTIFICATION_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title.toUpperCase()}</Text>
            <GradientBorder
              colors={['rgba(201,191,255,0.25)', 'rgba(143,216,255,0.12)', 'rgba(201,191,255,0.08)']}
              radius={20}
              borderWidth={1}
              innerStyle={{ overflow: 'hidden' }}
            >
              {section.items.map((item, idx) => (
                <View
                  key={item.id}
                  style={[styles.row, idx < section.items.length - 1 && styles.rowBorder]}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowSub}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={values[item.id] ?? false}
                    onValueChange={() => toggle(item.id)}
                    trackColor={{ false: 'rgba(72,69,85,0.5)', true: item.color + '80' }}
                    thumbColor={values[item.id] ? item.color : '#484555'}
                  />
                </View>
              ))}
            </GradientBorder>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTop: { position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,183,125,0.06)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: {},
  backInner: { padding: 10 },
  headerTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#dee1f9' },
  scroll: { paddingHorizontal: 20, gap: 20 },
  summaryInner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  summaryTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#dee1f9' },
  summarySub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#928ea1', marginTop: 2 },
  section: { gap: 8 },
  sectionLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: 'rgba(146,142,161,0.7)', letterSpacing: 2, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontFamily: 'Manrope_500Medium', fontSize: 15, color: '#dee1f9' },
  rowSub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#928ea1' },
});
