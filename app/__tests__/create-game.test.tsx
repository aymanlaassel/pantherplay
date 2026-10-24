import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useState } from 'react';

import CreateGameScreen from '@/app/game/create';
import { Chip } from '@/components/chip';
import { Stepper } from '@/components/stepper';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function StepperHarness({ start, min, max }: { start: number; min: number; max: number }) {
  const [value, setValue] = useState(start);
  return <Stepper value={value} onChange={setValue} min={min} max={max} unit="players" />;
}

test('Stepper stops at the minimum', async () => {
  await render(<StepperHarness start={3} min={2} max={5} />);
  await fireEvent.press(screen.getByLabelText('Decrease'));
  await fireEvent.press(screen.getByLabelText('Decrease'));
  expect(screen.getByText('2 players')).toBeTruthy();
  expect(screen.getByLabelText('Decrease')).toBeDisabled();
});

test('Stepper stops at the maximum', async () => {
  await render(<StepperHarness start={4} min={2} max={5} />);
  await fireEvent.press(screen.getByLabelText('Increase'));
  await fireEvent.press(screen.getByLabelText('Increase'));
  expect(screen.getByText('5 players')).toBeTruthy();
  expect(screen.getByLabelText('Increase')).toBeDisabled();
});

test('Chip reports selected state', async () => {
  await render(<Chip label="Soccer" selected />);
  expect(screen.getByRole('button', { name: 'Soccer' })).toBeSelected();
});

test('Create game shows every section and the Post button', async () => {
  await render(<CreateGameScreen />);
  for (const label of ['Sport', 'Date & time', 'Duration', 'Location', 'Players', 'Skill level', 'Notes']) {
    expect(screen.getByText(label)).toBeTruthy();
  }
  for (const label of ['1 hr', '1.5 hr', '2 hr', 'MMC', 'BBC']) expect(screen.getByText(label)).toBeTruthy();
  expect(screen.getByPlaceholderText('Anything players should know?')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Post game' })).toBeTruthy();
});

test('Create game player stepper never goes below 2', async () => {
  await render(<CreateGameScreen />);
  for (let i = 0; i < 12; i++) await fireEvent.press(screen.getByLabelText('Decrease'));
  expect(screen.getByText('2 players')).toBeTruthy();
});

test('tapping a chip selects it', async () => {
  await render(<CreateGameScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Basketball' }));
  expect(screen.getByRole('button', { name: 'Basketball' })).toBeSelected();
  expect(screen.getByRole('button', { name: 'Soccer' })).not.toBeSelected();
});

test('the close button goes back', async () => {
  await render(<CreateGameScreen />);
  await fireEvent.press(screen.getByLabelText('Close'));
  expect(router.back).toHaveBeenCalled();
});
