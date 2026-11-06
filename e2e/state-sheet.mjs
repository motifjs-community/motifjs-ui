// The state sheet: every interactive part of the kit, in every state (at rest, under the pointer,
// pressed, under keyboard focus, and the states it is put in: checked, selected, invalid, disabled,
// read-only), in every design language and theme, side by side on one HTML page. It is the page to
// look at when a language is added or changed: one row per part and language, one column per state.
// Run `npm run docs:build` first (or point BASE at a running docs site). Needs a local Chrome.
//
//   node e2e/state-sheet.mjs <out-dir>        then open <out-dir>/index.html
//
// Env (all optional): BASE, CHROME_PATH, PW_CORE, PORT (default 4513), as in e2e/fingerprint.mjs.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const chromePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pwPath = process.env.PW_CORE ?? 'playwright-core';
const port = Number(process.env.PORT ?? 4513);
let chromium;
try {
  ({ chromium } = require(pwPath));
} catch {
  ({ chromium } = await import(pathToFileURL(pwPath).href));
}

const out = process.argv[2];
if (!out) {
  console.error('usage: node e2e/state-sheet.mjs <out-dir>');
  process.exit(2);
}
mkdirSync(out, { recursive: true });

const ds = dirname(require.resolve('@motifx-community/design-system/package.json'));
const { designLanguageThemes, defaultDesignLanguage } = await import(pathToFileURL(join(ds, 'dist/js/generated/tokens.js')).href);
const RUNS = Object.entries(designLanguageThemes).flatMap(([designLanguage, { themes }]) =>
  themes.map((theme) => ({ designLanguage, theme, scheme: theme === 'dark' ? 'dark' : 'light' })),
);

const LIVE = ['rest', 'hover', 'pressed', 'focus'];
// What a part's look is set by, put on an existing instance (the kit draws from these attributes):
// [what, value].
const set = {
  tone: (tone, variant) => ['tone', [tone, variant]],
  disabledButton: ['disabled-button'],
  field: (state) => ['field', [state]],
  check: (state) => ['check', [state]],
  disabledCheck: ['disabled-check'],
  tabs: (variant) => ['tabs', [variant]],
};

