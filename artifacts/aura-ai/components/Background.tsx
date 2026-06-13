import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface BackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'radial' | 'topRight';
}

export function Background({ children, variant = 'default' }: BackgroundProps) {
  const getColors = () => {
    switch (variant) {
      case 'topRight':
        return ['#1A1F4B', '#0e1323', '#080d1d'] as const;
      case 'radial':
        return ['#121A35', '#0e1323'] as const;
      default:
        return ['#0B1020', '#121A35', '#1A1F4B'] as const;
    }
  };

  const getLocations = () => {
    if (variant === 'default') return [0, 0.5, 1] as const;
    return undefined;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getColors()}
        locations={getLocations()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Ambient glow top-left */}
      <View style={styles.ambientTopLeft} pointerEvents="none" />
      {/* Ambient glow bottom-right */}
      <View style={styles.ambientBottomRight} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1323',
  },
  ambientTopLeft: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(201, 191, 255, 0.06)',
    // Note: React Native doesn't support filter:blur directly; use blurRadius on Image or expo-blur
  },
  ambientBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(143, 216, 255, 0.04)',
  },
});
