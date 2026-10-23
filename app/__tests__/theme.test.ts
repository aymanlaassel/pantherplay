import { colors, primitives, radius, space, typography } from '@/theme';

// Figma variables from screen 133:423, copied verbatim as the source of truth.
const figmaColors: [string, string][] = [
  ['bg/screen', '#F6F7FA'],
  ['bg/surface', '#FFFFFF'],
  ['bg/gold-soft', '#FCF3E0'],
  ['bg/avatar', '#EAEFF6'],
  ['bg/neutral', '#E6E9EE'],
  ['bg/success', '#E1F3E8'],
  ['bg/error', '#FAE6E4'],
  ['bg/brand', '#002C4F'],
  ['text/primary', '#002C4F'],
  ['text/muted', '#5A6B7D'],
  ['text/gold', '#8A5F0F'],
  ['text/inverse', '#FFFFFF'],
  ['text/success', '#1F8A4C'],
  ['text/error', '#C8463C'],
  ['border/default', '#D6DBE3'],
  ['border/navy', '#002C4F'],
  ['border/gold', '#D9A242'],
  ['icon/active', '#002C4F'],
  ['icon/inactive', '#8A96A5'],
  ['icon/muted', '#5A6B7D'],
  ['icon/inverse', '#FFFFFF'],
  ['brand/gold', '#D9A242'],
];

const figmaPrimitives: [string, string][] = [
  ['navy/900', '#002C4F'],
  ['navy/50', '#EAEFF6'],
  ['gold/500', '#D9A242'],
  ['gold/100', '#FCF3E0'],
  ['gold/800', '#8A5F0F'],
  ['white', '#FFFFFF'],
  ['gray/50', '#F6F7FA'],
  ['gray/100', '#E6E9EE'],
  ['gray/200', '#D6DBE3'],
  ['gray/500', '#8A96A5'],
  ['gray/600', '#5A6B7D'],
  ['green/600', '#1F8A4C'],
  ['green/100', '#E1F3E8'],
  ['red/500', '#C8463C'],
  ['red/100', '#FAE6E4'],
];

const figmaTextStyles: [string, string, number][] = [
  ['Display/Name', 'BarlowCondensed_700Bold', 38],
  ['Title/Game', 'BarlowCondensed_700Bold', 34],
  ['Price', 'BarlowCondensed_700Bold', 26],
  ['Body/Regular', 'Inter_400Regular', 15],
  ['Body/Medium', 'Inter_500Medium', 15],
  ['Body/Strong', 'Inter_600SemiBold', 14],
  ['Button', 'Inter_600SemiBold', 16],
  ['Label', 'Inter_600SemiBold', 12],
  ['Caption', 'Inter_500Medium', 11],
];

// The naming convention under test: `bg/gold-soft` -> tree.bg.goldSoft.
const lookup = (tree: object, figmaName: string): unknown =>
  figmaName
    .split('/')
    .map((part) => part.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()))
    .reduce<any>((node, key) => node?.[key], tree);

const leaves = (tree: object): string[] =>
  Object.values(tree).flatMap((v) => (typeof v === 'string' ? [v] : leaves(v)));

describe('theme matches the Figma variables', () => {
  test.each(figmaColors)('semantic color %s is %s', (name, hex) => {
    expect(lookup(colors, name)).toBe(hex);
  });

  test.each(figmaPrimitives)('primitive %s is %s', (name, hex) => {
    expect(lookup(primitives, name)).toBe(hex);
  });

  test('has no colors that are not in Figma', () => {
    expect(leaves(colors)).toHaveLength(figmaColors.length);
    expect(leaves(primitives)).toHaveLength(figmaPrimitives.length);
  });

  test('every semantic color resolves to a primitive', () => {
    const primitiveValues = leaves(primitives);
    for (const value of leaves(colors)) expect(primitiveValues).toContain(value);
  });

  test.each(figmaTextStyles)('text style %s is %s at %ipx, 100%% line height', (name, font, size) => {
    expect(typography[name as keyof typeof typography]).toEqual({
      fontFamily: font,
      fontSize: size,
      lineHeight: size,
      letterSpacing: 0,
    });
  });

  test('has exactly the Figma text styles', () => {
    expect(Object.keys(typography).sort()).toEqual(figmaTextStyles.map(([n]) => n).sort());
  });

  test('spacing and radius', () => {
    expect(space).toEqual({ 4: 4, 8: 8, 12: 12, 16: 16, 20: 20 });
    expect(radius).toEqual({ card: 16, pill: 999 });
  });
});
