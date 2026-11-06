// The design languages the design system ships, and the themes of each, read from its token folders:
// a language added there is checked here without a change. (The package's script entry is for
// bundlers, so plain node reads the folders.)
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const ds = dirname(createRequire(import.meta.url).resolve('@motifx-community/design-system/package.json'));
const root = join(ds, 'tokens', 'design-language');
const THEMES = ['light', 'dark', 'high-contrast'];

/** Every design language, the value of `data-design-language`. */
export const designLanguages = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

/** The themes each language ships. */
export const designLanguageThemes = Object.fromEntries(designLanguages.map((id) => [id, { themes: THEMES.filter((t) => existsSync(join(root, id, `${t}.json`))) }]));
