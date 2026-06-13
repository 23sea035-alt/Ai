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

const CRISIS_RESOURCES = [
  { name: 'Crisis Text Line', detail: 'Text HOME to 741741', icon: '💬', color: '#8fd8ff' },
  { name: 'SAMHSA Helpline', detail: '1-800-662-4357 · Free & confidential', icon: '📞', color: '#4ade80' },
  { name: 'International Association', detail: 'findahelpline.com', icon: '🌐', color: '#c9bfff' },
];

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const [contentFilter, setContentFilter] = useState(true);
  const [safeMode, setSafeMode] = useState(false);
  const [crisisDetection, setCrisisDetection] = useState(true);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient colors={['#060a18', '#0B1020', '#0f1c30']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowTop} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <GradientBorder colors={['rgba(201,191,255,0.35)', 'rgba(143,216,255,0.15)']} radius={14} borderWidth={1} innerStyle={styles.backInner}>
            <Ionicons name="arrow-back" size={20} color="#dee1f9" />
          </GradientBorder>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Center</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <GradientBorder colors={['#8fd8ff88', '#4ade8044']} radius={20} borderWidth={1.5} innerStyle={styles.heroBanner}>
          <Text style={{ fontSize: 32 }}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Your safety matters</Text>
            <Text style={styles.heroSub}>Aura AI is designed with your wellbeing as our first priority.</Text>
          </View>
        </GradientBorder>

        {/* Safety toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTENT & INTERACTION</Text>
          <GradientBorder colors={['rgba(143,216,255,0.25)', 'rgba(74,222,128,0.12)']} radius={20} borderWidth={1} innerStyle={{ overflow: 'hidden' }}>
            {[
              { icon: '🔒', label: 'Content Filter', sub: 'Block potentially harmful topics', value: contentFilter, onChange: setContentFilter, color: '#4ade80' },
              { icon: '🌙', label: 'Safe Mode', sub: 'Enable stricter content boundaries', value: safeMode, onChange: setSafeMode, color: '#8fd8ff' },
              { icon: '💙', label: 'Crisis Detection', sub: 'Alert and provide resources when needed', value: crisisDetection, onChange: setCrisisDetection, color: '#c9bfff' },
            ].map((item, idx, arr) => (
              <View key={item.label} style={[styles.row, idx < arr.length - 1 && styles.rowBorder]}>
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

        {/* Crisis resources */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CRISIS RESOURCES</Text>
          <Text style={styles.crisisNote}>If you're in crisis, please reach out to a professional. These resources are always free and confidential.</Text>
          {CRISIS_RESOURCES.map((r) => (
            <GradientBorder key={r.name} colors={[r.color + '66', r.color + '22']} radius={16} borderWidth={1.5} innerStyle={styles.crisisCard}>
              <View style={[styles.iconBox, { backgroundColor: r.color + '20' }]}>
                <Text style={{ fontSize: 18 }}>{r.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.crisisName, { color: r.color }]}>{r.name}</Text>
                <Text style={styles.crisisDetail}>{r.detail}</Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={r.color + '80'} />
            </GradientBorder>
          ))}
        </View>

        {/* AI disclosure */}
        <GradientBorder colors={['rgba(201,191,255,0.2)', 'rgba(143,216,255,0.1)']} radius={18} borderWidth={1} innerStyle={styles.disclosureCard}>
          <Ionicons name="information-circle-outline" size={18} color="#8fd8ff" />
          <Text style={styles.disclosureText}>
            Aura AI companions are artificial intelligence — not real people. They are designed for companionship and support, not to replace professional care.
          </Text>
        </GradientBorder>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTop: { position: 'absolute', top: -50, left: '25%', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(143,216,255,0.06)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: {},
  backInner: { padding: 10 },
  headerTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#dee1f9' },
  scroll: { paddingHorizontal: 20, gap: 20 },
  heroBanner: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18 },
  heroTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: '#dee1f9' },
  heroSub: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: 'rgba(201,196,216,0.7)', marginTop: 4, lineHeight: 18 },
  section: { gap: 10 },
  sectionLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: 'rgba(146,142,161,0.7)', letterSpacing: 2, paddingHorizontal: 4 },
  crisisNote: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: 'rgba(201,196,216,0.6)', lineHeight: 19, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontFamily: 'Manrope_500Medium', fontSize: 15, color: '#dee1f9' },
  rowSub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#928ea1' },
  crisisCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  crisisName: { fontFamily: 'Sora_600SemiBold', fontSize: 14 },
  crisisDetail: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#928ea1', marginTop: 2 },
  disclosureCard: { flexDirection: 'row', gap: 12, padding: 16, alignItems: 'flex-start' },
  disclosureText: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: 'rgba(201,196,216,0.65)', lineHeight: 19, flex: 1 },
});
