import { router } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import DiscoverScreen from '@/app/(tabs)/index';
import { greetingFor, HomeHeader } from '@/features/home/home-header';
import { MOCK_GAMES } from '@/features/home/mock-games';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

beforeEach(() => (router.push as jest.Mock).mockClear());

test('shows the greeting', async () => {
  await render(<DiscoverScreen />);
  expect(screen.getByText(/^Good (morning|afternoon|evening),$/)).toBeTruthy();
  expect(screen.getByText('Panther!')).toBeTruthy();
  expect(screen.getAllByText('Join game')).toHaveLength(1);
  expect(screen.getByText('View game')).toBeTruthy();
});

test('a card opens that game', async () => {
  await render(<DiscoverScreen />);
  await fireEvent.press(screen.getByText(MOCK_GAMES[1].title));
  expect(router.push).toHaveBeenCalledWith(`/game/${MOCK_GAMES[1].id}`);
});

test('the campus toggle starts on MMC and switches to that campus\'s games', async () => {
  const titles = (campus: string) => MOCK_GAMES.filter((game) => game.campus === campus).map((game) => game.title);
  await render(<DiscoverScreen />);
  expect(screen.getByRole('button', { name: 'MMC', selected: true })).toBeTruthy();
  for (const title of titles('MMC')) expect(screen.getByText(title)).toBeTruthy();
  for (const title of titles('BBC')) expect(screen.queryByText(title)).toBeNull();

  await fireEvent.press(screen.getByRole('button', { name: 'BBC' }));
  expect(screen.getByRole('button', { name: 'BBC', selected: true })).toBeTruthy();
  for (const title of titles('BBC')) expect(screen.getByText(title)).toBeTruthy();
  for (const title of titles('MMC')) expect(screen.queryByText(title)).toBeNull();
});

test('each card shows a spots bar that matches its spots left', async () => {
  await render(<DiscoverScreen />);
  expect(screen.getByText('7 of 10 spots filled')).toBeTruthy();
  expect(screen.getByText('3 spots left!')).toBeTruthy();
  expect(screen.getByText('9 of 10 spots filled')).toBeTruthy();
  expect(screen.getByText('1 spot left!')).toBeTruthy();
});

test('the Join button on a card opens that game', async () => {
  await render(<DiscoverScreen />);
  await fireEvent.press(screen.getAllByRole('button', { name: 'Join game' })[0]);
  expect(router.push).toHaveBeenCalledWith(`/game/${MOCK_GAMES[0].id}`);
});

test('cards only show the status their game has', async () => {
  await render(<DiscoverScreen />);
  expect(screen.getAllByText('Confirmed')).toHaveLength(1);
  expect(screen.getAllByText('Joined')).toHaveLength(1);
});

test('the greeting follows the time of day', () => {
  expect(greetingFor(8)).toBe('Good morning,');
  expect(greetingFor(12)).toBe('Good afternoon,');
  expect(greetingFor(18)).toBe('Good evening,');
});

test('the bell only shows a dot when something is unread', async () => {
  const header = (hasUnread: boolean) => <HomeHeader name="Panther!" hasUnread={hasUnread} onBellPress={jest.fn()} />;
  const view = await render(header(false));
  expect(screen.queryByTestId('unread-dot')).toBeNull();
  await view.rerender(header(true));
  expect(screen.getByTestId('unread-dot')).toBeTruthy();
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
