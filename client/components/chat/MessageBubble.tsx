// A single chat bubble. Companion (left): warm-paper sheet + soft shadow, softened asymmetric
// radius. User (right): wine-tinted bubble. Hanken inside, capped ~82% width for a comfy measure.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, SPACE } from '@/constants/design';
import { useTheme } from '@/hooks/useTheme';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  text: string;
}

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const { colors, shadows } = useTheme();
  const isUser = role === 'user';
  return (
    <View style={[styles.row, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.bubbleBg, borderBottomRightRadius: 6 }
            : { backgroundColor: colors.sheet, borderBottomLeftRadius: 6, ...shadows.e1 },
        ]}
      >
        <Text style={[styles.text, { color: isUser ? colors.bubbleText : colors.textPrimary }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: SPACE.xs },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.md,
    borderRadius: 18,
  },
  text: { fontFamily: FONTS.body.regular, fontSize: 16, lineHeight: 23 },
});
