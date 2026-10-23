import { fireEvent, render, screen } from '@testing-library/react-native';

import { ButtonJoin } from '@/components/button-join';
import { SPLIT_DIRECTION, SplitBorder, splitGradientEnd } from '@/components/split-border';

// Render each SVG element as a plain host node so its props show up in the test tree.
jest.mock('react-native-svg', () => {
  const { createElement } = require('react');
  const host = (name: string) => (props: { children?: unknown }) => createElement(name, props, props.children as never);
  return { __esModule: true, default: host('Svg'), Defs: host('Defs'), LinearGradient: host('LinearGradient'), Rect: host('Rect'), Stop: host('Stop') };
});

type Node = { type: string; props: Record<string, unknown>; children: (Node | string)[] | null };

const findAll = (node: Node | string | (Node | string)[] | null, type: string): Node[] => {
  if (!node || typeof node === 'string') return [];
  if (Array.isArray(node)) return node.flatMap((n) => findAll(n, type));
  return [...(node.type === type ? [node] : []), ...findAll(node.children, type)];
};

const layout = (width: number, height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height } } });

// Where a point falls along the gradient line: 0 at the start, 1 at the end. Same rule SVG uses.
const positionAlong = (point: { x: number; y: number }, end: { x: number; y: number }) =>
  (point.x * end.x + point.y * end.y) / (end.x * end.x + end.y * end.y);

test.each([
  [40, 40],
  [120, 40],
  [343, 48],
  [80, 160],
])('the navy/gold split passes through the center of a %ix%i box', (width, height) => {
  const end = splitGradientEnd(width, height);
  expect(positionAlong({ x: width / 2, y: height / 2 }, end)).toBeCloseTo(0.5, 6);
  // Every corner lands inside the gradient line, so no part of the box is clamped to one color.
  for (const corner of [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height },
  ]) {
    const t = positionAlong(corner, end);
    expect(t).toBeGreaterThanOrEqual(-1e-9);
    expect(t).toBeLessThanOrEqual(1 + 1e-9);
  }
});

test('the gradient keeps the Figma angle on a wide box instead of stretching with it', () => {
  const end = splitGradientEnd(300, 50);
  expect(end.y / end.x).toBeCloseTo(SPLIT_DIRECTION.y / SPLIT_DIRECTION.x, 6);
  expect(Math.hypot(SPLIT_DIRECTION.x, SPLIT_DIRECTION.y)).toBeCloseTo(1, 6);
});

test('draws nothing until measured, then a pixel-space stroke with a hard stop at 0.5', async () => {
  await render(<SplitBorder testID="border" borderWidth={3} />);
  expect(findAll(screen.toJSON() as Node, 'Svg')).toHaveLength(0);

  await fireEvent(screen.getByTestId('border'), 'layout', layout(120, 40));

  const tree = screen.toJSON() as Node;
  const [gradient] = findAll(tree, 'LinearGradient');
  expect(gradient.props.gradientUnits).toBe('userSpaceOnUse');
  expect(gradient.props).toMatchObject({ x1: 0, y1: 0, ...{ x2: splitGradientEnd(120, 40).x, y2: splitGradientEnd(120, 40).y } });

  const stops = findAll(tree, 'Stop');
  expect(stops.map((s) => s.props.offset)).toEqual([0, 0.5, 0.5, 1]);
  expect(stops[0].props.stopColor).toBe(stops[1].props.stopColor);
  expect(stops[2].props.stopColor).toBe(stops[3].props.stopColor);
  expect(stops[0].props.stopColor).not.toBe(stops[2].props.stopColor);

  const [rect] = findAll(tree, 'Rect');
  expect(rect.props).toMatchObject({ x: 1.5, y: 1.5, width: 117, height: 37, strokeWidth: 3, fill: 'none' });
  expect(rect.props.stroke).toBe(`url(#${gradient.props.id})`);
});

test('two borders on one screen get different gradient ids', async () => {
  await render(
    <>
      <SplitBorder testID="a" />
      <SplitBorder testID="b" />
    </>,
  );
  await fireEvent(screen.getByTestId('a'), 'layout', layout(40, 40));
  await fireEvent(screen.getByTestId('b'), 'layout', layout(40, 40));
  const ids = findAll(screen.toJSON() as Node, 'LinearGradient').map((g) => g.props.id);
  expect(ids).toHaveLength(2);
  expect(ids[0]).not.toBe(ids[1]);
});

test('Button/Join calls onPress and respects disabled', async () => {
  const onPress = jest.fn();
  await render(<ButtonJoin onPress={onPress} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Join' }));
  expect(onPress).toHaveBeenCalledTimes(1);

  const disabledPress = jest.fn();
  await render(<ButtonJoin label="Full" disabled onPress={disabledPress} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Full' }));
  expect(disabledPress).not.toHaveBeenCalled();
});
