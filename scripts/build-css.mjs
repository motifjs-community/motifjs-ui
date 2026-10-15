// Assembles the shipped CSS. `src/styles/index.css` is a list of @import
// lines; this inlines the relative ones (recursively) into dist/styles.css.
// The bare import of `@motifx-community/design-system/styles.css` is kept as
// written: the app's bundler resolves it, so the design system is loaded
// once, before this kit's layer. Run `npm run tokens` first (npm run build does).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function inline(file, seen = new Set()) {
  const abs = resolve(file);
  if (seen.has(abs)) return '';
  seen.add(abs);
  return readFileSync(abs, 'utf8').replace(/^@import\s+'([^']+)';\s*$/gm, (line, spec) =>
    spec.startsWith('.') ? inline(resolve(dirname(abs), spec), seen) : line + '\n',
  );
}

mkdirSync(join(root, 'dist'), { recursive: true });
const css = inline(join(root, 'src', 'styles', 'index.css'));
writeFileSync(join(root, 'dist', 'styles.css'), css);
console.log(`css: dist/styles.css (${(css.length / 1024).toFixed(1)} kB)`);