// Each row: a part on a docs page, the box photographed around it, what takes focus, the states.
const ROWS = [
  { label: 'Button, standard', path: '/button', frame: '.mx-button', target: '.mx-button[data-variant="solid"] > .mx-button__face', setup: set.tone('standard', 'solid') },
  { label: 'Button, accent', path: '/button', frame: '.mx-button', target: '.mx-button[data-variant="solid"][data-tone="accent"] > .mx-button__face' },
  { label: 'Button, outline', path: '/button', frame: '.mx-button', target: '.mx-button[data-variant="outline"] > .mx-button__face' },
  { label: 'Button, ghost', path: '/button', frame: '.mx-button', target: '.mx-button[data-variant="outline"] > .mx-button__face', setup: set.tone('standard', 'ghost') },
  { label: 'Button, disabled', path: '/button', frame: '.mx-button', target: '.mx-button[data-variant="solid"][data-tone="accent"] > .mx-button__face', setup: set.disabledButton, states: ['rest', 'hover'] },
  { label: 'Text box', path: '/textbox', frame: '.mx-field', target: '.mx-field:not([data-label-mode="floating"]) .mx-field__box', focus: 'input' },
  { label: 'Text box, invalid', path: '/textbox', frame: '.mx-field', target: '.mx-field:not([data-label-mode="floating"]) .mx-field__box', focus: 'input', setup: set.field('invalid') },
  { label: 'Text box, read-only', path: '/textbox', frame: '.mx-field', target: '.mx-field:not([data-label-mode="floating"]) .mx-field__box', focus: 'input', setup: set.field('readonly') },
  { label: 'Text box, disabled', path: '/textbox', frame: '.mx-field', target: '.mx-field:not([data-label-mode="floating"]) .mx-field__box', setup: set.field('disabled'), states: ['rest', 'hover'] },
  { label: 'Drop-down', path: '/dropdown', frame: '.mx-field', target: '.mx-drop-down .mx-field__box', focus: '.mx-drop-down__display' },
  { label: 'Check box', path: '/checkbox', target: '.mx-check-box .mx-check-box__input', frame: '.mx-field', setup: set.check('unchecked') },
  { label: 'Check box, checked', path: '/checkbox', target: '.mx-check-box .mx-check-box__input', frame: '.mx-field', setup: set.check('checked') },
  { label: 'Check box, mixed', path: '/checkbox', target: '.mx-check-box .mx-check-box__input', frame: '.mx-field', setup: set.check('mixed') },
  { label: 'Check box, disabled', path: '/checkbox', target: '.mx-check-box[data-state="checked"] .mx-check-box__input', frame: '.mx-field', setup: set.disabledCheck, states: ['rest', 'hover'] },
  { label: 'Radio', path: '/radiogroup', target: '.mx-radio-group:not([data-disabled]) .mx-radio-group__input:not(:checked)', frame: '.mx-radio-group__item' },
  { label: 'Radio, chosen', path: '/radiogroup', target: '.mx-radio-group:not([data-disabled]) .mx-radio-group__input:checked', frame: '.mx-radio-group__item' },
  { label: 'Switch, off', path: '/switch', target: '.mx-switch[data-state="unchecked"]:not([data-disabled]) .mx-switch__input', frame: '.mx-field' },
  { label: 'Switch, on', path: '/switch', target: '.mx-switch[data-state="checked"]:not([data-disabled]) .mx-switch__input', frame: '.mx-field' },
  { label: 'Slider', path: '/slider', target: '.mx-slider:not([data-disabled]) .mx-slider__thumb', frame: '.mx-slider__control' },
  { label: 'Tab', path: '/tabs', target: '.mx-tabs[data-variant="line"] .mx-tabs__tab[aria-selected="false"]', frame: '.mx-tabs__strip' },
  { label: 'Tab, selected', path: '/tabs', target: '.mx-tabs[data-variant="line"] .mx-tabs__tab[aria-selected="true"]', frame: '.mx-tabs__strip' },
  { label: 'Pill tab, selected', path: '/tabs', target: '.mx-tabs[data-variant="line"] .mx-tabs__tab[aria-selected="true"]', frame: '.mx-tabs__strip', setup: set.tabs('pill') },
  { label: 'List item', path: '/listbox', target: '.mx-list-box .mx-list__item:not([data-selected])', states: ['rest', 'hover', 'pressed'] },
  { label: 'List item, selected', path: '/listbox', target: '.mx-list-box .mx-list__item[data-selected]', states: ['rest', 'hover', 'pressed'] },
  { label: 'Tree row', path: '/treeview', target: '.mx-tree-view__item:not([aria-selected="true"]) > .mx-tree-view__row', focus: '..' },
  { label: 'Tree row, selected', path: '/treeview', target: '.mx-tree-view__item[aria-selected="true"] > .mx-tree-view__row', focus: '..' },
  { label: 'Accordion header', path: '/accordion', target: '.mx-accordion__header' },
  { label: 'Calendar day', path: '/calendar', target: '.mx-calendar__cell:not([aria-selected="true"], [data-today])' },
  { label: 'Calendar day, selected', path: '/calendar', target: '.mx-calendar__cell[aria-selected="true"]' },
  { label: 'Menu bar item', path: '/menus', target: '.mx-menubar__item', states: ['rest', 'hover', 'focus'] },
  { label: 'Tag', path: '/tagbox', target: '.mx-tag-box__tag', states: ['rest', 'hover'] },
];
const PAD = 12;

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

/** In the page: marks the first visible match in the page content as the subject, puts it in its state, returns false when there is none. */
function mark([selector, setup, frame]) {
  const el = [...document.querySelector('.docs-main').querySelectorAll(selector)].find((e) => e.checkVisibility());
  if (!el) return false;
  el.setAttribute('data-sheet-target', '');
  (frame ? el.closest(frame) ?? el : el).setAttribute('data-sheet-frame', '');
  const [what, [value, second] = []] = setup ?? [];
  if (what === 'tone') Object.assign(el.closest('.mx-button').dataset, { tone: value, variant: second });
  if (what === 'disabled-button') el.disabled = true;
  if (what === 'field') {
    const field = el.closest('.mx-field');
    field.setAttribute(`data-${value}`, '');
    if (value === 'disabled') field.querySelectorAll('input, button').forEach((c) => { c.disabled = true; });
    if (value === 'readonly') field.querySelectorAll('input').forEach((c) => { c.readOnly = true; });
  }
  if (what === 'check') {
    el.closest('.mx-check-box').dataset.state = value;
    el.checked = value === 'checked';
    el.indeterminate = value === 'mixed';
  }
  if (what === 'disabled-check') {
    el.closest('.mx-field').setAttribute('data-disabled', '');
    el.disabled = true;
  }
  if (what === 'tabs') el.closest('.mx-tabs').dataset.variant = value;
  el.scrollIntoView({ block: 'center' });
  return true;
}

