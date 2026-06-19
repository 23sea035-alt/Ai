import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  index: { focused: 'home', unfocused: 'home-outline' },
  chat: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  memory: { focused: 'server', unfocused: 'server-outline' },
  premium: { focused: 'diamond', unfocused: 'diamond-outline' },
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(216,180,254,0.6)',
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: isWeb ? 20 : insets.bottom + 8,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(25,20,45,0.85)',
          borderTopWidth: 0,
          borderRadius: RADIUS.full,
          height: isWeb ? 68 : 64,
          paddingVertical: 6,
          paddingHorizontal: 8,
          borderWidth: 1,
          borderColor: 'rgba(168,85,247,0.5)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Manrope_500Medium',
          fontSize: 10,
          marginTop: 0,
          letterSpacing: 0.3,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { borderRadius: RADIUS.full, backgroundColor: 'transparent' }]} />
        ),
        tabBarItemStyle: {
          borderRadius: RADIUS.full,
          paddingVertical: 8,
          paddingHorizontal: 4,
          marginHorizontal: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_ICONS.index.focused : TAB_ICONS.index.unfocused}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_ICONS.chat.focused : TAB_ICONS.chat.unfocused}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: 'Memory',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_ICONS.memory.focused : TAB_ICONS.memory.unfocused}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: 'Premium',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_ICONS.premium.focused : TAB_ICONS.premium.unfocused}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null, title: 'Profile' }} />
    </Tabs>
  );
}
