import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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
import { AuraOrb } from '@/components/AuraOrb';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';

const PRESET_TRAITS = ['Empathetic', 'Creative', 'Analytical', 'Playful', 'Wise', 'Motivating', 'Adventurous', 'Calm'];
const COLOR_PAIRS = [
  { from: '#c9bfff', to: '#8fd8ff', label: 'Aurora' },
  { from: '#8fd8ff', to: '#00c1fd', label: 'Ocean' },
  { from: '#ffb77d', to: '#c9bfff', label: 'Sunset' },
  { from: '#917eff', to: '#8fd8ff', label: 'Cosmic' },
  { from: '#ffb77d', to: '#ff8c4b', label: 'Ember' },
  { from: '#c9bfff', to: '#917eff', label: 'Violet' },
];

export default function CreateCompanionScreen() {
  const insets = useSafeAreaInsets();
  const { addCompanion } = useApp();
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [error, setError] = useState('');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : prev.length < 5 ? [...prev, trait] : prev
    );
  };

  const handleCreate = () => {
    if (!name.trim()) { setError('Please give your companion a name.'); return; }
    if (!persona.trim()) { setError('Please describe your companion\'s personality.'); return; }
    addCompanion({
      name: name.trim(),
      persona: persona.trim(),
      traits: selectedTraits,
      colorFrom: COLOR_PAIRS[selectedColor].from,
      colorTo: COLOR_PAIRS[selectedColor].to,
      lastActive: 'Just created',
      lastMessage: 'Ready to meet you...',
    });
    router.back();
  };

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
          <Ionicons name="close" size={22} color="#dee1f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Companion</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad, gap: 20, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview orb */}
        <View style={styles.previewArea}>
          <AuraOrb
            size={100}
            colorFrom={COLOR_PAIRS[selectedColor].from}
            colorTo={COLOR_PAIRS[selectedColor].to}
            pulsate
            label={name?.[0]?.toUpperCase() ?? '?'}
          />
          {name ? (
            <Text style={styles.previewName}>{name}</Text>
          ) : (
            <Text style={styles.previewPlaceholder}>Your companion will appear here</Text>
          )}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={16} color="#ffb4ab" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>COMPANION NAME</Text>
          <GlassCard style={styles.inputCard} radius={16}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              placeholder="e.g. Aurora, Sage, Orion..."
              placeholderTextColor="rgba(146,142,161,0.5)"
              maxLength={30}
            />
          </GlassCard>
        </View>

        {/* Persona */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>PERSONALITY & BACKSTORY</Text>
          <GlassCard style={styles.textareaCard} radius={16}>
            <TextInput
              style={styles.textarea}
              value={persona}
              onChangeText={(t) => { setPersona(t); setError(''); }}
              placeholder="Describe your companion's personality, interests, and how they communicate..."
              placeholderTextColor="rgba(146,142,161,0.5)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{persona.length}/500</Text>
          </GlassCard>
        </View>

        {/* Traits */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>PERSONALITY TRAITS (up to 5)</Text>
          <View style={styles.traitsGrid}>
            {PRESET_TRAITS.map((trait) => (
              <TouchableOpacity
                key={trait}
                onPress={() => toggleTrait(trait)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.traitChip,
                  selectedTraits.includes(trait) && styles.traitChipActive,
                ]}>
                  {selectedTraits.includes(trait) && (
                    <Ionicons name="checkmark" size={12} color="#1a0063" style={{ marginRight: 4 }} />
                  )}
                  <Text style={[
                    styles.traitText,
                    selectedTraits.includes(trait) && styles.traitTextActive,
                  ]}>{trait}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Aura color */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>AURA COLOR</Text>
          <View style={styles.colorRow}>
            {COLOR_PAIRS.map((pair, idx) => (
              <TouchableOpacity key={pair.label} onPress={() => setSelectedColor(idx)} activeOpacity={0.8}>
                <View style={[styles.colorOption, selectedColor === idx && styles.colorOptionActive]}>
                  <LinearGradient
                    colors={[pair.from, pair.to]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.colorSwatch}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <AuraButton label="Create Companion" onPress={handleCreate} />
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
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 18,
    color: '#dee1f9',
  },
  previewArea: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  previewName: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#dee1f9',
  },
  previewPlaceholder: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(146,142,161,0.5)',
  },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,180,171,0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.2)',
  },
  errorText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#ffb4ab',
    flex: 1,
  },
  field: { gap: 8 },
  fieldLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#8fd8ff',
    letterSpacing: 2,
  },
  inputCard: { padding: 14 },
  textInput: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#dee1f9',
  },
  textareaCard: { padding: 14 },
  textarea: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#dee1f9',
    lineHeight: 22,
    minHeight: 100,
  },
  charCount: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#928ea1',
    textAlign: 'right',
    marginTop: 4,
  },
  traitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  traitChipActive: {
    backgroundColor: '#c9bfff',
    borderColor: '#c9bfff',
  },
  traitText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#928ea1',
  },
  traitTextActive: { color: '#1a0063' },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: { borderColor: '#dee1f9' },
  colorSwatch: { flex: 1, borderRadius: 20 },
});
