// The site's texts per language. English is the source and the key (apps/docs/app/texts.ts); every page of the built
// site is opened and the texts it asks for are noted, so this list is what readers really see. Each language has a
// file per page, and site.json holds the frame of the site and whatever several pages share.
//
//   npm run docs:build && npx vite preview apps/docs --port 4510
//   BASE=http://localhost:4510 node scripts/docs-texts.mjs tr            says what is missing
//   BASE=http://localhost:4510 node scripts/docs-texts.mjs tr --write    also adds the missing ones as "" and drops the dead ones
//
// Env: BASE (default http://localhost:4510), CHROME_PATH, PW_CORE (as e2e/docs-smoke.mjs).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.env.BASE ?? 'http://localhost:4510').replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pwPath = process.env.PW_CORE ?? 'playwright-core';
const language = process.argv[2];
const write = process.argv.includes('--write');
if (!language) throw new Error('docs-texts: which language? node scripts/docs-texts.mjs tr');

const require = createRequire(join(root, 'package.json'));
const { chromium } = await import(pathToFileURL(join(pwPath, 'index.mjs')).href).catch(() => require(pwPath));

// The site's pages, from apps/docs/app/pages.ts (as scripts/build-llms.mjs reads them).
const source = readFileSync(join(root, 'apps/docs/app/pages.ts'), 'utf8');
const pages = [...source.matchAll(/id: '([^']+)', label: '[^']*', title: (?:'[^']*'|"[^"]*"), path: '([^']+)'/g)].map((m) => ({ id: m[1], path: m[2] }));

// Code, types and marks alone: nothing to translate.
const worded = (text) => /\p{L}{2}/u.test(text.replace(/`[^`]*`/g, ''));

const browser = await chromium.launch({ executablePath: chromePath });
const seen = new Map();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => (window.__docsTexts = new Set()));
  for (const p of pages) {
    await page.goto(base + p.path, { waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('.docs-article')?.childElementCount > 1 && window.__docsTexts.size > 0, null, { timeout: 15000 });
    await page.waitForTimeout(200);
    seen.set(p.id, new Set((await page.evaluate(() => [...window.__docsTexts])).filter(worded)));
  }
} finally {
  await browser.close();
}

// Asked for only after a press, or on the page that is not found: no walk over the pages reaches them.
const ON_DEMAND = ['Hide code', 'Copy', 'Copied', 'System', 'Light', 'Dark', 'High contrast', 'Page not found', 'No page matches.', 'Feedback', 'Submit GitHub Issue', 'Issues for this page', 'Open Issues', 'Closed Issues', 'Loading issues…', 'Issues could not be loaded.', 'View all issues', 'No open issues for this page.', 'No closed issues for this page.', 'opened on {date}', 'closed on {date}'];

// On every page: the frame. On several pages: shared, so it is translated once.
const counts = new Map(ON_DEMAND.map((text) => [text, 2]));
for (const texts of seen.values()) for (const text of texts) counts.set(text, (counts.get(text) ?? 0) + 1);
const shared = new Set([...counts].filter(([, n]) => n > 1).map(([text]) => text));
const files = new Map([['site', [...shared].sort()]]);
for (const [id, texts] of seen) files.set(id, [...texts].filter((text) => !shared.has(text)));

const dir = join(root, 'apps/docs/locales', language);
mkdirSync(dir, { recursive: true });

// Whatever is already translated, wherever it was, keeps its translation.
const known = new Map();
for (const id of files.keys()) {
  const path = join(dir, `${id}.json`);
  if (!existsSync(path)) continue;
  for (const [key, text] of Object.entries(JSON.parse(readFileSync(path, 'utf8')))) if (text) known.set(key, text);
}

let missing = 0;
let done = 0;
let words = 0;
const lines = [];
for (const [id, keys] of files) {
  const empty = keys.filter((key) => !known.has(key));
  missing += empty.length;
  done += keys.length - empty.length;
  words += empty.reduce((n, key) => n + key.split(/\s+/).length, 0);
  if (empty.length) lines.push(`${id}: ${empty.length} of ${keys.length}`);
  if (write && keys.length) writeFileSync(join(dir, `${id}.json`), `${JSON.stringify(Object.fromEntries(keys.map((key) => [key, known.get(key) ?? ''])), null, 2)}\n`);
}
console.log(lines.join('\n'));
console.log(`${language}: ${done} translated, ${missing} missing (${words} words) in ${files.size} files`);
