import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Windows lists paths as `theme\index.ts`, so normalize separators before matching.
function scannable(paths: string[]): string[] {
  return paths
    .filter((f) => /\.(tsx?|jsx?|css)$/.test(f))
    .filter((f) => {
      const p = f.replace(/\\/g, '/');
      return !p.startsWith('theme/') && !/\.test\.[tj]sx?$/.test(p);
    });
}

function rawHex(text: string): string[] {
  return text.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
}

const src = join(__dirname, '..', 'src');
const files = scannable(readdirSync(src, { recursive: true }) as string[]);

test('scans the component files', () => {
  expect(files.length).toBeGreaterThan(5);
});

test('excludes theme\\ and test files given Windows-style paths', () => {
  expect(
    scannable(['theme\\index.ts', 'theme\\colors.ts', 'components\\button.tsx', 'components\\button.test.tsx']),
  ).toEqual(['components\\button.tsx']);
});

test('still flags a raw hex in a file outside theme', () => {
  expect(scannable(['components\\card.tsx', 'components/card.tsx'])).toEqual([
    'components\\card.tsx',
    'components/card.tsx',
  ]);
  expect(rawHex("color: '#002C4F'")).toEqual(['#002C4F']);
});

test.each(files)('%s has no raw hex color (use @/theme)', (file) => {
  const text = readFileSync(join(src, file), 'utf8');
  expect(rawHex(text)).toEqual([]);
});
