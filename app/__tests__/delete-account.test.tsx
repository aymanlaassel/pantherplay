import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import DeleteAccountScreen from '@/app/settings/delete-account';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
beforeEach(() => jest.clearAllMocks());

test('renders warning and approved deleted-data list without chat', async () => {
  await render(<DeleteAccountScreen />);
  expect(screen.getByText('This permanently deletes your account.')).toBeTruthy();
  for (const item of ['Your profile, photo and sports are removed', 'Your friends list is deleted', 'Games you host are canceled', 'You leave games you joined']) expect(screen.getByText(`•  ${item}`)).toBeTruthy();
  expect(screen.queryByText(/chat/i)).toBeNull();
});

test('only exact DELETE enables deletion and editing away disables it', async () => {
  await render(<DeleteAccountScreen />);
  const input = screen.getByLabelText('Type DELETE to confirm');
  const button = () => screen.getByRole('button', { name: 'Delete my account' });
  expect(button()).toBeDisabled();
  await fireEvent.press(button());
  for (const value of ['delete', 'Delete', 'DELET', ' DELETE', 'DELETE ', 'DELETE\n', 'DELETE!']) {
    await fireEvent.changeText(input, value);
    expect(button()).toBeDisabled();
    await fireEvent.press(button());
  }
  expect(router.back).not.toHaveBeenCalled();
  await fireEvent.changeText(input, 'DELETE');
  expect(button()).toBeEnabled();
  await fireEvent.changeText(input, '');
  expect(button()).toBeDisabled();
  await fireEvent.changeText(input, 'DELETE');
  await fireEvent.press(button());
  expect(router.back).toHaveBeenCalledTimes(1);
});

test.each(['Cancel', 'Back'])('%s returns without confirmation', async (label) => {
  await render(<DeleteAccountScreen />);
  await fireEvent.changeText(screen.getByLabelText('Type DELETE to confirm'), 'DEL');
  await fireEvent.press(screen.getByRole('button', { name: label }));
  expect(router.back).toHaveBeenCalledTimes(1);
});
