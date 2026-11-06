// Records the computed look of every kit element on every docs page, in every design language and
// theme: at rest, under keyboard focus and under the pointer. Two records compared with
// e2e/fingerprint-compare.mjs must be identical when a change is meant to leave the look alone (a
// refactor, a token moved, a rule rewritten); a difference names the page, the element and the
// property that changed.
// Run `npm run docs:build` first (or point BASE at a running docs site). Needs a local Chrome.
//
//   node e2e/fingerprint.mjs <out.json> [/page …]
//
// Env (all optional):
//   BASE         a running docs site (default: a preview of apps/docs/dist)
//   CHROME_PATH  path to chrome.exe (default: standard Windows install)
//   PW_CORE      path to playwright-core (default: resolved from node_modules)
//   PORT         preview port (default 4512)
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const chromePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pwPath = process.env.PW_CORE ?? 'playwright-core';
const port = Number(process.env.PORT ?? 4512);
let chromium;
try {
  ({ chromium } = require(pwPath));
} catch {
  ({ chromium } = await import(pathToFileURL(pwPath).href));
}

const [out, ...only] = process.argv.slice(2);
if (!out) {
  console.error('usage: node e2e/fingerprint.mjs <out.json> [/page …]');
  process.exit(2);
}
const PAGES = only.length
  ? only
  : [...readFileSync(join(root, 'apps/docs/app/pages.ts'), 'utf8').matchAll(/path: '\/([^']*)'/g)].map((m) => `/${m[1]}`);

// Every design language in every theme it ships; dark and light through the browser's color scheme.
const ds = dirname(require.resolve('@motifx-community/design-system/package.json'));
const { designLanguageThemes, defaultDesignLanguage } = await import(pathToFileURL(join(ds, 'dist/js/generated/tokens.js')).href);
const RUNS = Object.entries(designLanguageThemes).flatMap(([designLanguage, { themes }]) =>
  themes.map((theme) => ({ designLanguage, theme, scheme: theme === 'dark' ? 'dark' : 'light' })),
);

const PROPS = [
  'color', 'background-color', 'background-image', 'opacity',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-style', 'border-bottom-style',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'box-shadow', 'outline-style', 'outline-width', 'outline-color', 'outline-offset',
  'width', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'gap',
  'font-family', 'font-size', 'font-weight', 'line-height', 'translate', 'inset-block-start', 'inset-inline-start',
];
const MAX_ELEMENTS = 700;
const TABS = 30;
const HOVERS = 25;
// The parts a pointer changes.
const INTERACTIVE =
  '.mx-button__face, .mx-field__box, .mx-list__item, .mx-tree-view__row, .mx-tabs__tab, .mx-menu__item, .mx-check-box__input, .mx-radio-group__input, .mx-switch__input, .mx-accordion__header, .mx-menubar__item, .mx-calendar__cell, .mx-slider__thumb, .mx-tag-box__tag, .mx-field__button, .mx-data-grid__cell';

/** In the page: every kit element (capped), keyed by its kit classes and position, with its computed props and its marks. */
function capture({ props, max }) {
  const pick = (cs) => props.map((p) => cs.getPropertyValue(p)).join('|');
  const keyOf = (el) => {
    const parts = [];
    for (let e = el; e && e !== document.body && parts.length < 4; e = e.parentElement) {
      const cls = [...e.classList].filter((c) => c.startsWith('mx-') || c.startsWith('docs-')).join('.');
      parts.unshift(`${e.tagName.toLowerCase()}${cls ? '.' + cls : ''}`);
    }
    return parts.join('>');
  };
  const seen = {};
  const result = {};
  for (const el of [...document.querySelectorAll('[class*="mx-"], .docs-sidebar a, .docs-example__stage')].slice(0, max)) {
    const base = keyOf(el);
    seen[base] = (seen[base] ?? 0) + 1;
    const key = `${base}#${seen[base]}`;
    result[key] = pick(getComputedStyle(el));
    for (const pseudo of ['::before', '::after']) {
      const cs = getComputedStyle(el, pseudo);
      if (cs.content && cs.content !== 'none' && cs.content !== 'normal') result[`${key}${pseudo}`] = pick(cs);
    }
  }
  return result;
}

