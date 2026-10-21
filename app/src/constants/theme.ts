/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** PantherPlay brand palette. Use these for product screens (Map, Board, etc). */
export const Palette = {
  navy: '#0B1F3F',
  fiuBlue: '#081E3F',
  gold: '#E0A526',
  muted: '#5B6678',
  cardBg: '#F2F5F9',
  border: '#E3E8EF',
  myLocation: '#2F6FED',
  white: '#FFFFFF',
  text: '#0B1F3F',
  /** Light avatar / icon circle background. */
  avatarBg: '#E8ECF3',
  /** Cream background for skill tags. */
  cream: '#FBF3DF',
  /** Urgency text, e.g. "3 spots left!". */
  alert: '#D64A3B',
} as const;

/** Font family names as registered by expo-font in src/app/_layout.tsx. */
export const FontFamily = {
  heading: 'BarlowCondensed_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/** Minimum touch target size (Apple HIG / Material). */
export const MinTouchTarget = 44;

/** Soft drop shadow for floating white surfaces (search bar, chips, buttons). */
export const SoftShadow = Platform.select({
  ios: {
    shadowColor: '#0B1F3F',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 4 },
  default: {},
});

/** Default map center: FIU Modesto A. Maidique Campus. */
export const FIU_MMC = { latitude: 25.7563, longitude: -80.3755 } as const;
