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
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const btnScale = useRef(new Animated.Value(1)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entryAnim]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#1A1F4B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />


      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerOrb} />
          <Text style={styles.headerTitle}>Safety Center</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.entryWrapper, {
        opacity: entryAnim,
        transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad, paddingHorizontal: SPACING.containerMargin, gap: SPACING.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Status Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.heroTitle}>Your Aura is Protected</Text>
              <Text style={styles.heroSub}>All safety systems are active and monitored.</Text>
            </View>
          </View>
        </View>

        {/* AI Disclosure */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI DISCLOSURE & GUIDELINES</Text>
          <View style={styles.disclosureCard}>
            <View style={styles.disclosureRow}>
              <Ionicons name="information-circle" size={20} color={COLORS.secondary} style={{ marginTop: 2 }} />
              <Text style={styles.disclosureText}>
                Aura is an advanced AI entity. While designed to be supportive, it can occasionally
                provide inaccurate or biased information. Use critical judgment for important decisions.
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Ionicons name="lock-closed" size={14} color={COLORS.primary} />
                <Text style={styles.chipLabel}>ENCRYPTION</Text>
                <Text style={styles.chipValue}>End-to-end secure</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="eye-off" size={14} color={COLORS.primary} />
                <Text style={styles.chipLabel}>PRIVACY</Text>
                <Text style={styles.chipValue}>Incognito options</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Data Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA CONTROLS</Text>
          <View style={styles.controlsGrid}>
            <TouchableOpacity activeOpacity={0.85} style={[styles.controlSmall, pressedItem === 'history' && { backgroundColor: `${COLORS.primary}15` }]} onPressIn={() => setPressedItem('history')} onPressOut={() => setPressedItem(null)}>
              <Ionicons name="time-outline" size={24} color={COLORS.accentGlow} />
              <Text style={styles.controlTitle}>Clear History</Text>
              <Text style={styles.controlSub}>Wipe recent interactions</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.controlSmall, pressedItem === 'memory' && { backgroundColor: `${COLORS.primary}15` }]} onPressIn={() => setPressedItem('memory')} onPressOut={() => setPressedItem(null)}>
              <Ionicons name="server" size={24} color={COLORS.accentGlow} />
              <Text style={styles.controlTitle}>Manage Memory</Text>
              <Text style={styles.controlSub}>Review stored context</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.controlFull, pressedItem === 'export' && { backgroundColor: `${COLORS.primary}15` }]} onPressIn={() => setPressedItem('export')} onPressOut={() => setPressedItem(null)}>
              <View style={styles.controlFullLeft}>
                <Ionicons name="download" size={20} color={COLORS.secondary} />
                <View>
                  <Text style={styles.controlFullTitle}>Export Your Data</Text>
                  <Text style={styles.controlFullSub}>Download all archived conversations</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support & Emergency */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUPPORT & EMERGENCY</Text>
          <View style={styles.supportCard}>
            <TouchableOpacity activeOpacity={0.85} style={[styles.supportRow, pressedItem === 'crisis' && { backgroundColor: `${COLORS.primary}15` }]} onPressIn={() => setPressedItem('crisis')} onPressOut={() => setPressedItem(null)}>
              <View style={styles.supportLeft}>
                <Ionicons name="megaphone" size={20} color={COLORS.error} />
                <Text style={styles.supportText}>Crisis Resources</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={COLORS.outline} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity activeOpacity={0.85} style={[styles.supportRow, pressedItem === 'help' && { backgroundColor: `${COLORS.primary}15` }]} onPressIn={() => setPressedItem('help')} onPressOut={() => setPressedItem(null)}>
              <View style={styles.supportLeft}>
                <Ionicons name="headset" size={20} color={COLORS.primary} />
                <Text style={styles.supportText}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity activeOpacity={0.85} style={[styles.supportRow, pressedItem === 'privacy' && { backgroundColor: `${COLORS.primary}15` }]} onPressIn={() => setPressedItem('privacy')} onPressOut={() => setPressedItem(null)}>
              <View style={styles.supportLeft}>
                <Ionicons name="scale" size={20} color={COLORS.tertiary} />
                <Text style={styles.supportText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Button */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity activeOpacity={0.9} style={styles.emergencyBtn} onPressIn={() => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start()} onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()}>
            <Ionicons name="warning" size={22} color="#ffdad6" />
            <Text style={styles.emergencyText}>Emergency Assistance</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  entryWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.containerMargin,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassStroke,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: COLORS.primary,
  },
  heroCard: {
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    borderRadius: RADIUS.lg,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(201,191,255,0.2)',
  },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroIconWrap: {
    padding: 12,
    backgroundColor: 'rgba(201,191,255,0.1)',
    borderRadius: RADIUS.xxl,
  },
  heroTitle: {
    fontFamily: 'Sora_500Medium',
    fontSize: 20,
    color: COLORS.primary,
  },
  heroSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  section: { gap: 12 },
  sectionLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    letterSpacing: 2.4,
    color: COLORS.outline,
    paddingHorizontal: 4,
  },
  disclosureCard: {
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    borderRadius: RADIUS.lg,
    padding: 20,
    gap: 16,
  },
  disclosureRow: { flexDirection: 'row', gap: 12 },
  disclosureText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: COLORS.onSurface,
    flex: 1,
    lineHeight: 22,
  },
  divider: { height: 1, backgroundColor: COLORS.glassStroke },
  chipRow: { flexDirection: 'row', gap: 12 },
  chip: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    gap: 6,
  },
  chipLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.outline,
  },
  chipValue: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: COLORS.onSurface,
  },
  controlsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  controlSmall: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    borderRadius: RADIUS.lg,
    padding: 16,
    gap: 8,
  },
  controlTitle: {
    fontFamily: 'Sora_500Medium',
    fontSize: 16,
    color: COLORS.onSurface,
  },
  controlSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  controlFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    borderRadius: RADIUS.lg,
    padding: 16,
  },
  controlFullLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  controlFullTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    color: COLORS.onSurface,
  },
  controlFullSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  supportCard: {
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  supportLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  supportText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    color: COLORS.onSurface,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.errorContainer,
  },
  emergencyText: {
    fontFamily: 'Sora_500Medium',
    fontSize: 16,
    color: '#ffdad6',
  },
});
