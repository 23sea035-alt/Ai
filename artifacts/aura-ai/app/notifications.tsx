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

const now = new Date();
const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const NOTIFICATIONS = [
  {
    category: 'Companions',
    icon: 'sparkles',
    color: COLORS.primary,
    active: '2 Active',
    items: [
      {
        type: 'avatar',
        title: 'Aurora',
        time: 'Just now',
        body: '"Aurora is thinking of you. She\'s analyzed your dream logs and has a suggestion for tonight\'s atmosphere."',
        actions: true,
      },
      {
        type: 'icon',
        icon: 'neurology',
        iconColor: COLORS.secondary,
        title: 'Weekly Insight',
        time: '2h ago',
        body: 'Weekly Insight ready: Your cognitive baseline increased by 12% this week. View the full synthesis.',
        actions: false,
      },
    ],
  },
  {
    category: 'System',
    icon: 'settings-input-component',
    color: COLORS.secondary,
    items: [
      {
        type: 'icon',
        icon: 'update',
        iconColor: COLORS.tertiary,
        title: 'Neural Kernel Update',
        time: '4h ago',
        body: 'A new intelligence layer (v4.2.1) is ready for deployment. Requires restart of background threads.',
        actions: false,
      },
    ],
  },
  {
    category: 'Security',
    icon: 'shield-checkmark',
    color: COLORS.error,
    items: [
      {
        type: 'icon',
        icon: 'shield-person',
        iconColor: COLORS.error,
        title: 'Privacy Alert',
        time: 'Yesterday',
        body: 'Unrecognized device attempted to access Aura\'s consciousness sync in Tokyo, JP.',
        actions: false,
        leftBorder: true,
      },
    ],
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [time, setTime] = useState(timeStr);
  const [date, setDate] = useState(dateStr);
  const [pressedItem, setPressedItem] = useState<number | null>(null);
  const btnScale = useRef(new Animated.Value(1)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      setTime(n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDate(n.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entryAnim]);

  const topPad = Platform.OS === 'web' ? 60 : insets.top + 12;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>


      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerOrb}>
            <LinearGradient
              colors={['#c9bfff', '#8fd8ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
          <Text style={styles.headerTitle}>AURA</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.entryWrapper, {
        opacity: entryAnim,
        transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad, paddingHorizontal: SPACING.containerMargin }}
        showsVerticalScrollIndicator={false}
      >
        {/* Date/Time */}
        <View style={styles.timeSection}>
          <Text style={styles.timeDisplay}>{time}</Text>
          <Text style={styles.dateDisplay}>{date}</Text>
        </View>

        {/* Notification Categories */}
        <View style={styles.notifList}>
          {NOTIFICATIONS.map((section) => (
            <View key={section.category} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name={section.icon as any} size={16} color={section.color} />
                  <Text style={[styles.sectionTitle, { color: section.color }]}>
                    {section.category.toUpperCase()}
                  </Text>
                </View>
                {section.active && (
                  <Text style={styles.sectionActive}>{section.active}</Text>
                )}
              </View>

              <View style={styles.notifCards}>
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.notifCard,
                      (item as any).leftBorder && styles.notifCardAlert,
                      pressedItem === idx && { backgroundColor: `${COLORS.primary}15` },
                    ]}
                    activeOpacity={0.85}
                    onPressIn={() => setPressedItem(idx)}
                    onPressOut={() => setPressedItem(null)}
                  >
                    <View
                      style={[
                        styles.notifIcon,
                        item.type === 'avatar' && styles.notifAvatar,
                      ]}
                    >
                      {(item as any).iconColor ? (
                        <Ionicons
                          name={(item as any).icon as any}
                          size={22}
                          color={(item as any).iconColor}
                        />
                      ) : (
                        <LinearGradient
                          colors={['rgba(201,191,255,0.2)', 'transparent']}
                          style={StyleSheet.absoluteFillObject}
                        />
                      )}
                    </View>
                    <View style={styles.notifBody}>
                      <View style={styles.notifHeader}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.notifTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.notifText} numberOfLines={2}>
                        {item.body}
                      </Text>
                      {(item as any).actions && (
                        <View style={styles.notifActions}>
                          <TouchableOpacity style={styles.notifActionPrimary} activeOpacity={0.7}>
                            <Text style={styles.notifActionPrimaryText}>Listen</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.notifActionSecondary} activeOpacity={0.7}>
                            <Text style={styles.notifActionSecondaryText}>Dismiss</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Clear History */}
        <View style={styles.clearRow}>
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity style={styles.clearBtn} activeOpacity={0.9} onPressIn={() => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start()} onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()}>
              <Ionicons name="time-outline" size={18} color={COLORS.outline} />
              <Text style={styles.clearText}>Clear History</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  entryWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.containerMargin,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassStroke,
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: -1,
  },
  timeSection: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  timeDisplay: {
    fontFamily: 'Sora_700Bold',
    fontSize: 48,
    color: COLORS.onSurface,
  },
  dateDisplay: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    letterSpacing: 1.5,
    color: 'rgba(201,196,216,0.6)',
    textTransform: 'uppercase',
  },
  notifList: { gap: 32 },
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    letterSpacing: 2,
  },
  sectionActive: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: 'rgba(201,196,216,0.5)',
  },
  notifCards: { gap: 8 },
  notifCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    backgroundColor: COLORS.glassFill,
  },
  notifCardAlert: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,180,171,0.4)',
  },
  notifIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  notifAvatar: {},
  notifBody: { flex: 1, gap: 4 },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notifTitle: {
    fontFamily: 'Sora_500Medium',
    fontSize: 16,
    color: COLORS.onSurface,
  },
  notifTime: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: 'rgba(201,196,216,0.4)',
  },
  notifText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: 'rgba(201,196,216,0.7)',
    lineHeight: 22,
  },
  notifActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  notifActionPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(201,191,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,191,255,0.2)',
  },
  notifActionPrimaryText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: COLORS.primary,
  },
  notifActionSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.glassFill,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
  },
  notifActionSecondaryText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: 'rgba(201,196,216,0.7)',
  },
  clearRow: { alignItems: 'center', paddingVertical: 24 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassStroke,
    backgroundColor: COLORS.glassFill,
  },
  clearText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: COLORS.outline,
  },
});
