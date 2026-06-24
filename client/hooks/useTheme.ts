import { useColorScheme } from 'react-native';

import { COLORS, SHADOWS, type ThemeColors, type ThemeMode, type ThemeShadows } from '@/constants/design';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  shadows: ThemeShadows;
}

/**
 * Active warm-light / warm-dark theme, driven by the OS appearance.
 *
 * NOTE: app.json currently pins `userInterfaceStyle: "dark"`, so this returns the
 * dark theme regardless of system setting. Set it to "automatic" to honor both.
 */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  const mode: ThemeMode = scheme === 'dark' ? 'dark' : 'light';
  return { mode, colors: COLORS[mode], shadows: SHADOWS[mode] };
}
