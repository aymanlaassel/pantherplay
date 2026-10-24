import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { getCurrentProfile, mockLongNameProfile } from '@/api';
import { mockCurrentProfile } from '@/api/profile';
import ProfileScreen from '@/app/(tabs)/profile';
import { Avatar, initials } from '@/components/avatar';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockParams = useLocalSearchParams as jest.Mock;

beforeEach(() => {
  mockParams.mockReturnValue({});
  jest.mocked(router.push).mockClear();
});

test('getCurrentProfile returns the profile with sports and counts', async () => {
  const profile = await getCurrentProfile();
  expect(profile.full_name).toBe('Ana Rodriguez');
  expect(profile.sports.length).toBeGreaterThan(0);
  expect(typeof profile.games_hosted).toBe('number');
  expect(typeof profile.games_played).toBe('number');
});

describe('Profile screen', () => {
  test('renders the mock profile: name, campus, sports with levels, game counts', async () => {
    await render(<ProfileScreen />);
    expect(await screen.findByText(mockCurrentProfile.full_name)).toBeTruthy();
    expect(screen.getByText('MMC campus')).toBeTruthy();
    expect(screen.getByText('Soccer')).toBeTruthy();
    expect(screen.getByText('Intermediate')).toBeTruthy();
    expect(screen.getByText('Basketball')).toBeTruthy();
    expect(screen.getByLabelText(`${mockCurrentProfile.games_hosted} Hosted`)).toBeTruthy();
    expect(screen.getByLabelText(`${mockCurrentProfile.games_played} Played`)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Edit profile' })).toBeTruthy();
    expect(screen.queryByTestId('avatar-fallback')).toBeNull();
  });

  test('?mock=long renders the very long name on two lines max with initials for no avatar', async () => {
    mockParams.mockReturnValue({ mock: 'long' });
    await render(<ProfileScreen />);
    const name = await screen.findByText(mockLongNameProfile.full_name);
    expect(name.props.numberOfLines).toBe(2);
    expect(screen.getByTestId('avatar-fallback')).toBeTruthy();
    expect(screen.getByText('MA')).toBeTruthy();
    expect(screen.getByText('BBC campus')).toBeTruthy();
  });

  test('the gear opens Settings', async () => {
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Settings' }));
    expect(router.push).toHaveBeenCalledWith('/settings');
  });
});

describe('Avatar', () => {
  test('null url shows initials', async () => {
    await render(<Avatar name="Felipe Trujillo" url={null} />);
    expect(screen.getByTestId('avatar-fallback')).toBeTruthy();
    expect(screen.getByText('FT')).toBeTruthy();
  });

  test('initials use the first two words', () => {
    expect(initials('  ana   maria rodriguez ')).toBe('AM');
    expect(initials('Cher')).toBe('C');
  });
});
