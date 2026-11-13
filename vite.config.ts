/// <reference types="vitest/config" />
import compiler from '@motifx/compiler';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const entry = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Library build: one entry per subpath. The compiler plugin lowers JSX before
// anything else runs (enforce: 'pre' inside the plugin), so consumers need no
// compiler setup. CSS is assembled separately by scripts/build-css.mjs.
export default defineConfig({
  plugins: [compiler()],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    // One @motifx/core only: two copies would mean two reactivity engines.
    dedupe: ['@motifx/core'],
  },
  build: {
    lib: {
      entry: {
        index: entry('./src/index.ts'),
        'tokens/index': entry('./src/tokens/index.ts'),
        'excel/index': entry('./src/excel/index.ts'),
        'pdf/index': entry('./src/pdf/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    rollupOptions: {
      // @motifx/core and the design system are peers: bundling core would mean
      // two reactivity engines, bundling the token map a second copy of it.
      // ExcelJS and jsPDF are the app's: the excel and pdf entries only write to what they are given.
      external: [/^@motifx\/core/, /^@motifx-community\/design-system/, /^@motifx-community\/data/, /^@motifx-community\/i18n/, /^exceljs/, /^jspdf/],
    },
    sourcemap: true,
    minify: false,
    target: 'es2021',
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    // The test document has no element scroll methods, and core's attr keys write through them.
    setupFiles: ['tests/setup/scroll-methods.ts'],
    // The docs examples the tree test mounts import the kit by its name: the source, not a build.
    alias: [
      { find: /^@motifx-community\/ui$/, replacement: entry('./src/index.ts') },
      { find: /^@motifx-community\/ui\/(excel|pdf|tokens)$/, replacement: entry('./src/$1/index.ts') },
    ],
  },
});
