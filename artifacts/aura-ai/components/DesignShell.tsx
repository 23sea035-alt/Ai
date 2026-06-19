import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuraOrb } from '@/components/AuraOrb';
import { GlassCard } from '@/components/GlassCard';
import { ParticleField } from '@/components/ParticleField';
import { StarField } from '@/components/StarField';

interface DesignShellProps {
  title: string;
  subtitle?: string;
  label?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

export function DesignShell({ title, subtitle, label, description, children, footer, style }: DesignShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#060A18', '#0B1020', '#121A35', '#1A1F4B']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <StarField count={90} />
      <ParticleField count={22} />
      <View style={styles.ambientLeft} pointerEvents="none" />
      <View style={styles.ambientRight} pointerEvents="none" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            {label ? <Text style={styles.label}>{label.toUpperCase()}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
          <AuraOrb size={64} style={styles.heroOrb} />
        </View>

        <GlassCard style={styles.shellCard} intensity={28} shimmer>
          <View style={styles.inner}>{children}</View>
        </GlassCard>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    letterSpacing: 0.2,
    color: '#8fd8ff',
    opacity: 0.92,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Sora_700Bold',
    fontSize: 34,
    lineHeight: 42,
    color: '#DEE1F9',
  },
  subtitle: {
    marginTop: 10,
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
    color: '#C9C4D8',
    opacity: 0.94,
  },
  description: {
    marginTop: 12,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: '#CED2EA',
    opacity: 0.88,
  },
  heroOrb: {
    alignSelf: 'flex-start',
  },
  shellCard: {
    marginTop: 6,
    borderRadius: 28,
    padding: 18,
    overflow: 'hidden',
  },
  inner: {
    paddingBottom: 8,
  },
  footer: {
    marginTop: 18,
  },
  ambientLeft: {
    position: 'absolute',
    left: -80,
    top: 100,
    width: 260,
    height: 260,
    borderRadius: 160,
    backgroundColor: 'rgba(201,191,255,0.12)',
    shadowColor: '#c9bfff',
    shadowOpacity: 0.3,
    shadowRadius: 60,
  },
  ambientRight: {
    position: 'absolute',
    right: -100,
    top: 220,
    width: 280,
    height: 280,
    borderRadius: 160,
    backgroundColor: 'rgba(0,193,253,0.12)',
    shadowColor: '#00c1fd',
    shadowOpacity: 0.22,
    shadowRadius: 60,
  },
});
