// Measures what each entry really costs on its own: bundles `export * from
// '<entry>'` against dist/ with rolldown (the bundler inside Vite 8), minified,
// peers external. The CSS entry is measured as-is (without the design
// system it imports). Prints raw and gzip bytes —
// the numbers quoted in the README. Run `npm run build` first.
import { gzipSync } from 'node:zlib';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { rolldown } from 'rolldown';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const entries = ['index', 'tokens/index', 'excel/index'];

const work = mkdtempSync(join(tmpdir(), 'ui-sizes-'));
const rows = [];
try {
  for (const entry of entries) {
    const file = join(work, entry.replace('/', '_') + '.js');
    writeFileSync(file, `export * from ${JSON.stringify(pathToFileURL(join(root, 'dist', entry + '.js')).href)};\n`);
    const bundle = await rolldown({
      input: file,
      external: [/^@motifx\//],
      resolve: { modules: [join(root, 'node_modules')] },
    });
    const { output } = await bundle.generate({ format: 'es', minify: true });
    const code = output.filter((o) => o.type === 'chunk').map((o) => o.code).join('');
    rows.push({
      entry: entry === 'index' ? '. (components)' : './' + entry.replace('/index', ''),
      raw: Buffer.byteLength(code),
      gzip: gzipSync(Buffer.from(code), { level: 9 }).length,
    });
    await bundle.close();
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

for (const file of ['styles.css']) {
  const css = readFileSync(join(root, 'dist', file));
  rows.push({ entry: './' + file, raw: css.length, gzip: gzipSync(css, { level: 9 }).length });
}

const kb = (n) => (n / 1024).toFixed(2) + ' kB';
console.log('entry'.padEnd(26), 'min'.padStart(10), 'min+gzip'.padStart(10));
for (const r of rows) console.log(r.entry.padEnd(26), kb(r.raw).padStart(10), kb(r.gzip).padStart(10));
