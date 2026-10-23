import { fireEvent, render, screen } from '@testing-library/react-native';

import { BadgeLevel, SKILL_LEVEL_LABEL, type SkillLevel } from '@/components/badge-level';
import { BADGE_STATUS_LABEL, BadgeStatus, type GameBadgeStatus } from '@/components/badge-status';
import { ButtonFilled } from '@/components/button-filled';
import { ButtonOutline } from '@/components/button-outline';
import { colors } from '@/theme';

const statuses = Object.keys(BADGE_STATUS_LABEL) as GameBadgeStatus[];
const levels = Object.keys(SKILL_LEVEL_LABEL) as SkillLevel[];

test('Badge/Status has the five states from Figma', () => {
  expect(statuses).toEqual(['starting-soon', 'almost-full', 'full', 'joined', 'cancelled']);
});

test.each(statuses)('Badge/Status renders the "%s" state', async (status) => {
  await render(<BadgeStatus status={status} />);
  expect(screen.getByText(BADGE_STATUS_LABEL[status])).toBeTruthy();
});

test('Badge/Status states that mean different things look different', async () => {
  await render(
    <>
      <BadgeStatus status="joined" />
      <BadgeStatus status="cancelled" />
      <BadgeStatus status="full" />
    </>,
  );
  expect(screen.getByText('Joined')).toHaveStyle({ color: colors.text.success });
  expect(screen.getByText('Cancelled')).toHaveStyle({ color: colors.text.error });
  expect(screen.getByText('Full')).toHaveStyle({ color: colors.text.muted });
});

test.each(levels)('Badge/Level renders "%s"', async (level) => {
  await render(<BadgeLevel level={level} />);
  expect(screen.getByText(SKILL_LEVEL_LABEL[level])).toBeTruthy();
});

test.each([
  ['Button/Filled', ButtonFilled],
  ['Button/Outline', ButtonOutline],
] as const)('%s presses and respects disabled', async (_name, Button) => {
  const onPress = jest.fn();
  await render(<Button label="Go" onPress={onPress} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Go' }));
  expect(onPress).toHaveBeenCalledTimes(1);

  const disabledPress = jest.fn();
  await render(<Button label="Stop" disabled onPress={disabledPress} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Stop' }));
  expect(disabledPress).not.toHaveBeenCalled();
});
