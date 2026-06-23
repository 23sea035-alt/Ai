import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  intensity?: number;
  noBorder?: boolean;
  shimmer?: boolean;
  glowColor?: string;
}

export function GlassCard({
  children,
  style,
  radius = 24,
  intensity = 20,
  noBorder = false,
  shimmer = false,
  glowColor,
}: GlassCardProps) {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shimmer) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 2,
            duration: 2800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(1800),
        ])
      ).start();
    }
    if (glowColor) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnim, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(borderAnim, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [shimmer, glowColor]);

  const inner = (
    <>
      {children}
      {shimmer && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: radius,
              overflow: 'hidden',
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [-1, 2],
                    outputRange: [-300, 300],
                  }),
                },
                { skewX: '-20deg' },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <View
            style={{
              width: 60,
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.07)',
            }}
          />
        </Animated.View>
      )}
    </>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[
          styles.glass,
          { borderRadius: radius },
          !noBorder && styles.border,
          glowColor && { borderColor: glowColor + '50' },
          style,
        ]}
      >
        {inner}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.glass,
        styles.androidGlass,
        { borderRadius: radius },
        !noBorder && styles.border,
        glowColor && { borderColor: glowColor + '50' },
        style,
      ]}
    >
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  androidGlass: {
    backgroundColor: 'rgba(20, 26, 46, 0.92)',
  },
  border: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
});
