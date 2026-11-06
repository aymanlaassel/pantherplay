import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet } from 'react-native';

import { TabBar } from '@/components/tab-bar';
import { colors } from '@/theme';

const mockInsets = { top: 0, right: 0, bottom: 34, left: 0 };

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => mockInsets }));
jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: View, Path: View };
});

const ROUTES = [
  { name: 'index', title: 'Discover' },
  { name: 'map', title: 'Map' },
  { name: 'create-button', title: '+' },
  { name: 'social', title: 'Social' },
  { name: 'profile', title: 'Profile' },
];

// The same props expo-router hands to a custom tabBar.
function fakeProps(focusedIndex = 0, defaultPrevented = false) {
  const emit = jest.fn(() => ({ defaultPrevented }));
  const navigateToTab = jest.fn();
  const props = {
    state: { index: focusedIndex, routes: ROUTES.map(({ name }) => ({ key: `${name}-key`, name })) },
    descriptors: Object.fromEntries(ROUTES.map(({ name, title }) => [`${name}-key`, { options: { title } }])),
    emitter: { emit },
    navigateToTab,
    insets: mockInsets,
  } as unknown as BottomTabBarProps;
  return { props, emit, navigateToTab };
}

const flat = (el: { props: { style?: unknown } }) => StyleSheet.flatten(el.props.style as never);

beforeEach(() => jest.mocked(router.push).mockClear());

test('renders the five items in order', async () => {
  await render(<TabBar {...fakeProps().props} />);
  const labels = screen.getAllByRole('tab').map((tab) => tab.props.accessibilityLabel);
  expect(labels).toEqual(['Discover', 'Map', 'Social', 'Profile']);
  expect(screen.getByRole('button', { name: 'Create game' })).toBeTruthy();
});

test('selected state follows the focused route', async () => {
  await render(<TabBar {...fakeProps(3).props} />);
  expect(screen.getByRole('tab', { name: 'Social', selected: true })).toBeTruthy();
  for (const name of ['Discover', 'Map', 'Profile']) {
    expect(screen.getByRole('tab', { name, selected: false })).toBeTruthy();
  }
  expect(screen.getByText('Social')).toHaveStyle({ color: colors.text.primary });
  expect(screen.getByText('Map')).toHaveStyle({ color: colors.text.muted });
});

test('only the selected tab shows the gold dot', async () => {
  await render(<TabBar {...fakeProps(1).props} />);
  const dotColor = (route: string) =>
    (flat(screen.getByTestId(`tab-dot-${route}`)) as { backgroundColor?: string }).backgroundColor;
  expect(dotColor('map')).toBe(colors.brand.gold);
  for (const route of ['index', 'social', 'profile']) expect(dotColor(route)).toBeUndefined();
});

test('the bar is a white floating pill with a navy [+] labelled Post', async () => {
  await render(<TabBar {...fakeProps().props} />);
  expect(flat(screen.getByTestId('tab-bar-pill'))).toMatchObject({ backgroundColor: colors.bg.surface });
  expect(flat(screen.getByRole('button', { name: 'Create game' }))).toMatchObject({ backgroundColor: colors.bg.brand });
  expect(screen.getByText('Post')).toBeTruthy();
});

test('pressing an unfocused tab emits tabPress and navigates', async () => {
  const { props, emit, navigateToTab } = fakeProps(0);
  await render(<TabBar {...props} />);
  await fireEvent.press(screen.getByRole('tab', { name: 'Map' }));
  expect(emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'map-key', canPreventDefault: true });
  expect(navigateToTab).toHaveBeenCalledWith('map-key');
});

test('pressing the focused tab emits tabPress but does not navigate', async () => {
  const { props, emit, navigateToTab } = fakeProps(0);
  await render(<TabBar {...props} />);
  await fireEvent.press(screen.getByRole('tab', { name: 'Discover' }));
  expect(emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'index-key', canPreventDefault: true });
  expect(navigateToTab).not.toHaveBeenCalled();
});

test('a prevented tabPress does not navigate', async () => {
  const { props, navigateToTab } = fakeProps(0, true);
  await render(<TabBar {...props} />);
  await fireEvent.press(screen.getByRole('tab', { name: 'Map' }));
  expect(navigateToTab).not.toHaveBeenCalled();
});

test('[+] pushes Create game and does not navigate to a tab', async () => {
  const { props, emit, navigateToTab } = fakeProps(0);
  await render(<TabBar {...props} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Create game' }));
  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith('/game/create');
  expect(navigateToTab).not.toHaveBeenCalled();
  expect(emit).not.toHaveBeenCalled();
});

test('[+] is never selected, even if its route is focused', async () => {
  await render(<TabBar {...fakeProps(2).props} />);
  expect(screen.getByRole('button', { name: 'Create game', selected: false })).toBeTruthy();
  expect(screen.queryByRole('tab', { selected: true })).toBeNull();
});

test('the bar stays in the layout and clears the bottom safe area', async () => {
  await render(<TabBar {...fakeProps().props} />);
  const style = flat(screen.getByTestId('tab-bar')) as { position?: string; paddingBottom?: number };
  expect(style.position).not.toBe('absolute');
  expect(style.paddingBottom).toBe(mockInsets.bottom);
});

test('every item has at least a 44pt touch target', async () => {
  await render(<TabBar {...fakeProps().props} />);
  for (const tab of screen.getAllByRole('tab')) {
    expect((flat(tab) as { minHeight: number }).minHeight).toBeGreaterThanOrEqual(44);
  }
  const create = flat(screen.getByRole('button', { name: 'Create game' })) as { width: number; height: number };
  expect(create.width).toBeGreaterThanOrEqual(44);
  expect(create.height).toBeGreaterThanOrEqual(44);
});
