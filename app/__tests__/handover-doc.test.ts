import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..');
const handover = readFileSync(join(root, 'docs', 'HANDOVER.md'), 'utf8');

test('README links to the handover guide', () => {
  expect(readFileSync(join(root, 'README.md'), 'utf8')).toContain('(docs/HANDOVER.md)');
});

test('handover guide has every required section', () => {
  for (const heading of [
    'Prerequisites',
    'Run the app',
    'Run Supabase locally',
    'Run the checks',
    'Change the database and deploy migrations',
    'Where secrets live',
    'How login is built to be swapped',
    'Accounts to transfer',
    'Open items and known limits',
  ]) {
    expect(handover).toContain(`## ${heading}`);
  }
});

test('handover guide lists the accounts PantherSoft needs', () => {
  for (const account of ['**Supabase**', '**Google Cloud**', '**Apple Developer**', '**Expo / EAS**', '**GitHub**']) {
    expect(handover).toContain(account);
  }
});

test('every npm run command in the handover guide exists', () => {
  const { scripts } = JSON.parse(readFileSync(join(root, 'app', 'package.json'), 'utf8'));
  const used = [...handover.matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1]);
  expect(used.length).toBeGreaterThan(0);
  expect(used.filter((name) => !(name in scripts))).toEqual([]);
});

test('every env var the handover guide names is in .env.example', () => {
  const example = readFileSync(join(root, 'app', '.env.example'), 'utf8');
  const named = [...handover.matchAll(/EXPO_PUBLIC_[A-Z_]+/g)].map((m) => m[0]).filter((name) => name !== 'EXPO_PUBLIC_');
  expect(named.filter((name) => !example.includes(name))).toEqual([]);
});
