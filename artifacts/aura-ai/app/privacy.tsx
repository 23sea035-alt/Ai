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

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const [twoFactor, setTwoFactor] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const PRIVACY_ITEMS = [
    { icon: '🔐', label: 'Two-Factor Authentication', sub: 'Extra security layer for your account', value: twoFactor, onChange: setTwoFactor, color: '#4ade80' },
    { icon: '📊', label: 'Analytics & Improvement', sub: 'Help improve Aura AI with usage data', value: analytics, onChange: setAnalytics, color: '#8fd8ff' },
    { icon: '👁️', label: 'Read Receipts', sub: 'Let companions know when you\'ve read', value: readReceipts, onChange: setReadReceipts, color: '#c9bfff' },
    { icon: '🔗', label: 'Data Sharing', sub: 'Share anonymized data with researchers', value: dataSharing, onChange: setDataSharing, color: '#ffb77d' },
  ];

  const DATA_ACTIONS = [
    { icon: '📥', label: 'Download My Data', sub: 'Export all your conversations and memories', color: '#8fd8ff' },
    { icon: '🗑️', label: 'Clear All Memories', sub: 'Permanently delete your memory timeline', color: '#ffb77d' },
    { icon: '⚠️', label: 'Delete Account', sub: 'Permanently remove your account and data', color: '#ff8b8b' },
  ];

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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Security score */}
        <GradientBorder colors={['#4ade8099', '#4ade8033']} radius={20} borderWidth={1.5} innerStyle={styles.scoreInner}>
          <View style={styles.scoreLeft}>
            <Text style={{ fontSize: 28 }}>🛡️</Text>
            <View>
              <Text style={styles.scoreTitle}>Security Score</Text>
              <Text style={styles.scoreSub}>Enable 2FA to reach 100%</Text>
            </View>
          </View>
          <View style={styles.scoreBar}>
            <View style={styles.scoreBarBg}>
              <LinearGradient colors={['#4ade80', '#8fd8ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.scoreBarFill, { width: twoFactor ? '100%' : '65%' }]} />
            </View>
            <Text style={styles.scorePercent}>{twoFactor ? '100%' : '65%'}</Text>
          </View>
        </GradientBorder>

        {/* Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SECURITY & PRIVACY</Text>
          <GradientBorder colors={['rgba(201,191,255,0.25)', 'rgba(143,216,255,0.12)']} radius={20} borderWidth={1} innerStyle={{ overflow: 'hidden' }}>
            {PRIVACY_ITEMS.map((item, idx) => (
              <View key={item.label} style={[styles.row, idx < PRIVACY_ITEMS.length - 1 && styles.rowBorder]}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onChange}
                  trackColor={{ false: 'rgba(72,69,85,0.5)', true: item.color + '80' }}
                  thumbColor={item.value ? item.color : '#484555'}
                />
              </View>
            ))}
          </GradientBorder>
        </View>

        {/* Data actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA MANAGEMENT</Text>
          <GradientBorder colors={['rgba(201,191,255,0.25)', 'rgba(143,216,255,0.12)']} radius={20} borderWidth={1} innerStyle={{ overflow: 'hidden' }}>
            {DATA_ACTIONS.map((item, idx) => (
              <TouchableOpacity key={item.label} style={[styles.row, idx < DATA_ACTIONS.length - 1 && styles.rowBorder]} activeOpacity={0.7}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: item.color === '#ff8b8b' ? '#ff8b8b' : '#dee1f9' }]}>{item.label}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color="rgba(201,196,216,0.25)" />
              </TouchableOpacity>
            ))}
          </GradientBorder>
        </View>

        {/* Legal links */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEGAL</Text>
          <GradientBorder colors={['rgba(201,191,255,0.2)', 'rgba(143,216,255,0.1)']} radius={20} borderWidth={1} innerStyle={{ overflow: 'hidden' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label, idx, arr) => (
              <TouchableOpacity key={label} style={[styles.row, idx < arr.length - 1 && styles.rowBorder]} activeOpacity={0.7}>
                <Text style={styles.legalLink}>{label}</Text>
                <Ionicons name="open-outline" size={14} color="#928ea1" />
              </TouchableOpacity>
            ))}
          </GradientBorder>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTop: { position: 'absolute', top: -60, left: '20%', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(74,222,128,0.05)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: {},
  backInner: { padding: 10 },
  headerTitle: { fontFamily: 'Sora_700Bold', fontSize: 17, color: '#dee1f9' },
  scroll: { paddingHorizontal: 20, gap: 20 },
  scoreInner: { padding: 18, gap: 14 },
  scoreLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scoreTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#dee1f9' },
  scoreSub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#928ea1', marginTop: 2 },
  scoreBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: 6, borderRadius: 3 },
  scorePercent: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#4ade80', minWidth: 40, textAlign: 'right' },
  section: { gap: 8 },
  sectionLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: 'rgba(146,142,161,0.7)', letterSpacing: 2, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontFamily: 'Manrope_500Medium', fontSize: 15, color: '#dee1f9' },
  rowSub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#928ea1' },
  legalLink: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#dee1f9', flex: 1 },
});
