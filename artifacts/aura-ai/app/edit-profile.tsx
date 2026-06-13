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
import { CompanionAvatar } from '@/components/CompanionAvatar';
import { GradientBorder } from '@/components/GradientBorder';
import { useApp } from '@/context/AppContext';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [bioFocused, setBioFocused] = useState(false);
  const [saved, setSaved] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const handleSave = () => {
    if (!name.trim()) { return; }
    updateUser({ name: name.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => { setSaved(false); router.back(); }, 800);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={['#060a18', '#0B1020', '#121A35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glowTop} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <GradientBorder colors={['rgba(201,191,255,0.35)', 'rgba(143,216,255,0.15)']} radius={14} borderWidth={1} innerStyle={styles.backInner}>
            <Ionicons name="arrow-back" size={20} color="#dee1f9" />
          </GradientBorder>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <GradientBorder colors={['#c9bfff', '#8fd8ff', '#B388FF']} radius={60} borderWidth={2.5}>
            <View style={{ padding: 4 }}>
              <CompanionAvatar seed={name || user?.name || 'User'} size={96} colorFrom="#c9bfff" colorTo="#8fd8ff" />
            </View>
          </GradientBorder>
          <TouchableOpacity style={styles.changeAvatarBtn} activeOpacity={0.7}>
            <LinearGradient colors={['#c9bfff', '#8fd8ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.changeAvatarGrad}>
              <Ionicons name="camera-outline" size={14} color="#160050" />
              <Text style={styles.changeAvatarText}>Change Avatar</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Your avatar updates as you type your name</Text>
        </View>

        {/* Fields */}
        <View style={styles.fieldsSection}>
          <Text style={styles.sectionLabel}>PERSONAL INFO</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Display Name</Text>
            <GradientBorder
              colors={nameFocused ? ['#c9bfff', '#8fd8ff'] : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.06)']}
              radius={16}
              borderWidth={nameFocused ? 1.5 : 1}
              innerStyle={styles.fieldInner}
            >
              <View style={[styles.fieldIconBox, { backgroundColor: nameFocused ? '#c9bfff22' : 'transparent' }]}>
                <Ionicons name="person-outline" size={17} color={nameFocused ? '#c9bfff' : '#928ea1'} />
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="rgba(146,142,161,0.45)"
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </GradientBorder>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <GradientBorder
              colors={emailFocused ? ['#c9bfff', '#8fd8ff'] : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.06)']}
              radius={16}
              borderWidth={emailFocused ? 1.5 : 1}
              innerStyle={styles.fieldInner}
            >
              <View style={[styles.fieldIconBox, { backgroundColor: emailFocused ? '#c9bfff22' : 'transparent' }]}>
                <Ionicons name="mail-outline" size={17} color={emailFocused ? '#c9bfff' : '#928ea1'} />
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="rgba(146,142,161,0.45)"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </GradientBorder>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Bio <Text style={styles.fieldLabelOptional}>(optional)</Text></Text>
            <GradientBorder
              colors={bioFocused ? ['#c9bfff', '#8fd8ff'] : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.06)']}
              radius={16}
              borderWidth={bioFocused ? 1.5 : 1}
              innerStyle={styles.bioInner}
            >
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell your companions about yourself…"
                placeholderTextColor="rgba(146,142,161,0.45)"
                multiline
                numberOfLines={3}
                onFocus={() => setBioFocused(true)}
                onBlur={() => setBioFocused(false)}
              />
            </GradientBorder>
          </View>
        </View>

        {/* Stats badges */}
        <View style={styles.statsRow}>
          {[
            { label: 'Member Since', value: 'Jun 2026', color: '#c9bfff', icon: '📅' },
            { label: 'Status', value: user?.isPremium ? 'Premium' : 'Free', color: user?.isPremium ? '#ffb77d' : '#8fd8ff', icon: user?.isPremium ? '👑' : '✨' },
          ].map((s) => (
            <GradientBorder key={s.label} colors={[s.color + '88', s.color + '30']} radius={16} borderWidth={1.5} innerStyle={styles.statBadgeInner} style={{ flex: 1 }}>
              <Text style={{ fontSize: 16 }}>{s.icon}</Text>
              <Text style={[styles.statBadgeVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statBadgeLabel}>{s.label}</Text>
            </GradientBorder>
          ))}
        </View>

        <AuraButton
          label={saved ? '✓ Saved!' : 'Save Changes'}
          onPress={handleSave}
          style={styles.saveBtn}
        />

        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn} activeOpacity={0.6}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a18' },
  glowTop: { position: 'absolute', top: -60, left: '20%', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(201,191,255,0.07)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: {},
  backInner: { padding: 10 },
  headerTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#dee1f9' },
  scroll: { paddingHorizontal: 20, gap: 24 },
  avatarSection: { alignItems: 'center', gap: 14, paddingTop: 8 },
  changeAvatarBtn: { borderRadius: 999, overflow: 'hidden' },
  changeAvatarGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
  changeAvatarText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#160050' },
  avatarHint: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(146,142,161,0.5)', textAlign: 'center' },
  fieldsSection: { gap: 16 },
  sectionLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: 'rgba(146,142,161,0.7)', letterSpacing: 2, textTransform: 'uppercase', paddingHorizontal: 4 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#dee1f9', paddingHorizontal: 4 },
  fieldLabelOptional: { fontFamily: 'Manrope_400Regular', color: '#928ea1' },
  fieldInner: { flexDirection: 'row', alignItems: 'center', height: 54, paddingHorizontal: 4, gap: 8 },
  fieldIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  input: { flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 15, color: '#dee1f9', paddingRight: 14 },
  bioInner: { padding: 14 },
  bioInput: { fontFamily: 'Manrope_400Regular', fontSize: 15, color: '#dee1f9', minHeight: 80, textAlignVertical: 'top' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBadgeInner: { padding: 14, alignItems: 'center', gap: 4 },
  statBadgeVal: { fontFamily: 'Sora_600SemiBold', fontSize: 15 },
  statBadgeLabel: { fontFamily: 'Manrope_400Regular', fontSize: 11, color: '#928ea1' },
  saveBtn: {},
  cancelBtn: { alignItems: 'center', paddingVertical: 4 },
  cancelText: { fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#928ea1' },
});
