import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';

import { listGames, listLocations } from '@/api';
import { getMockGames, mockLocations } from '@/api/mock-data';
import MapScreen from '@/app/(tabs)/map';
import { MapGamePin } from '@/components/map-game-pin';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
// The native map can't run in Jest: stand in plain views. A Marker is pressable like the real one.
jest.mock('react-native-maps', () => {
  const { Pressable, View } = jest.requireActual('react-native');
  const MapView = (props: object) => <View {...props} />;
  const Marker = ({ onPress, ...props }: { onPress?: () => void }) => (
    <Pressable accessibilityRole="button" onPress={onPress} {...props} />
  );
  return { __esModule: true, default: MapView, Marker };
});
// Gesture handler v3 asks Worklets for the UI runtime, which only exists on a device.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('@/api', () => ({ listGames: jest.fn(), listLocations: jest.fn() }));

const games = getMockGames();
const countAt = (id: string) => games.filter((g) => g.location_id === id).length;

beforeEach(() => {
  jest.mocked(listGames).mockReset().mockResolvedValue(games);
  jest.mocked(listLocations).mockReset().mockResolvedValue(mockLocations);
  jest.mocked(router.push).mockClear();
});

test('every mock location has real coordinates on an FIU campus', () => {
  for (const l of mockLocations) {
    expect(l.latitude).toBeGreaterThan(25.7);
    expect(l.latitude).toBeLessThan(25.95);
    expect(l.longitude).toBeGreaterThan(-80.4);
    expect(l.longitude).toBeLessThan(-80.1);
  }
});

describe('Map screen', () => {
  test('shows one pin per location with its game count, and no sheet yet', async () => {
    await render(<MapScreen />);
    for (const l of mockLocations) {
      const pin = await screen.findByTestId(`map-pin-${l.id}`);
      expect(within(pin).getByText(String(countAt(l.id)))).toBeTruthy();
    }
    expect(screen.queryByTestId('map-sheet')).toBeNull();
  });

  test('tapping a pin shows that location’s games, and a row opens its game', async () => {
    await render(<MapScreen />);
    await fireEvent.press(await screen.findByTestId('map-pin-l-bbc'));
    const sheet = screen.getByTestId('map-sheet');
    expect(within(sheet).getByText('BBC Recreation Field')).toBeTruthy();
    expect(within(sheet).getByText('Ultimate')).toBeTruthy();
    expect(within(sheet).queryByText('Basketball')).toBeNull();

    await fireEvent.press(within(sheet).getByText('Ultimate'));
    expect(router.push).toHaveBeenCalledWith('/game/g-long');

    await fireEvent.press(screen.getByTestId('map-pin-l-rec'));
    expect(within(screen.getByTestId('map-sheet')).getByText('Basketball')).toBeTruthy();
  });

  test('the handle toggles the sheet between collapsed and expanded', async () => {
    await render(<MapScreen />);
    await fireEvent.press(await screen.findByTestId('map-pin-l-field'));
    const handle = screen.getByRole('button', { name: 'Expand list' });
    expect(handle).toBeCollapsed();

    await fireEvent.press(handle);
    expect(screen.getByRole('button', { name: 'Collapse list' })).toBeExpanded();

    await fireEvent.press(screen.getByRole('button', { name: 'Collapse list' }));
    expect(screen.getByRole('button', { name: 'Expand list' })).toBeTruthy();
  });

  test('shows a banner when games fail to load', async () => {
    jest.mocked(listGames).mockRejectedValue(new Error('offline'));
    await render(<MapScreen />);
    expect(await screen.findByText("Couldn't load games")).toBeTruthy();
  });
});

test('the pin caps big counts', async () => {
  await render(<MapGamePin count={150} />);
  expect(screen.getByText('99+')).toBeTruthy();
});
