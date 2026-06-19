import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DesignShell } from '@/components/DesignShell';
import { SCREEN_DEFINITIONS } from '@/components/screenData';

export default function ScreenMap() {
  const router = useRouter();
  const screens = Object.entries(SCREEN_DEFINITIONS);

  return (
    <DesignShell
      title="Screen Map"
      subtitle="All mapped UI/UX screens"
      description="Open any design screen to review the current implementation and validate the route mapping."
    >
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {screens.map(([key, screen]) => (
          <TouchableOpacity
            key={key}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/${key}`)}
          >
            <Text style={styles.cardLabel}>{screen.label}</Text>
            <Text style={styles.cardTitle}>{screen.title}</Text>
            <Text style={styles.cardRoute}>{`/${key}`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </DesignShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  cardLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#8fd8ff',
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    color: '#DEE1F9',
    marginBottom: 8,
  },
  cardRoute: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#C9C4D8',
    opacity: 0.88,
  },
});
