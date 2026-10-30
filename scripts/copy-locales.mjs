// Copies the language packs to dist/locales, where the package shares them as
// `@motifx-community/ui/locales/<language>.json` for apps that load them themselves.
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'src', 'locales');
const to = join(root, 'dist', 'locales');
mkdirSync(to, { recursive: true });
for (const file of readdirSync(from)) if (file.endsWith('.json')) cpSync(join(from, file), join(to, file));
