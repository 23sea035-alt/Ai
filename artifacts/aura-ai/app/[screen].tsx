import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AuraButton } from '@/components/AuraButton';
import { DesignShell } from '@/components/DesignShell';
import { GlassCard } from '@/components/GlassCard';
import { SCREEN_DEFINITIONS } from '@/components/screenData';

export default function DynamicScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const screenKey = typeof params.screen === 'string' ? params.screen : '';
  const screen = SCREEN_DEFINITIONS[screenKey];

  if (!screen) {
    return (
      <DesignShell
        title="Screen Not Found"
        subtitle="This route does not exist yet"
        description={`No design screen was mapped for “${screenKey || 'unknown'}”.`}
      >
        <GlassCard intensity={18} radius={24}>
          <Text style={styles.detailText}>
            The screen key you requested is not part of the mapped design library. Use the screen map to browse available screens.
          </Text>
          <AuraButton label="Open Screen Map" onPress={() => router.push('/screen-map')} style={styles.button} />
        </GlassCard>
      </DesignShell>
    );
  }

  return (
    <DesignShell
      title={screen.title}
      subtitle={screen.label}
      description={screen.description}
      footer={
        <AuraButton
          label="Open Screen Map"
          onPress={() => router.push('/screen-map')}
          style={styles.button}
        />
      }
    >
      <GlassCard intensity={18} radius={20} style={styles.section}>
        <Text style={styles.sectionTitle}>Design Intent</Text>
        <Text style={styles.detailText}>This screen is styled to match the premium glassmorphism system with floating depth, subtle glow, and immersive gradients.</Text>
      </GlassCard>

      <GlassCard intensity={18} radius={20} style={styles.section}>
        <Text style={styles.sectionTitle}>Key details</Text>
        {screen.details.map((detail) => (
          <View key={detail} style={styles.detailRow}>
            <View style={styles.detailDot} />
            <Text style={styles.detailText}>{detail}</Text>
          </View>
        ))}
      </GlassCard>

      <GlassCard intensity={18} radius={20} style={styles.section}>
        <Text style={styles.sectionTitle}>Route</Text>
        <Text style={styles.detailText}>{`/${screenKey}`}</Text>
      </GlassCard>
    </DesignShell>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    color: '#DEE1F9',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8fd8ff',
    marginRight: 12,
  },
  detailText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#CED2EA',
    lineHeight: 22,
    opacity: 0.92,
    flex: 1,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
});
