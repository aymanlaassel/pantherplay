import type { Game } from '@/api/types';
import { gameState } from '@/lib/game-state';
import { initials } from '@/lib/initials';
import { mockGames } from '@/mock/games';

const now = new Date('2030-01-01T12:00:00Z');
const base: Game = { ...mockGames()[0], startsAt: '2030-01-01T19:00:00Z', status: 'open', spotsFilled: 4, myStatus: null };

test('a cancelled game is cancelled, even if you were in it', () => {
  expect(gameState({ ...base, status: 'cancelled', myStatus: 'joined' }, now)).toBe('cancelled');
});

test('being in a game wins over how full it is', () => {
  expect(gameState({ ...base, spotsFilled: 10, myStatus: 'joined' }, now)).toBe('joined');
});

test('no spots left is full', () => {
  expect(gameState({ ...base, spotsFilled: 10 }, now)).toBe('full');
});

test('being on the waitlist does not show a Full badge', () => {
  expect(gameState({ ...base, spotsFilled: 10, myStatus: 'waitlisted' }, now)).toBe('open');
});

test('a game about to start is starting soon', () => {
  expect(gameState({ ...base, startsAt: '2030-01-01T12:05:00Z' }, now)).toBe('starting-soon');
  expect(gameState({ ...base, startsAt: '2030-01-01T11:55:00Z' }, now)).toBe('open');
});

test('3 or fewer spots left is almost full, otherwise open', () => {
  expect(gameState({ ...base, spotsFilled: 7 }, now)).toBe('almost-full');
  expect(gameState({ ...base, spotsFilled: 6 }, now)).toBe('open');
});

test('initials use the first two words only', () => {
  expect(initials('Alex R.')).toBe('AR');
  expect(initials('Bartholomew Maximilian Fitzgerald-Montgomery III')).toBe('BM');
  expect(initials('  cher ')).toBe('C');
});
