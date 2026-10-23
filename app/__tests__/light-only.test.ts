import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const app = join(__dirname, '..');

test('app.json forces light mode', () => {
  const config = JSON.parse(readFileSync(join(app, 'app.json'), 'utf8'));
  expect(config.expo.userInterfaceStyle).toBe('light');
});

test('no source file has dark-mode code', () => {
  const src = join(app, 'src');
  for (const file of readdirSync(src, { recursive: true }) as string[]) {
    if (!/\.tsx?$/.test(file)) continue;
    const text = readFileSync(join(src, file), 'utf8');
    expect({ file, darkMode: /DarkTheme|useColorScheme|prefers-color-scheme/.test(text) }).toEqual({
      file,
      darkMode: false,
    });
  }
});
