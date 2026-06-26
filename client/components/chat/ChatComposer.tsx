// Input dock — a structural surface (warm hairline + soft radius). Hold the mic to dictate: a
// recording bar with a live level meter appears, the partial transcript streams into the field as you
// speak, and the send affordance replaces the mic once the field is non-empty.
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LevelMeter } from '@/components/chat/LevelMeter';
import { TextField } from '@/components/TextField';
import { PressableScale } from '@/components/motion';
import { FONTS, RADIUS, SPACE } from '@/constants/design';
import { useDictation } from '@/hooks/useDictation';
import { useTheme } from '@/hooks/useTheme';

interface ChatComposerProps {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  placeholder?: string;
  // Fired when a hold-to-talk dictation ends, so the parent can tag the next send as voice-origin.
  onVoiceResult?: (info: { audioUri?: string }) => void;
}

export function ChatComposer({ value, onChangeText, onSend, placeholder, onVoiceResult }: ChatComposerProps) {
  const { colors } = useTheme();
  const canSend = value.trim().length > 0;
  const baseRef = useRef('');

  const { listening, level, start, stop } = useDictation({
    onPartial: (transcript) =>
      onChangeText(baseRef.current ? `${baseRef.current} ${transcript}` : transcript),
    onFinal: ({ audioUri }) => onVoiceResult?.({ audioUri }),
  });

  const beginDictation = () => {
    baseRef.current = value.trim();
    start();
  };

  return (
    <View style={styles.wrap}>
      {listening ? (
        <View style={[styles.recBar, { backgroundColor: colors.raised, borderColor: colors.border }]}>
          <View style={[styles.dot, { backgroundColor: colors.error, opacity: 0.55 + level * 0.45 }]} />
          <Text style={[styles.recLabel, { color: colors.textSecondary }]}>Listening…</Text>
          <LevelMeter level={level} active={listening} color={colors.accent} />
        </View>
      ) : null}

      <View style={[styles.dock, { borderColor: colors.border, backgroundColor: colors.raised }]}>
        <TextField
          value={value}
          onChangeText={onChangeText}
          placeholder={listening ? 'Listening…' : placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline
          style={[styles.input, { color: colors.textPrimary }]}
        />
        {canSend ? (
          <PressableScale onPress={onSend} haptic="light" style={[styles.btn, { backgroundColor: colors.accent }]}>
            <Ionicons name="arrow-up" size={20} color={colors.onAccent} />
          </PressableScale>
        ) : (
          <Pressable
            onPressIn={beginDictation}
            onPressOut={stop}
            accessibilityRole="button"
            accessibilityLabel="Hold to dictate a voice message"
            style={[
              styles.btn,
              listening
                ? { backgroundColor: colors.accent }
                : { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name={listening ? 'mic' : 'mic-outline'}
              size={20}
              color={listening ? colors.onAccent : colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACE.xs },
  recBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    borderWidth: 1,
    borderRadius: RADIUS.soft,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  recLabel: { fontFamily: FONTS.body.medium, fontSize: 13 },
  dock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACE.sm,
    borderWidth: 1,
    borderRadius: RADIUS.soft,
    paddingLeft: SPACE.md,
    paddingRight: SPACE.xs,
    paddingVertical: SPACE.xs,
    minHeight: 48,
  },
  input: { flex: 1, fontFamily: FONTS.body.regular, fontSize: 16, paddingVertical: SPACE.sm, maxHeight: 120 },
  btn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
});
