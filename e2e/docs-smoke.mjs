// Real-browser checks over the built docs site: axe-core on every page, the
// theme/density switches, and Control, focus and the keyboard in a real
// browser — what jsdom cannot show.
// Run `npm run docs:build` first. Not CI-gated: it needs a local Chrome.
//
//   node e2e/docs-smoke.mjs
//
// Env (all optional):
//   CHROME_PATH  path to chrome.exe (default: standard Windows install)
//   PW_CORE      path to playwright-core (default: resolved from node_modules)
//   PORT         preview port (default 4510)
import { spawn, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const chromePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pwPath = process.env.PW_CORE ?? 'playwright-core';
const port = Number(process.env.PORT ?? 4510);
const base = `http://localhost:${port}/`;

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require(pwPath));
} catch {
  ({ chromium } = await import(pathToFileURL(pwPath).href));
}
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
// Every page of the site, from its page list.
const PATHS = [...readFileSync(join(root, 'apps/docs/app/pages.ts'), 'utf8').matchAll(/path: '\/([^']*)'/g)].map((m) => m[1]);

let failed = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!ok) failed++;
};

// Vite preview over apps/docs/dist.
const server = spawn(
  process.execPath,
  [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', 'apps/docs', '--port', String(port), '--strictPort'],
  { cwd: root, stdio: 'ignore' },
);
const killServer = () => {
  try {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    else server.kill('SIGTERM');
  } catch {}
};
process.on('exit', killServer);
for (let i = 0; ; i++) {
  try {
    if ((await fetch(base, { signal: AbortSignal.timeout(1000) })).ok) break;
  } catch {}
  if (i === 60) { console.error('preview server never came up'); process.exit(1); }
  await new Promise((r) => setTimeout(r, 250));
}

const browser = await chromium.launch({ executablePath: chromePath });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  // Axe on every page, in light and dark.
  for (const path of PATHS) {
    await page.goto(base + path, { waitUntil: 'load' });
    await page.addScriptTag({ content: axeSource });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
      // Let the 120ms color transitions settle; axe snapshots styles early in its run.
      await page.waitForTimeout(300);
      const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
      check(`axe clean on /${path} (${theme})`, violations.length === 0, violations.join(', '));
    }
  }

  // Each page's own checks: e2e/checks/*.mjs, in name order.
  const box = (loc) => loc.evaluate((el) => el.getBoundingClientRect().toJSON());
  for (const file of readdirSync(join(root, 'e2e', 'checks')).filter((f) => f.endsWith('.mjs')).sort()) {
    const run = (await import(pathToFileURL(join(root, 'e2e', 'checks', file)).href)).default;
    await run({ page, base, check, axeSource, box });
  }

  check('no uncaught page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  killServer();
}

console.log(failed === 0 ? '\nSMOKE OK' : `\nSMOKE FAILED (${failed})`);
process.exit(failed === 0 ? 0 : 1);
