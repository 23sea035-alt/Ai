import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ColorValue, View, ViewStyle } from 'react-native';

interface GradientBorderProps {
  children: React.ReactNode;
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  radius?: number;
  borderWidth?: number;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  innerBg?: string;
}

export function GradientBorder({
  children,
  colors = ['#c9bfff', '#8fd8ff'],
  radius = 20,
  borderWidth = 1.5,
  style,
  innerStyle,
  innerBg = 'rgba(12,17,36,0.97)',
}: GradientBorderProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius, padding: borderWidth }, style]}
    >
      <View
        style={[
          {
            borderRadius: Math.max(0, radius - borderWidth),
            backgroundColor: innerBg,
            overflow: 'hidden',
          },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}
