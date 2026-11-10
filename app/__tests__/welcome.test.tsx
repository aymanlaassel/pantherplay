import { router } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import WelcomeScreen from '@/app/(auth)/welcome';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

test('shows the tagline and a Get started button', async () => {
  await render(<WelcomeScreen />);
  expect(screen.getByText('Find a game\non campus today')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Get started' })).toBeTruthy();
});

test('Get started opens Sign in', async () => {
  await render(<WelcomeScreen />);
  fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
  expect(router.push).toHaveBeenCalledWith('/sign-in');
});
