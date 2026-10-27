import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import MapScreen from '@/app/(tabs)/map';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
// The native map can't run in Jest: stand in plain views. A Marker is pressable like the real one.
jest.mock('react-native-maps', () => {
  const React = jest.requireActual('react');
  const { Pressable, View } = jest.requireActual('react-native');
  const MapView = React.forwardRef((props: object, ref: unknown) => {
    React.useImperativeHandle(ref, () => ({ animateToRegion: jest.fn() }));
    return <View {...props} />;
  });
  const Marker = ({ onPress, children }: { onPress?: () => void; children?: React.ReactNode }) => (
    <Pressable onPress={onPress}>{children}</Pressable>
  );
  return { __esModule: true, default: MapView, Marker };
});
jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: View, Path: View };
});

beforeEach(() => jest.mocked(router.push).mockClear());

test('starts on MMC and lists only its games, earliest first', async () => {
  await render(<MapScreen />);
  expect(screen.getByText('Games near MMC')).toBeTruthy();
  expect(screen.getByText('2 games today · sorted by start time')).toBeTruthy();

  const titles = screen.getAllByText(/Friday 5v5 Pickup|5v5 Soccer/).map((t) => t.props.children);
  expect(titles).toEqual(['Friday 5v5 Pickup', '5v5 Soccer']);
  expect(screen.queryByText('Friday 3v3 Pickup')).toBeNull();
});

test('switching to BBC shows BBC games instead', async () => {
  await render(<MapScreen />);
  await fireEvent.press(screen.getByText('BBC'));
  expect(screen.getByText('Games near BBC')).toBeTruthy();
  expect(screen.getByText('Friday 3v3 Pickup')).toBeTruthy();
  expect(screen.queryByText('5v5 Soccer')).toBeNull();
});

test('a game the user joined shows the Joined badge', async () => {
  await render(<MapScreen />);
  expect(screen.getAllByText('Joined')).toHaveLength(1);
});

test('first tap selects a game, second tap opens its page', async () => {
  await render(<MapScreen />);
  await fireEvent.press(screen.getByText('5v5 Soccer'));
  expect(router.push).not.toHaveBeenCalled();

  await fireEvent.press(screen.getByText('5v5 Soccer'));
  expect(router.push).toHaveBeenCalledWith('/game/1');
});

test('the sheet toggle expands and collapses the list', async () => {
  await render(<MapScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Expand game list' }));
  expect(screen.getByRole('button', { name: 'Collapse game list' })).toBeTruthy();
});