const shots = {};
const missing = [];
const browser = await chromium.launch({ executablePath: chromePath });
try {
  await Promise.all(
    RUNS.map(async ({ designLanguage, theme, scheme }) => {
      const run = `${designLanguage}-${theme}`;
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme, deviceScaleFactor: 2 });
      await ctx.addInitScript(([i, t]) => {
        localStorage.clear();
        if (i) localStorage.setItem('mx-docs-design-language', i);
        if (t) localStorage.setItem('mx-docs-theme', t);
      }, [designLanguage === defaultDesignLanguage ? null : designLanguage, theme === 'high-contrast' ? theme : null]);
      // One fixed day, so pages that show today (a calendar, a date box) look the same on every run.
      await ctx.clock.setFixedTime(new Date('2026-03-18T10:00:00'));
      const page = await ctx.newPage();
      for (const [index, row] of ROWS.entries()) {
        for (const state of row.states ?? LIVE) {
          await page.goto(base + row.path);
          await page.waitForSelector('.docs-main');
          await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}' });
          await page.waitForTimeout(300);
          if (!(await page.evaluate(mark, [row.target, row.setup, row.frame]))) {
            missing.push(`${run}: ${row.label}`);
            break;
          }
          const target = page.locator('[data-sheet-target]');
          const box = await page.locator('[data-sheet-frame]').boundingBox();
          const centre = await target.boundingBox();
          await page.mouse.move(1, 1);
          if (state === 'hover' || state === 'pressed') await page.mouse.move(centre.x + centre.width / 2, centre.y + centre.height / 2);
          if (state === 'pressed') await page.mouse.down();
          if (state === 'focus') {
            // A key press first, so the focus that follows is keyboard focus (:focus-visible).
            await page.keyboard.press('Shift');
            await target.evaluate((el, focus) => {
              const to = focus === '..' ? el.parentElement : focus ? el.querySelector(focus) ?? el.closest('.mx-field, .mx-drop-down')?.querySelector(focus) : el;
              (to ?? el).focus();
            }, row.focus);
          }
          await page.waitForTimeout(120);
          const file = `${index}-${run}-${state}.png`;
          await page.screenshot({ path: join(out, file), clip: { x: Math.max(0, box.x - PAD), y: Math.max(0, box.y - PAD), width: box.width + 2 * PAD, height: box.height + 2 * PAD } });
          if (state === 'pressed') await page.mouse.up();
          (shots[index] ??= {})[`${run} ${state}`] = file;
        }
      }
      await ctx.close();
    }),
  );
} finally {
  await browser.close();
  killServer();
}

const states = ['rest', 'hover', 'pressed', 'focus'];
const cell = (file) => (file ? `<td><img src="${file}" alt=""></td>` : '<td class="none">—</td>');
const sections = ROWS.map((row, index) => {
  const rows = RUNS.map(({ designLanguage, theme }) => {
    const run = `${designLanguage}-${theme}`;
    return `<tr><th scope="row">${designLanguage}<br><small>${theme}</small></th>${states.map((s) => cell(shots[index]?.[`${run} ${s}`])).join('')}</tr>`;
  }).join('\n');
  return `<section><h2>${row.label}</h2><table><thead><tr><th></th>${states.map((s) => `<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>\n${rows}\n</tbody></table></section>`;
}).join('\n');
writeFileSync(
  join(out, 'index.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>State sheet</title>
<style>
body { margin: 24px; font: 14px/1.4 system-ui, sans-serif; background: #f3f3f3; color: #1d1d1d; }
nav { columns: 4 12rem; margin-block-end: 24px; }
section { margin-block-end: 32px; }
table { border-collapse: collapse; background: #fff; }
th, td { padding: 6px 10px; border: 1px solid #ddd; text-align: start; vertical-align: middle; }
th[scope='row'] { white-space: nowrap; }
td img { display: block; max-inline-size: 360px; zoom: 0.5; }
td.none { color: #999; text-align: center; }
</style></head><body><h1>State sheet</h1><p>Every part in every state, in every design language and theme. Built ${new Date().toISOString().slice(0, 16).replace('T', ' ')}.</p>
<nav>${ROWS.map((r, i) => `<a href="#s${i}">${r.label}</a>`).join('<br>')}</nav>
${sections.replace(/<section>/g, () => '<section>').replace(/<section><h2>/g, (() => { let i = 0; return () => `<section id="s${i++}"><h2>`; })())}
</body></html>\n`,
);
console.log(`state sheet: ${ROWS.length} parts × ${RUNS.length} runs → ${join(out, 'index.html')}`);
if (missing.length) console.log(`not found:\n  ${missing.join('\n  ')}`);
