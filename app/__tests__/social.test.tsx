import { fireEvent, render, screen } from '@testing-library/react-native';

import SocialScreen from '@/app/(tabs)/social';

test('renders mock chats with previews, timestamps, initials, and unread labels', async () => {
  await render(<SocialScreen />);
  expect(screen.getByText('Igor')).toBeTruthy();
  expect(screen.getByText('IG')).toBeTruthy();
  expect(screen.getByText('Are we still playing at 6?')).toBeTruthy();
  expect(screen.getByText('2m')).toBeTruthy();
  expect(screen.getByText('Basketball at MMC')).toBeTruthy();
  expect(screen.getAllByText('Unread').length).toBeGreaterThan(1);
});

test('filters chats by Groups and Unread, then restores All', async () => {
  await render(<SocialScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Groups' }));
  expect(screen.getByText('Basketball at MMC')).toBeTruthy();
  expect(screen.getByText('Soccer at Panther Field')).toBeTruthy();
  expect(screen.queryByText('Igor')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Unread' }));
  expect(screen.getByText('Igor')).toBeTruthy();
  expect(screen.getByText('Basketball at MMC')).toBeTruthy();
  expect(screen.queryByText('Soccer at Panther Field')).toBeNull();
  expect(screen.queryByText('Asad')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'All' }));
  expect(screen.getByText('Asad')).toBeTruthy();
});

test('switches to Friends and searches names without case sensitivity', async () => {
  await render(<SocialScreen />);
  await fireEvent.press(screen.getByRole('tab', { name: 'Friends' }));
  for (const name of ['Igor', 'Felipe', 'Ayman', 'Bryant', 'Asad']) {
    expect(screen.getByText(name)).toBeTruthy();
  }
  expect(screen.queryByRole('button', { name: 'Groups' })).toBeNull();
  await fireEvent.changeText(screen.getByLabelText('Search chats or people'), '  FELIPE  ');
  expect(screen.getByText('Felipe')).toBeTruthy();
  expect(screen.getByText('FT')).toBeTruthy();
  expect(screen.queryByText('Igor')).toBeNull();
});

test('shows empty states for both lists and restores chats when search is cleared', async () => {
  await render(<SocialScreen />);
  await fireEvent.changeText(screen.getByLabelText('Search chats or people'), 'no match');
  expect(screen.getByText('No conversations found.')).toBeTruthy();
  await fireEvent.press(screen.getByRole('tab', { name: 'Friends' }));
  expect(screen.getByText('No friends found.')).toBeTruthy();
  await fireEvent.press(screen.getByRole('tab', { name: 'Chats' }));
  await fireEvent.changeText(screen.getByLabelText('Search chats or people'), '');
  expect(screen.queryByText('No conversations found.')).toBeNull();
  expect(screen.getByText('Igor')).toBeTruthy();
});

test('combines chat search with the selected filter', async () => {
  await render(<SocialScreen />);
  await fireEvent.changeText(screen.getByLabelText('Search chats or people'), 'igor');
  expect(screen.getByText('Igor')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Groups' }));
  expect(screen.getByText('No conversations found.')).toBeTruthy();
});
