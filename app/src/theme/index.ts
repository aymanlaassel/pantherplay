// Mirrors the Figma variables (screen 133:423). A Figma path becomes nesting, kebab-case
// segments become camelCase: `bg/gold-soft` -> colors.bg.goldSoft, `space/16` -> space[16].
import type { TextStyle } from 'react-native';

export const primitives = {
  navy: { 900: '#002C4F', 50: '#EAEFF6' },
  gold: { 500: '#D9A242', 100: '#FCF3E0', 800: '#8A5F0F' },
  white: '#FFFFFF',
  gray: { 50: '#F6F7FA', 100: '#E6E9EE', 200: '#D6DBE3', 500: '#8A96A5', 600: '#5A6B7D' },
  green: { 600: '#1F8A4C', 100: '#E1F3E8' },
  red: { 500: '#C8463C', 100: '#FAE6E4' },
} as const;

const p = primitives;

export const colors = {
  bg: {
    screen: p.gray[50],
    surface: p.white,
    goldSoft: p.gold[100],
    avatar: p.navy[50],
    neutral: p.gray[100],
    success: p.green[100],
    error: p.red[100],
    brand: p.navy[900],
  },
  text: {
    primary: p.navy[900],
    muted: p.gray[600],
    gold: p.gold[800],
    inverse: p.white,
    success: p.green[600],
    error: p.red[500],
  },
  border: { default: p.gray[200], navy: p.navy[900], gold: p.gold[500] },
  icon: { active: p.navy[900], inactive: p.gray[500], muted: p.gray[600], inverse: p.white },
  brand: { gold: p.gold[500] },
} as const;

// Names match the families registered with useFonts in the root layout.
export const fonts = {
  barlowCondensedBold: 'BarlowCondensed_700Bold',
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
} as const;

// Text styles keep their exact Figma names as keys: typography['Title/Game'].
// Figma line height is 100%, so lineHeight equals fontSize.
const style = (fontFamily: string, fontSize: number): TextStyle => ({
  fontFamily,
  fontSize,
  lineHeight: fontSize,
  letterSpacing: 0,
});

export const typography = {
  'Display/Name': style(fonts.barlowCondensedBold, 38),
  'Title/Game': style(fonts.barlowCondensedBold, 34),
  Price: style(fonts.barlowCondensedBold, 26),
  'Body/Regular': style(fonts.interRegular, 15),
  'Body/Medium': style(fonts.interMedium, 15),
  'Body/Strong': style(fonts.interSemiBold, 14),
  Button: style(fonts.interSemiBold, 16),
  Label: style(fonts.interSemiBold, 12),
  Caption: style(fonts.interMedium, 11),
} as const;

export const space = { 4: 4, 8: 8, 12: 12, 16: 16, 20: 20 } as const;

export const radius = { card: 16, pill: 999 } as const;
