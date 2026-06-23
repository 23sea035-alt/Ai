import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PROMPTS = [
  'What moment shaped your perspective today?',
  'Describe a feeling words can barely touch.',
  'What constellation of thoughts is orbiting your mind?',
  'If today had a color, what would it be and why?',
  'What quiet insight is whispering to you right now?',
];

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const topPad = Platform.OS === 'web' ? 14 : insets.top + 10;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.05)), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSave = () => {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
            <View style={styles.starSection}>
              <Ionicons name="star-outline" size={48} color="#fbbf24" />
              <Text style={styles.starLabel}>New Memory</Text>
            </View>

            <Text style={styles.heading}>Weave a New Thread</Text>
            <Text style={styles.subheading}>
              Every thought you capture becomes a star in our constellation.
            </Text>

            <View style={styles.promptCard}>
              <Ionicons name="sparkles-outline" size={18} color="#c084fc" />
              <Text style={styles.promptText}>{prompt}</Text>
            </View>

            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                value={text}
                onChangeText={setText}
                placeholder="Write your reflection..."
                placeholderTextColor="rgba(216,180,254,0.4)"
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              onPressIn={() => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start()}
            >
              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <LinearGradient colors={['#8b5cf6', '#a855f7']} style={styles.saveBtn}>
                  <Ionicons name={saved ? 'checkmark-circle' : 'cloud-upload-outline'} size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>{saved ? 'Memory Woven' : 'Save to Timeline'}</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            {saved && (
              <Animated.View style={styles.savedToast}>
                <Ionicons name="sparkles" size={16} color="#fbbf24" />
                <Text style={styles.savedText}>Your memory has been woven into the tapestry</Text>
              </Animated.View>
            )}

            <View style={styles.inspireRow}>
              <Ionicons name="infinite-outline" size={16} color="rgba(216,180,254,0.5)" />
              <Text style={styles.inspireText}>The journey is the destination</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  content: { paddingTop: 12, gap: 16 },
  starSection: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  starLabel: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 13,
    color: '#fbbf24',
    letterSpacing: 2,
  },
  heading: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    color: '#fff',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subheading: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: 'rgba(216,180,254,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  promptCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  promptText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    flex: 1,
    fontStyle: 'italic',
  },

  inputCard: {
    backgroundColor: 'rgba(168,85,247,0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
    padding: 4,
    minHeight: 160,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    padding: 16,
    minHeight: 150,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 40,
    marginTop: 8,
  },
  saveBtnText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },

  savedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(139,92,246,0.25)',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.5)',
  },
  savedText: {
    fontFamily: 'Sora_500Medium',
    fontSize: 13,
    color: '#e9d5ff',
  },

  inspireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  inspireText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: 'rgba(216,180,254,0.5)',
    fontStyle: 'italic',
  },
});