/** In the page: the focused element and its kit parents. */
function focused({ props }) {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const pick = (cs) => props.map((p) => cs.getPropertyValue(p)).join('|');
  const chain = [];
  for (let e = el; e && chain.length < 3; e = e.parentElement) {
    if (e === el || [...e.classList].some((c) => c.startsWith('mx-'))) chain.push(`${e.tagName}.${[...e.classList].join('.')}=${pick(getComputedStyle(e))}`);
  }
  return chain.join(' ^ ');
}

/** In the page: one hovered part and its ::before mark. */
function hovered(el, props) {
  const pick = (cs) => props.map((p) => cs.getPropertyValue(p)).join('|');
  const before = getComputedStyle(el, '::before');
  return `${el.tagName}.${[...el.classList].join('.')}=${pick(getComputedStyle(el))}${before.content !== 'none' ? ' ::before=' + pick(before) : ''}`;
}

let base = process.env.BASE;
let server;
const killServer = () => {
  if (!server) return;
  try {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    else server.kill('SIGTERM');
  } catch {}
};
if (!base) {
  base = `http://localhost:${port}`;
  server = spawn(process.execPath, [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', 'apps/docs', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });
  process.on('exit', killServer);
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(base, { signal: AbortSignal.timeout(1000) })).ok) break;
    } catch {}
    if (i === 60) {
      console.error('preview server never came up');
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}
base = base.replace(/\/$/, '');

const browser = await chromium.launch({ executablePath: chromePath });
const data = {};
const errors = [];
try {
  await Promise.all(
    RUNS.map(async ({ designLanguage, theme, scheme }) => {
      const name = `${designLanguage} ${theme}`;
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
      await ctx.addInitScript(([i, t]) => {
        localStorage.clear();
        if (i) localStorage.setItem('mx-docs-design-language', i);
        if (t) localStorage.setItem('mx-docs-theme', t);
      }, [designLanguage === defaultDesignLanguage ? null : designLanguage, theme === 'high-contrast' ? theme : null]);
      // One fixed day, so pages that show today (a calendar, a date box) look the same on every run.
      await ctx.clock.setFixedTime(new Date('2026-03-18T10:00:00'));
      const page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(`${name}: ${e}`));
      data[name] = {};
      for (const path of PAGES) {
        await page.goto(base + path);
        await page.waitForSelector('.docs-main');
        await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}' });
        await page.waitForTimeout(700);
        const entry = { rest: await page.evaluate(capture, { props: PROPS, max: MAX_ELEMENTS }), focus: [], hover: [] };
        await page.evaluate(() => document.activeElement?.blur());
        for (let i = 0; i < TABS; i++) {
          await page.keyboard.press('Tab');
          const record = await page.evaluate(focused, { props: PROPS });
          if (record) entry.focus.push(record);
        }
        await page.keyboard.press('Escape');
        for (const handle of (await page.$$(INTERACTIVE)).slice(0, HOVERS)) {
          if (!(await handle.isVisible())) continue;
          await handle.scrollIntoViewIfNeeded().catch(() => {});
          await handle.hover({ timeout: 1500 }).catch(() => {});
          entry.hover.push(await handle.evaluate(hovered, PROPS));
        }
        await page.mouse.move(1, 1);
        data[name][path] = entry;
      }
      await ctx.close();
    }),
  );
} finally {
  await browser.close();
  killServer();
}
writeFileSync(out, JSON.stringify({ props: PROPS, data }));
const count = Object.values(data).reduce((n, pages) => n + Object.values(pages).reduce((m, e) => m + Object.keys(e.rest).length, 0), 0);
console.log(`fingerprint: ${RUNS.length} runs, ${PAGES.length} pages, ${count} element records → ${out}`);
if (errors.length) {
  console.log(`${errors.length} page errors:\n${errors.slice(0, 5).join('\n')}`);
  process.exitCode = 1;
}
