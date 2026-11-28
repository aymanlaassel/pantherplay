import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { confirmAdult } from '@/api/profile';
import AdultScreen from '@/app/(onboarding)/adult';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/api/profile', () => ({ confirmAdult: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(confirmAdult).mockResolvedValue();
});

const continueIsDisabled = () => screen.getByRole('button', { name: 'Continue' }).props.accessibilityState.disabled;
const checkbox = () => screen.getByRole('checkbox', { name: "I confirm I'm 18 or older" });

test('Continue stays disabled until the box is checked, and again if it is unchecked', async () => {
  await render(<AdultScreen />);
  expect(continueIsDisabled()).toBe(true);
  expect(checkbox().props.accessibilityState.checked).toBe(false);

  await fireEvent.press(checkbox());
  expect(checkbox().props.accessibilityState.checked).toBe(true);
  expect(continueIsDisabled()).toBe(false);

  await fireEvent.press(checkbox());
  expect(continueIsDisabled()).toBe(true);
});

test('pressing Continue before checking does nothing', async () => {
  await render(<AdultScreen />);
  await fireEvent.press(screen.getByText('Continue'));
  expect(confirmAdult).not.toHaveBeenCalled();
  expect(router.push).not.toHaveBeenCalled();
});

test('confirming saves the time and moves on to Campus', async () => {
  await render(<AdultScreen />);
  await fireEvent.press(checkbox());
  await fireEvent.press(screen.getByText('Continue'));
  expect(confirmAdult).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith('./campus');
});

test('stays on the step and says so when saving fails', async () => {
  jest.mocked(confirmAdult).mockRejectedValue(new Error('offline'));
  await render(<AdultScreen />);
  await fireEvent.press(checkbox());
  await fireEvent.press(screen.getByText('Continue'));
  expect(screen.getByText("Couldn't save that. Try again.")).toBeTruthy();
  expect(router.push).not.toHaveBeenCalled();
});

test('asks for no birthdate', async () => {
  await render(<AdultScreen />);
  expect(screen.queryByText(/birthdate|date of birth/i)).toBeNull();
  expect(screen.getByText(/We don't ask for your birthday/)).toBeTruthy();
});
