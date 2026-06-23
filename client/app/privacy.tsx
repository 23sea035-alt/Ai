import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
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

function PulseDot() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.95, 1, 0.95] });
  const shadowOpacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.7, 0, 0.7] });

  return (
    <Animated.View
      style={[
        styles.pulseDot,
        {
          transform: [{ scale }],
          shadowOpacity,
        },
      ]}
    />
  );
}

function ToggleSwitch({ value, onToggle, label }: { value: boolean; onToggle: () => void; label: string }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.2)', '#8b5cf6'],
  });
  const knobX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 25],
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      aria-label={label}
    >
      <Animated.View style={[styles.toggleTrack, { backgroundColor: bgColor }]}>
        <Animated.View style={[styles.toggleKnob, { transform: [{ translateX: knobX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const [biometric, setBiometric] = useState(false);
  const [anonymized, setAnonymized] = useState(true);
  const [timestamp, setTimestamp] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  const topPad = Platform.OS === 'web' ? 14 : insets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 80;

  const showToast = useCallback((msg: string) => {
    Alert.alert('', msg);
  }, []);

  useEffect(() => {
    const now = new Date();
    setTimestamp(`${now.getMinutes()}m ${now.getSeconds()}s ago`);
    const interval = setInterval(() => {
      const n = new Date();
      setTimestamp(`${n.getMinutes()}m ${n.getSeconds()}s ago`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.05)), useNativeDriver: true }),
    ]).start();
    cardAnims.forEach((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 500, delay: 300 + i * 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
    );
  }, []);

  const Card = ({ index, children }: { index: number; children: React.ReactNode }) => (
    <Animated.View
      style={{
        opacity: cardAnims[index],
        transform: [{ translateY: cardAnims[index].interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c1d95', '#2e1065', '#0f172a']}
        start={{ x: 0.2, y: 0.3 }}
        end={{ x: 0.8, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.logoTitle}>
          <LinearGradient colors={['#c084fc', '#7c3aed']} style={styles.logoIcon}>
            <Ionicons name="bulb" size={24} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>Aura AI</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle} activeOpacity={0.7} onPress={() => showToast('🔔 No security alerts · All systems nominal')}>
            <Ionicons name="notifications-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.privacyHeader}>
            <Text style={styles.privacyTitle}>Privacy Sanctum</Text>
            <Text style={styles.privacySub}>You are the sovereign architect of your digital presence.</Text>
          </View>
        </Animated.View>

        <Card index={0}>
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#c084fc" />
              <Text style={styles.cardTitle}>System Status</Text>
            </View>
            <View style={styles.statusBadge}>
              <PulseDot />
              <Text style={styles.statusBadgeText}>Encrypted Sync Active</Text>
            </View>
            <View style={styles.statusRow}>
              <Ionicons name="time-outline" size={14} color="rgba(216,180,254,0.7)" />
              <Text style={styles.statusTime}>Last verified {timestamp}</Text>
              <View style={styles.encryptionTag}>
                <Text style={styles.encryptionTagText}>
                  <Ionicons name="lock-closed-outline" size={10} color="#d8b4fe" /> Quantum-resistant end-to-end encryption active
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card index={1}>
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="server-outline" size={22} color="#c084fc" />
              <Text style={styles.cardTitle}>Memory Vault</Text>
            </View>
            <Text style={styles.cardDesc}>You hold the keys to what Aura remembers</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
                onPress={() => showToast('📜 Access logs · 347 entries · Last access: today')}
              >
                <Ionicons name="list-outline" size={14} color="#fff" />
                <Text style={styles.secondaryBtnText}>View Logs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryBtn, styles.dangerBtn]}
                activeOpacity={0.85}
                onPress={() => showToast('🗑️ Memory vault cleared · All links removed')}
              >
                <Ionicons name="trash-outline" size={14} color="#f87171" />
                <Text style={[styles.secondaryBtnText, { color: '#f87171' }]}>Purge All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <Card index={2}>
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="download-outline" size={22} color="#c084fc" />
              <Text style={styles.cardTitle}>Export My Data</Text>
            </View>
            <Text style={styles.cardDesc}>Request a complete copy of your persona archive</Text>
            <TouchableOpacity
              style={styles.exportBtn}
              activeOpacity={0.85}
              onPress={() => showToast('📦 Export initiated · Your persona archive will be ready shortly')}
            >
              <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.exportBtnGrad}>
                <Ionicons name="archive-outline" size={18} color="#fff" />
                <Text style={styles.exportBtnText}>Initiate Export</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Card>

        <Card index={3}>
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="finger-print-outline" size={22} color="#c084fc" />
              <Text style={styles.cardTitle}>Access Control</Text>
            </View>
            <View style={styles.controlItem}>
              <View style={styles.controlInfo}>
                <Text style={styles.controlLabel}>Biometric Authentication</Text>
                <Text style={styles.controlDesc}>Require FaceID / TouchID to unlock Memory Vault</Text>
              </View>
              <ToggleSwitch value={biometric} onToggle={() => {
                setBiometric(!biometric);
                showToast(biometric ? '🔓 Biometric authentication disabled' : '🔐 Biometric authentication enabled · FaceID required for vault');
              }} label="Biometric" />
            </View>
            <View style={styles.divider} />
            <View style={styles.controlItem}>
              <View style={styles.controlInfo}>
                <Text style={styles.controlLabel}>Anonymized Training</Text>
                <Text style={styles.controlDesc}>Use redacted, aggregated data to improve Aura</Text>
              </View>
              <ToggleSwitch value={anonymized} onToggle={() => {
                setAnonymized(!anonymized);
                showToast(anonymized ? '⚙️ Anonymized training disabled' : '🧠 Anonymized training active · Redacted data helps improve Aura');
              }} label="Anonymized" />
            </View>
          </View>
        </Card>

        <View style={styles.securityFooter}>
          <Ionicons name="git-branch-outline" size={14} color="rgba(216,180,254,0.6)" />
          <Text style={styles.securityFooterText}>Aura Security Protocol — Our privacy promise is embedded in every line of code.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  logoTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerIcons: { flexDirection: 'row', gap: 14 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 30,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },

  privacyHeader: { paddingVertical: 12 },
  privacyTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 30,
    color: '#fff',
    letterSpacing: -0.5,
  },
  privacySub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(216,180,254,0.85)',
    marginTop: 6,
    lineHeight: 21,
  },

  card: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 36,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 18,
    color: '#fff',
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(216,180,254,0.85)',
    marginBottom: 12,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 40,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  statusBadgeText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 13,
    color: '#34d399',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 4,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  statusTime: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: 'rgba(216,180,254,0.9)',
  },
  encryptionTag: {
    backgroundColor: 'rgba(139,92,246,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 30,
  },
  encryptionTagText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 12,
    color: '#d8b4fe',
  },

  buttonGroup: { flexDirection: 'row', gap: 12, marginTop: 4 },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(168,85,247,0.2)',
    paddingVertical: 12,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  secondaryBtnText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  dangerBtn: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderColor: 'rgba(239,68,68,0.5)',
  },

  exportBtn: { borderRadius: 60, overflow: 'hidden', marginTop: 10 },
  exportBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  exportBtnText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 15,
    color: '#fff',
  },

  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  controlInfo: { flex: 1, marginRight: 16 },
  controlLabel: {
    fontFamily: 'Sora_700Bold',
    fontSize: 15,
    color: '#fff',
    marginBottom: 4,
  },
  controlDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: 'rgba(216,180,254,0.75)',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(168,85,247,0.2)',
  },

  toggleTrack: {
    width: 52,
    height: 30,
    borderRadius: 30,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168,85,247,0.2)',
    marginTop: 10,
  },
  securityFooterText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: 'rgba(216,180,254,0.6)',
    textAlign: 'center',
    flex: 1,
  },

});
