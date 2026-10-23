import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const src = join(__dirname, '..', 'src');
const files = (readdirSync(src, { recursive: true }) as string[])
  .filter((f) => /\.(tsx?|jsx?|css)$/.test(f))
  .filter((f) => !f.startsWith('theme/') && !/\.test\.[tj]sx?$/.test(f));

test('scans the component files', () => {
  expect(files.length).toBeGreaterThan(5);
});

test.each(files)('%s has no raw hex color (use @/theme)', (file) => {
  const text = readFileSync(join(src, file), 'utf8');
  expect(text.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
});
