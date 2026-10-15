import compiler from '@motifx/compiler';
import { readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, searchForWorkspaceRoot } from 'vite';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
// The design system may be a linked sibling checkout (file:../motifjs-design-system):
// the dev server has to be allowed to serve files from its real path.
const designSystem = dirname(createRequire(import.meta.url).resolve('@motifx-community/design-system/package.json'));

// The docs import the package by its published name, resolved to the source,
// so the pages always run against the current code without a build step.
// Run `npm run tokens` first: the styles import the generated component tokens.
export default defineConfig({
  base: './',
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
    fs: { allow: [searchForWorkspaceRoot(here('.')), designSystem] },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Every folder with an index.html is a page.
      input: {
        home: here('index.html'),
        ...Object.fromEntries(
          readdirSync(here('.'), { withFileTypes: true })
            .filter((d) => d.isDirectory() && d.name !== 'dist' && existsSync(here(`${d.name}/index.html`)))
            .map((d) => [d.name, here(`${d.name}/index.html`)]),
        ),
      },
    },
  },
});
