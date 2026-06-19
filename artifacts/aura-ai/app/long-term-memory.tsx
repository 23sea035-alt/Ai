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
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MEMORY_ITEMS = [
  { label: 'Auto-sync Memories', desc: 'Continuously sync across all devices', key: 'autoSync' },
  { label: 'Cross-device Continuity', desc: 'Pick up conversations seamlessly', key: 'crossDevice' },
  { label: 'Backup to Cloud', desc: 'Encrypted cloud backup of all memory links', key: 'cloudBackup' },
];

function ToggleRow({ item, index, value, onToggle }: { item: typeof MEMORY_ITEMS[0]; index: number; value: boolean; onToggle: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: 400 + index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
      }}
    >
      <TouchableOpacity
        style={styles.toggleCard}
        activeOpacity={0.85}
        onPress={onToggle}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
      >
        <Animated.View style={[styles.toggleCardInner, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>{item.label}</Text>
            <Text style={styles.toggleDesc}>{item.desc}</Text>
          </View>
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: 'rgba(168,85,247,0.2)', true: 'rgba(168,85,247,0.5)' }}
            thumbColor={value ? '#c084fc' : '#555'}
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LongTermMemoryScreen() {
  const insets = useSafeAreaInsets();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    autoSync: true,
    crossDevice: true,
    cloudBackup: false,
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const topPad = Platform.OS === 'web' ? 14 : insets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.05)), useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleItem = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        start={{ x: 0.2, y: 0.3 }}
        end={{ x: 0.8, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <LinearGradient colors={['#c084fc', '#7c3aed']} style={styles.logoIcon}>
          <Ionicons name="bulb" size={20} color="#fff" />
        </LinearGradient>
        <Text style={styles.appName}>Aura AI</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: bottomPad, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.titleRow}>
            <Ionicons name="server-outline" size={24} color="#c084fc" />
            <Text style={styles.title}>Long-term Memory</Text>
          </View>
          <Text style={styles.subtitle}>Manage how your memories sync and persist across devices.</Text>

          <View style={styles.storageCard}>
            <Ionicons name="cloud-outline" size={32} color="#c084fc" />
            <Text style={styles.storageTitle}>Memory Storage</Text>
            <Text style={styles.storageDesc}>100GB · 24.5GB used</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <View style={styles.toggleList}>
            {MEMORY_ITEMS.map((item, i) => (
              <ToggleRow key={item.key} item={item} index={i} value={toggles[item.key]} onToggle={() => toggleItem(item.key)} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 30,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#fff',
    letterSpacing: -0.5,
    flex: 1,
  },

  content: { paddingTop: 12, gap: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(216,180,254,0.7)',
    lineHeight: 21,
  },

  storageCard: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
  },
  storageTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    color: '#fff',
  },
  storageDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(216,180,254,0.7)',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(168,85,247,0.15)',
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '24.5%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#c084fc',
  },

  toggleList: { gap: 14, marginTop: 8 },
  toggleCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
    backgroundColor: 'rgba(168,85,247,0.08)',
    overflow: 'hidden',
  },
  toggleCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  toggleInfo: { flex: 1, gap: 2 },
  toggleLabel: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  toggleDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(216,180,254,0.7)',
  },
});
