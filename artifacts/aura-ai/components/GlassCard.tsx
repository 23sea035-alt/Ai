import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  radius?: number;
  intensity?: number;
  noBorder?: boolean;
}

export function GlassCard({ children, style, radius = 24, intensity = 20, noBorder = false }: GlassCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[
          styles.glass,
          { borderRadius: radius },
          !noBorder && styles.border,
          style,
        ]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.glass, styles.androidGlass, { borderRadius: radius }, !noBorder && styles.border, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  androidGlass: {
    backgroundColor: 'rgba(22, 27, 43, 0.90)',
  },
  border: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
});
