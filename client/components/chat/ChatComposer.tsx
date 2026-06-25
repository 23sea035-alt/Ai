// Input dock — a structural surface (warm hairline + soft radius). The send affordance only
// appears once the field is non-empty.
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextField } from '@/components/TextField';
import { PressableScale } from '@/components/motion';
import { FONTS, RADIUS, SPACE } from '@/constants/design';
import { useTheme } from '@/hooks/useTheme';

interface ChatComposerProps {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export function ChatComposer({ value, onChangeText, onSend, placeholder }: ChatComposerProps) {
  const { colors } = useTheme();
  const canSend = value.trim().length > 0;
  return (
    <View style={[styles.dock, { borderColor: colors.border, backgroundColor: colors.raised }]}>
      <TextField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline
        style={[styles.input, { color: colors.textPrimary }]}
      />
      {canSend ? (
        <PressableScale onPress={onSend} haptic="light" style={[styles.send, { backgroundColor: colors.accent }]}>
          <Ionicons name="arrow-up" size={20} color={colors.onAccent} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  send: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
});
