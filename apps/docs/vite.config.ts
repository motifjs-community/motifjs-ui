import compiler from '@motifx/compiler';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, searchForWorkspaceRoot } from 'vite';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
// The design system may be a linked sibling checkout (file:../motifjs-design-system):
// the dev server has to be allowed to serve files from its real path.
const designSystem = dirname(createRequire(import.meta.url).resolve('@motifx-community/design-system/package.json'));
const dataLayer = dirname(createRequire(import.meta.url).resolve('@motifx-community/data/package.json'));
const i18n = dirname(createRequire(import.meta.url).resolve('@motifx-community/i18n/package.json'));

// The docs import the package by its published name, resolved to the source,
// so the pages always run against the current code without a build step.
// Run `npm run tokens` first: the styles import the generated component tokens.
export default defineConfig({
  plugins: [compiler()],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: [
      { find: '@motifx-community/ui/styles.css', replacement: here('../../src/styles/index.css') },
      { find: '@motifx-community/ui/tokens', replacement: here('../../src/tokens/index.ts') },
      { find: '@motifx-community/ui/excel', replacement: here('../../src/excel/index.ts') },
      { find: '@motifx-community/ui/pdf', replacement: here('../../src/pdf/index.ts') },
      { find: '@motifx-community/ui', replacement: here('../../src/index.ts') },
    ],
    // One @motifx/core only.
    dedupe: ['@motifx/core'],
  },
  // The dependency scan turns pages with `import.meta.glob` into plain JS. With the compiler's
  // default (`jsx: 'preserve'`) their JSX stays in and the scan fails; the scan only reads
  // imports, so any JSX form that needs no import of its own will do. The compiler adds the
  // devtools import itself, where the scan cannot see it.
  optimizeDeps: {
    include: ['@motifx/core/devtools'],
    rolldownOptions: { transform: { jsx: { runtime: 'classic', pragma: 'h', pragmaFrag: 'Fragment' } } },
  },
  server: {
    fs: { allow: [searchForWorkspaceRoot(here('.')), designSystem, dataLayer, i18n] },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Two apps: the docs, and the smart home panel that the showcase shows in a tablet frame.
    rolldownOptions: {
      input: { docs: here('index.html'), smartHome: here('smart-home/index.html') },
    },
    // The browsers the kit supports (README: Browsers). An older target makes the minifier rewrite :dir(rtl) as a list
    // of :lang() values, which a page with dir="rtl" but another lang never matches.
    cssTarget: ['chrome120', 'edge120', 'firefox128', 'safari18'],
  },
});
