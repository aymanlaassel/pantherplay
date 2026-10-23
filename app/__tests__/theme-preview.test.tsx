import { render, screen } from '@testing-library/react-native';

import ThemePreviewScreen from '@/app/theme-preview';
import { typography } from '@/theme';

const colorNames = [
  'navy/900', 'navy/50', 'gold/500', 'gold/100', 'gold/800', 'white', 'gray/50', 'gray/100',
  'gray/200', 'gray/500', 'gray/600', 'green/600', 'green/100', 'red/500', 'red/100',
  'bg/screen', 'bg/surface', 'bg/gold-soft', 'bg/avatar', 'bg/neutral', 'bg/success', 'bg/error',
  'bg/brand', 'text/primary', 'text/muted', 'text/gold', 'text/inverse', 'text/success',
  'text/error', 'border/default', 'border/navy', 'border/gold', 'icon/active', 'icon/inactive',
  'icon/muted', 'icon/inverse', 'brand/gold',
];
const textStyleNames = [
  'Display/Name', 'Title/Game', 'Price', 'Body/Regular', 'Body/Medium', 'Body/Strong', 'Button',
  'Label', 'Caption',
];
const sizeNames = ['space/4', 'space/8', 'space/12', 'space/16', 'space/20', 'radius/card', 'radius/pill'];

test('theme preview renders a label for every token', async () => {
  await render(<ThemePreviewScreen />);
  for (const name of [...colorNames, ...textStyleNames, ...sizeNames]) {
    expect(screen.getByText(name)).toBeTruthy();
  }
});

test('theme preview renders each text style in its own style', async () => {
  await render(<ThemePreviewScreen />);
  for (const name of textStyleNames) {
    expect(screen.getByText(name)).toHaveStyle(typography[name as keyof typeof typography]);
  }
});
