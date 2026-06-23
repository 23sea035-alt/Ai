import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface AuraButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function AuraButton({ label, onPress, variant = 'primary', style, disabled, loading, icon }: AuraButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 340,
        friction: 20,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 340,
        friction: 20,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (variant === 'primary') {
    return (
      <Animated.View style={[styles.shadow, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={[styles.buttonBase, disabled && styles.disabled]}
        >
          <LinearGradient
            colors={['#c9bfff', '#9b8cff', '#8fd8ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text style={styles.primaryLabel}>{loading ? 'Loading…' : label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'gold') {
    return (
      <Animated.View style={[styles.shadowGold, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={[styles.buttonBase, disabled && styles.disabled]}
        >
          <LinearGradient
            colors={['#ffd87a', '#ffb77d', '#ff9f5a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text style={styles.goldLabel}>{loading ? 'Loading…' : label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'secondary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={[styles.buttonBase, styles.secondaryButton, disabled && styles.disabled]}
        >
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={styles.secondaryLabel}>{loading ? 'Loading…' : label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'danger') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={[styles.buttonBase, styles.dangerButton, disabled && styles.disabled]}
        >
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={styles.dangerLabel}>{loading ? 'Loading…' : label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.6}
      >
        <Text style={styles.ghostLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    height: 56,
    borderRadius: 999,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  shadow: {
    shadowColor: '#c9bfff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  shadowGold: {
    shadowColor: '#ffb77d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  primaryLabel: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    color: '#160050',
    letterSpacing: 0.2,
  },
  goldLabel: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    color: '#3a1a00',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: 'rgba(201,191,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,191,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryLabel: {
    fontFamily: 'Sora_500Medium',
    fontSize: 16,
    color: '#dee1f9',
  },
  dangerButton: {
    backgroundColor: 'rgba(255,100,90,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,100,90,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dangerLabel: {
    fontFamily: 'Sora_500Medium',
    fontSize: 16,
    color: '#ffb4ab',
  },
  ghostLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#928ea1',
    textDecorationLine: 'underline',
  },
  iconWrapper: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
});
