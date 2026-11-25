import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { getGamesPlayed, getPlayer } from '@/api/profile';
import * as safety from '@/api/safety';
import GameDetailScreen from '@/app/game/[id]';
import PlayerProfileScreen from '@/app/player/[id]';
import { ReportSheet } from '@/features/safety/report-sheet';
import { mockBlocked, mockReports, resetMockBlocked } from '@/mock/blocks';
import { resetMockGames } from '@/mock/games';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), push: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: jest.fn(),
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('@/api/games', () => require('@/mock/games-api'));
jest.mock('@/lib/auth', () => ({ getUserId: jest.fn(async () => 'me') }));
jest.mock('@/api/profile', () => ({ getPlayer: jest.fn(), getGamesPlayed: jest.fn() }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const MAYA = { id: 'p2', fullName: 'Maya T.', avatarUrl: null, campus: 'BBC' as const };

// Game 2 is hosted by Maya T. (p2), and I'm a player in it.
const openGame = async () => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '2' });
  await render(<GameDetailScreen />);
  await fireEvent.press(screen.getByLabelText('More'));
};

const sendReport = async (row: string, reason: string, details = '') => {
  await fireEvent.press(screen.getByRole('button', { name: row }));
  await fireEvent.press(screen.getByRole('button', { name: reason }));
  if (details) await fireEvent.changeText(screen.getByLabelText('Details (optional)'), details);
  await fireEvent.press(screen.getByRole('button', { name: 'Send report' }));
};

// Answers the Block confirm alert with Block or Cancel.
const answerBlock = async (answer: 'Block' | 'Cancel') => {
  const alert = jest.mocked(Alert.alert);
  await act(async () => alert.mock.calls.at(-1)![2]!.find((b) => b.text === answer)!.onPress?.());
};

beforeEach(() => {
  resetMockGames();
  resetMockBlocked([]);
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.mocked(getPlayer).mockResolvedValue(MAYA);
  jest.mocked(getGamesPlayed).mockResolvedValue(3);
});
afterEach(() => jest.restoreAllMocks());

describe('from Game detail', () => {
  test('reporting the game asks for a reason, then thanks you', async () => {
    await openGame();
    await sendReport('Report game', 'Spam', '  Not a real game  ');
    expect(screen.getByText("Thanks, we'll review it")).toBeTruthy();
    expect(mockReports()).toEqual([{ targetType: 'game', targetId: '2', reason: 'spam', details: 'Not a real game' }]);
  });

  test('reporting the host sends a user report', async () => {
    await openGame();
    await sendReport('Report Maya T.', 'Harassment');
    expect(mockReports()).toEqual([{ targetType: 'user', targetId: 'p2', reason: 'harassment', details: null }]);
  });

  test('Send report stays disabled until a reason is picked', async () => {
    await openGame();
    await fireEvent.press(screen.getByRole('button', { name: 'Report game' }));
    expect(screen.getByRole('button', { name: 'Send report', disabled: true })).toBeTruthy();
  });

  test('details over 500 characters are flagged and cannot be sent', async () => {
    await openGame();
    await fireEvent.press(screen.getByRole('button', { name: 'Report game' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Spam' }));
    await fireEvent.changeText(screen.getByLabelText('Details (optional)'), 'x'.repeat(501));
    expect(screen.getByText('Keep it under 500 characters.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send report', disabled: true })).toBeTruthy();
  });

  test('a failed report shows a message and keeps the form', async () => {
    jest.spyOn(safety, 'report').mockRejectedValueOnce(new Error('offline'));
    await openGame();
    await sendReport('Report game', 'Unsafe behavior');
    expect(screen.getByText("Couldn't send your report. Try again.")).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send report' })).toBeTruthy();
  });

  test('blocking the host asks to confirm, then closes the game', async () => {
    await openGame();
    await fireEvent.press(screen.getByRole('button', { name: 'Block Maya T.' }));
    expect(Alert.alert).toHaveBeenCalledWith('Block Maya T.?', expect.any(String), expect.any(Array));
    await answerBlock('Block');
    expect(mockBlocked().map((p) => p.id)).toEqual(['p2']);
    expect(router.back).toHaveBeenCalled();
  });

  test('choosing Cancel does not block', async () => {
    await openGame();
    await fireEvent.press(screen.getByRole('button', { name: 'Block Maya T.' }));
    await answerBlock('Cancel');
    expect(mockBlocked()).toEqual([]);
    expect(router.back).not.toHaveBeenCalled();
  });

  test('a failed block shows a message and stays on the game', async () => {
    jest.spyOn(safety, 'blockUser').mockRejectedValueOnce(new Error('offline'));
    await openGame();
    await fireEvent.press(screen.getByRole('button', { name: 'Block Maya T.' }));
    await answerBlock('Block');
    expect(screen.getByText("Couldn't block. Try again.")).toBeTruthy();
    expect(router.back).not.toHaveBeenCalled();
  });
});

describe('from Player profile', () => {
  const openPlayer = async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'p2' });
    await render(<PlayerProfileScreen />);
    await screen.findByText('Maya T.');
  };

  test('More offers Report and Block for that player', async () => {
    await openPlayer();
    await fireEvent.press(screen.getByRole('button', { name: 'More' }));
    await sendReport('Report Maya T.', 'Inappropriate');
    expect(mockReports()).toEqual([{ targetType: 'user', targetId: 'p2', reason: 'inappropriate', details: null }]);
  });

  test('blocking closes the profile', async () => {
    await openPlayer();
    await fireEvent.press(screen.getByRole('button', { name: 'More' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Block Maya T.' }));
    await answerBlock('Block');
    expect(router.back).toHaveBeenCalled();
  });

  test('my own profile has no More button', async () => {
    jest.mocked(getPlayer).mockResolvedValue({ ...MAYA, id: 'me' });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'me' });
    await render(<PlayerProfileScreen />);
    await screen.findByText('Maya T.');
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
  });
});

test('works for a chat message, with no Block when nobody is given', async () => {
  const onClose = jest.fn();
  await render(<ReportSheet visible reports={[{ type: 'message', id: 'm1', label: 'Report message' }]} onClose={onClose} />);
  expect(screen.queryByText(/^Block/)).toBeNull();
  await sendReport('Report message', 'Something else');
  expect(mockReports()).toEqual([{ targetType: 'message', targetId: 'm1', reason: 'other', details: null }]);
  await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalled();
});
