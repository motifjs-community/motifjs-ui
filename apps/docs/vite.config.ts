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
      { find: '@motifx-community/ui', replacement: here('../../src/index.ts') },
    ],
    // One @motifx/core only.
    dedupe: ['@motifx/core'],
  },
  server: {
    fs: { allow: [searchForWorkspaceRoot(here('.')), designSystem, dataLayer] },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
