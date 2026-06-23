import { Dimensions, TextStyle } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const COLORS = {
  surfaceDim: '#0e1323',
  surface: '#0e1323',
  surfaceContainerLowest: '#080d1d',
  surfaceContainerLow: '#161b2b',
  surfaceContainer: '#1a1f30',
  surfaceContainerHigh: '#25293a',
  surfaceContainerHighest: '#2f3446',
  surfaceBright: '#34394a',
  surfaceVariant: '#2f3446',

  gradientStart: '#0B1020',
  gradientMid: '#121A35',
  gradientEnd: '#1A1F4B',

  primary: '#c9bfff',
  onPrimary: '#2e009c',
  primaryContainer: '#917eff',
  onPrimaryContainer: '#28008a',
  inversePrimary: '#5d3fe0',
  primaryFixed: '#e5deff',

  secondary: '#8fd8ff',
  onSecondary: '#003548',
  secondaryContainer: '#00c1fd',
  onSecondaryContainer: '#004b65',

  tertiary: '#ffb77d',
  tertiaryContainer: '#d57a1e',

  accentGlow: '#B388FF',

  onSurface: '#dee1f9',
  onSurfaceVariant: '#c9c4d8',
  onBackground: '#dee1f9',
  outline: '#928ea1',
  outlineVariant: '#484555',

  error: '#ffb4ab',
  errorContainer: '#93000a',

  glassFill: 'rgba(255, 255, 255, 0.04)',
  glassStroke: 'rgba(255, 255, 255, 0.12)',
  glassFill2: 'rgba(255, 255, 255, 0.02)',
} as const;

export const FONTS = {
  displayLg: {
    fontFamily: 'Sora_700Bold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.8,
  } as TextStyle,
  headlineLg: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.32,
  } as TextStyle,
  headlineLgMobile: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
  } as TextStyle,
  titleMd: {
    fontFamily: 'Sora_500Medium',
    fontSize: 20,
    lineHeight: 28,
  } as TextStyle,
  bodyLg: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 17,
    lineHeight: 26,
  } as TextStyle,
  bodyMd: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  caption: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  labelCaps: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
  } as TextStyle,
};

export const SPACING = {
  base: 8,
  sm: 12,
  md: 24,
  lg: 40,
  gutter: 16,
  containerMargin: 20,
} as const;

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 32,
  full: 9999,
} as const;

export const SHADOWS = {
  primaryBtn: {
    shadowColor: 'rgba(179, 136, 255, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    shadowColor: 'rgba(179, 136, 255, 0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  bottomNav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 16,
  },
  fab: {
    shadowColor: 'rgba(179, 136, 255, 0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12,
  },
  activeTab: {
    textShadowColor: 'rgba(179,136,255,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  inputFocus: {
    shadowColor: 'rgba(179, 136, 255, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 4,
  },
};

export const GLASS_STYLE = {
  backgroundColor: COLORS.glassFill,
  borderWidth: 1,
  borderColor: COLORS.glassStroke,
} as const;

export function fadeInUp(delay = 0, duration = 1000) {
  return {
    animation: undefined as any,
    delay,
    duration,
  };
}

export const SCREEN_WIDTH_VALUE = SCREEN_WIDTH;
