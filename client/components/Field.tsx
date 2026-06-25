// Labeled text field — structural (crisp warm hairline, tight radius), accent focus ring,
// inline error. The form building block for profile / auth / age-gate.
import React, { useState } from 'react';
import { View, Text, StyleSheet, type TextInputProps } from 'react-native';
import { TextField } from '@/components/TextField';
import { FONTS, RADIUS, SPACE } from '@/constants/design';
import { useTheme } from '@/hooks/useTheme';

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Field({ label, error, style, onFocus, onBlur, ...rest }: FieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.accent : colors.border;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.box, { borderColor, backgroundColor: colors.raised }]}>
        <TextField
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.textPrimary }, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACE.sm },
  label: { fontFamily: FONTS.body.semibold, fontSize: 13 },
  box: {
    borderWidth: 1,
    borderRadius: RADIUS.edit,
    paddingHorizontal: SPACE.md,
    height: 52,
    justifyContent: 'center',
  },
  input: { fontFamily: FONTS.body.regular, fontSize: 16, padding: 0 },
  error: { fontFamily: FONTS.body.regular, fontSize: 13 },
});
