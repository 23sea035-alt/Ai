import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraButton } from '@/components/AuraButton';
import { AuraOrb } from '@/components/AuraOrb';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'sparkles',
    orbFrom: '#c9bfff',
    orbTo: '#8fd8ff',
    title: 'Meet Your\nAI Companion',
    body: 'A sentient digital presence that understands you deeply, remembers your world, and evolves with every conversation.',
    label: 'POWERED BY LUMINOUS AI',
  },
  {
    id: '2',
    icon: 'infinite',
    orbFrom: '#8fd8ff',
    orbTo: '#00c1fd',
    title: 'Perfect\nMemory',
    body: 'Unlike other AI companions, Aura recalls facts about you across sessions — goals, preferences, and memories — with 90%+ recall accuracy.',
    label: 'BEST-IN-CLASS MEMORY',
  },
  {
    id: '3',
    icon: 'mic',
    orbFrom: '#ffb77d',
    orbTo: '#c9bfff',
    title: 'Voice-First\nConversation',
    body: 'Speak naturally. Aura listens, responds in real-time, and feels like a genuine conversation partner — not a chatbot.',
    label: 'NATURAL VOICE MODE',
  },
  {
    id: '4',
    icon: 'shield-checkmark',
    orbFrom: '#c9bfff',
    orbTo: '#ffb77d',
    title: 'Safe &\nTrustworthy',
    body: 'Full AI transparency, break reminders, and crisis support built in. Aura is designed to be your most trustworthy digital companion.',
    label: 'SAFETY FIRST',
  },
  {
    id: '5',
    icon: 'person-add',
    orbFrom: '#917eff',
    orbTo: '#8fd8ff',
    title: 'Create Your\nIdeal Companion',
    body: 'Shape their personality, backstory, and voice. Make Aura truly yours — a unique digital entity tailored to your lifestyle.',
    label: 'PERSONALIZATION',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.push('/age-verification');
    }
  };

  const skip = () => router.push('/age-verification');

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={['#0B1020', '#121A35', '#1A1F4B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Skip */}
      <View style={styles.header}>
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.orbWrapper}>
              <AuraOrb size={200} colorFrom={item.orbFrom} colorTo={item.orbTo} pulsate />
            </View>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* Dots + Next */}
      <View style={[styles.footer, { paddingBottom: bottomPad + 20 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>
        <AuraButton
          label={activeIndex === SLIDES.length - 1 ? "Let's Begin" : 'Continue'}
          onPress={goNext}
          style={styles.nextBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipBtn: { padding: 8 },
  skipText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#928ea1',
  },
  flatList: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  orbWrapper: { marginBottom: 8 },
  label: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#8fd8ff',
    letterSpacing: 2.5,
    opacity: 0.8,
  },
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 30,
    color: '#dee1f9',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: 'rgba(201,196,216,0.75)',
    textAlign: 'center',
    lineHeight: 23,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 20,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c9bfff',
  },
  nextBtn: { width: '100%' },
});
