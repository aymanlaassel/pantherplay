// Small outline icons for the Home screen, drawn on a 24px grid like icon/pin in the map row.
import Svg, { Path } from 'react-native-svg';

const PATHS = {
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4.35-4.35',
  filter: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9ZM10.3 21a1.94 1.94 0 0 0 3.4 0',
  person: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  pin: 'M12 21C12 21 5 14.8 5 10a7 7 0 0 1 14 0c0 4.8-7 11-7 11ZM14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  check: 'M5 12l5 5L20 7',
} as const;

export type IconName = keyof typeof PATHS;

type IconProps = { name: IconName; color: string; size?: number };

export function Icon({ name, color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={PATHS[name]} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
