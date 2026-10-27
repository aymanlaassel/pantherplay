import { router } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import DiscoverScreen from '@/app/(tabs)/index';
import { MOCK_GAMES } from '@/features/home/mock-games';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

beforeEach(() => (router.push as jest.Mock).mockClear());

test('shows the greeting and a card for every game', async () => {
  await render(<DiscoverScreen />);
  expect(screen.getByText('Good morning,')).toBeTruthy();
  expect(screen.getByText('Panther!')).toBeTruthy();
  for (const game of MOCK_GAMES) expect(screen.getByText(game.title)).toBeTruthy();
  expect(screen.getAllByText('Join game')).toHaveLength(MOCK_GAMES.length);
});

test('a card opens that game', async () => {
  await render(<DiscoverScreen />);
  await fireEvent.press(screen.getByText(MOCK_GAMES[1].title));
  expect(router.push).toHaveBeenCalledWith(`/game/${MOCK_GAMES[1].id}`);
});

test('the bell opens notifications', async () => {
  await render(<DiscoverScreen />);
  await fireEvent.press(screen.getByLabelText('Notifications'));
  expect(router.push).toHaveBeenCalledWith('/notifications');
});

test('the day row starts on Today and moves the selection when another day is tapped', async () => {
  await render(<DiscoverScreen />);
  expect(screen.getByRole('button', { name: 'Today', selected: true })).toBeTruthy();

  const [tomorrow] = screen.getAllByText(/^[A-Za-z]{3} \d{1,2}$/);
  await fireEvent.press(tomorrow);

  expect(screen.getByRole('button', { name: 'Today', selected: false })).toBeTruthy();
  expect(screen.getByRole('button', { name: tomorrow.props.children, selected: true })).toBeTruthy();
});

test('the search box and filter button are labelled for screen readers', async () => {
  await render(<DiscoverScreen />);
  expect(screen.getByLabelText('Search games')).toBeTruthy();
  expect(screen.getByLabelText('Filters')).toBeTruthy();
});

test('the web Map tab shows a note instead of loading react-native-maps', async () => {
  const MapWeb = require('@/app/(tabs)/map.web').default;
  await render(<MapWeb />);
  expect(screen.getByText('The map is available in the mobile app.')).toBeTruthy();
});
