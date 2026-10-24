import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { listFriends, listFriendsGames, setMockScenario } from '@/api';
import SocialScreen from '@/app/(tabs)/social';
import { FriendRow, initials } from '@/components/friend-row';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockParams = useLocalSearchParams as jest.Mock;
const LONG_NAME = 'Maximiliano Alejandro de la Concepción Fernández-Villanueva';

beforeEach(() => {
  mockParams.mockReturnValue({});
  setMockScenario('default');
  jest.mocked(router.push).mockClear();
});

describe('social API (mock)', () => {
  test('listFriends returns friends and a pending request, sorted by name', async () => {
    const friends = await listFriends();
    expect(friends.map((f) => [f.full_name, f.status])).toEqual([
      ['Ana Rodriguez', 'friend'],
      ['Ben Carter', 'pending'],
      [LONG_NAME, 'friend'],
    ]);
  });

  test('listFriendsGames only has upcoming, non-cancelled games hosted by accepted friends', async () => {
    const games = await listFriendsGames();
    expect(games.length).toBeGreaterThan(0);
    const now = new Date().toISOString();
    for (const g of games) {
      expect(['p-ana', 'p-long']).toContain(g.host_id);
      expect(g.status).not.toBe('cancelled');
      expect(g.starts_at >= now).toBe(true);
    }
    expect([...games].sort((a, b) => a.starts_at.localeCompare(b.starts_at))).toEqual(games);
  });

  test("the 'empty' scenario returns nothing", async () => {
    setMockScenario('empty');
    expect(await listFriends()).toEqual([]);
    expect(await listFriendsGames()).toEqual([]);
  });
});

describe('Social screen', () => {
  test('renders friends, the pending badge and friends’ games from mock data', async () => {
    await render(<SocialScreen />);
    expect(screen.getByLabelText('Loading friends')).toBeTruthy();
    expect(await screen.findByText('Ana Rodriguez')).toBeTruthy();
    expect(screen.getByText('Social')).toBeTruthy();
    expect(screen.getByText('Ben Carter')).toBeTruthy();
    expect(screen.getAllByText('Pending')).toHaveLength(1);
    expect(screen.getByText('Playing soon')).toBeTruthy();
    // g-long is hosted by a friend; its notes show on its card.
    expect(screen.getByText('Saturday Morning Ultimate Frisbee at BBC, All Levels Welcome')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add friend' })).toBeTruthy();
  });

  test('search filters the friends list', async () => {
    await render(<SocialScreen />);
    await screen.findByText('Ana Rodriguez');
    await fireEvent.changeText(screen.getByLabelText('Search friends'), 'ben');
    expect(screen.getByText('Ben Carter')).toBeTruthy();
    expect(screen.queryByText('Ana Rodriguez')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Search friends'), 'zzz');
    expect(screen.getByText('No friends match "zzz".')).toBeTruthy();
  });

  test('tapping a friend’s game opens it', async () => {
    await render(<SocialScreen />);
    await fireEvent.press(await screen.findByText('Saturday Morning Ultimate Frisbee at BBC, All Levels Welcome'));
    expect(router.push).toHaveBeenCalledWith('/game/g-long');
  });

  test('?mock=empty shows the empty state with Add friend', async () => {
    mockParams.mockReturnValue({ mock: 'empty' });
    await render(<SocialScreen />);
    expect(await screen.findByText('No friends yet')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add friend' })).toBeTruthy();
    expect(screen.queryByText('Playing soon')).toBeNull();
  });

  test('shows the error state', async () => {
    mockParams.mockReturnValue({ mock: 'error' });
    await render(<SocialScreen />);
    expect(await screen.findByText("Couldn't load friends")).toBeTruthy();
  });
});

describe('Friend row', () => {
  test('falls back to initials when there is no photo', async () => {
    await render(
      <FriendRow
        friend={{
          id: 'x',
          full_name: 'Felipe Trujillo',
          avatar_url: null,
          home_campus: 'BBC',
          onboarding_completed_at: null,
          status: 'friend',
        }}
      />,
    );
    expect(screen.getByTestId('friend-avatar-fallback')).toBeTruthy();
    expect(screen.getByText('FT')).toBeTruthy();
    expect(screen.getByText('BBC')).toBeTruthy();
    expect(screen.queryByText('Pending')).toBeNull();
  });

  test('initials use the first two words', () => {
    expect(initials(LONG_NAME)).toBe('MA');
  });
});
