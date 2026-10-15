// Real-browser checks over the built docs site: axe-core on every page, the
// theme/density switches, and MxForm in a real browser (top layer, inert page,
// focus, x-model, window geometry) — everything jsdom cannot show.
// Run `npm run docs:build` first. Not CI-gated: it needs a local Chrome.
//
//   node e2e/docs-smoke.mjs
//
// Env (all optional):
//   CHROME_PATH  path to chrome.exe (default: standard Windows install)
//   PW_CORE      path to playwright-core (default: resolved from node_modules)
//   PORT         preview port (default 4510)
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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

let failed = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!ok) failed++;
};

// ---- vite preview over apps/docs/dist ---------------------------------------------------
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

  // ---- axe on every page, in light and dark ---------------------------------------------
  for (const path of ['', 'tokens/', 'control/', 'keyboard/', 'label/', 'panel/', 'stack/', 'grid/', 'groupbox/', 'splitcontainer/', 'button/', 'form/']) {
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

  // ---- theme and density switches --------------------------------------------------------
  await page.goto(base, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  check('theme switch sets data-theme', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
  const canvasDark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  const canvasLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('theme actually repaints the canvas', canvasDark !== canvasLight, `${canvasDark} vs ${canvasLight}`);
  const heightBefore = await page.evaluate(() => document.querySelector('.mx-button').getBoundingClientRect().height);
  await page.getByRole('button', { name: 'Compact' }).click();
  const heightAfter = await page.evaluate(() => document.querySelector('.mx-button').getBoundingClientRect().height);
  check('compact density shrinks controls', heightAfter < heightBefore, `${heightBefore} → ${heightAfter}`);

  // ---- Control: created in code, enabled cascade, focus rescue ---------------------------
  await page.goto(base + 'control/', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Add a button from code' }).click();
  const added = page.getByRole('button', { name: 'Button 1', exact: true });
  check('a control created with new is added and shown', (await added.count()) === 1);
  await added.click();
  check('its text set from code updates in place', (await page.getByRole('button', { name: 'Button 1 ✓' }).count()) === 1);

  const nameBox = page.locator('input[name=panel-name]');
  await nameBox.focus();
  await page.getByRole('button', { name: 'Toggle panel enabled' }).evaluate((b) => {
    // Toggle without moving focus first: what an app does from code.
    b.click();
  });
  check('a disabled panel disables the native input inside', await nameBox.isDisabled());
  check('…and the control inside it', await page.getByRole('button', { name: 'Inner button' }).isDisabled());
  check('…and takes the link out of the Tab order', (await page.locator('.docs-panel a').getAttribute('tabindex')) === '-1');
  const focusAfter = await page.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.textContent ?? ''));
  check('focus moved on instead of falling to <body>', !focusAfter.startsWith('BODY'), focusAfter);
  await page.getByRole('button', { name: 'Toggle panel enabled' }).click();
  check('enabling restores the input', !(await nameBox.isDisabled()));
  check('enabling restores the link', !(await page.locator('.docs-panel a').getAttribute('tabindex')));

  // ---- Keyboard and focus: Tab order, access keys, shortcuts, focus guard -------------
  await page.goto(base + 'keyboard/', { waitUntil: 'load' });
  const activeText = () => page.evaluate(() => document.activeElement?.textContent ?? document.activeElement?.tagName);
  await page.getByRole('button', { name: 'First', exact: true }).focus();
  await page.keyboard.press('Tab');
  const second = await activeText();
  await page.keyboard.press('Tab');
  const third = await activeText();
  check('Tab follows tabIndex (First → Second → Third)', second === 'Second' && third === 'Third', `${second}, ${third}`);
  check('the container reports its activeControl', (await page.locator('.active-name').textContent()) === 'Third');
  await page.keyboard.press('Shift+Tab');
  check('Shift+Tab goes back in tabIndex order', (await activeText()) === 'Second');
  await page.getByRole('button', { name: 'restoreFocus()' }).click();
  check('restoreFocus() returns to the last focused control', (await activeText()) === 'Second');

  await page.keyboard.down('Alt');
  const underline = await page.evaluate(() => getComputedStyle(document.querySelector('.mx-access-key')).textDecorationLine);
  await page.keyboard.press('s');
  await page.keyboard.up('Alt');
  check('access keys are underlined while Alt is held', underline.includes('underline'), underline);
  const underlineAfter = await page.evaluate(() => getComputedStyle(document.querySelector('.mx-access-key')).textDecorationLine);
  check('…and only then', !underlineAfter.includes('underline'), underlineAfter);
  check('Alt+S clicks the &Save button', (await page.locator('output.saves').textContent()) === '1');
  await page.keyboard.press('Alt');
  const latched = await page.evaluate(() => getComputedStyle(document.querySelector('.mx-access-key')).textDecorationLine);
  check('tapping Alt keeps the access keys shown', latched.includes('underline'), latched);
  await page.keyboard.press('Alt+o');
  await page.keyboard.press('Alt');
  await page.keyboard.press('Alt');
  await page.keyboard.press('Alt+o');
  check('access keys keep working after Alt taps', (await page.locator('output.opens').textContent()) === '2');
  check('the &Save button has its accessible name and Alt+S', (await page.getByRole('button', { name: 'Save', exact: true }).getAttribute('aria-keyshortcuts')) === 'Alt+S');

  await page.locator('body').click({ position: { x: 5, y: 300 } });
  await page.keyboard.press('Control+K');
  check('an app-wide shortcut (Mod+K) runs', (await page.locator('output.palette').textContent()) === '1');

  const remove2 = page.getByRole('button', { name: 'Remove row 2' });
  await remove2.focus();
  await page.keyboard.press('Enter');
  check('removing the focused row moves focus to the next one, not <body>', (await activeText()) === 'Remove row 3', await activeText());

  // ---- Layout: docking, grid cells, group frame, splitter ---------------------------------
  const rect = (sel) => page.locator(sel).first().evaluate((el) => el.getBoundingClientRect().toJSON());
  await page.goto(base + 'panel/', { waitUntil: 'load' });
  await page.waitForTimeout(100);
  {
    const stage = await rect('.docs-stage');
    const top = await rect('.docs-stage > [data-dock="top"]');
    const left = await rect('.docs-stage > [data-dock="start"]');
    const fill = await rect('.docs-stage > [data-dock="fill"]');
    const bottom = await rect('.docs-stage > [data-dock="bottom"]');
    const movable = await rect('.docs-stage > .mx-button');
    check('dock top spans the panel at its top', Math.abs(top.top - stage.top) < 2 && Math.abs(top.width - (stage.width - 2)) < 2, JSON.stringify([top.top, stage.top, top.width, stage.width]));
    check('dock bottom sits at the bottom', Math.abs(bottom.bottom - (stage.bottom - 1)) < 2);
    check('dock start sits below top, above bottom', Math.abs(left.top - top.bottom) < 1 && Math.abs(left.bottom - bottom.top) < 1);
    check('dock end is at the end edge, fill takes the middle', Math.abs(movable.right - (stage.right - 1)) < 2 && Math.abs(fill.left - left.right) < 1 && Math.abs(fill.right - movable.left) < 1);
    // Clicking may scroll the page: measure again after each click.
    await page.getByRole('button', { name: 'float', exact: true }).click();
    await page.waitForTimeout(50);
    const [floated, stage2] = [await rect('.docs-stage > .mx-button'), await rect('.docs-stage')];
    check('float anchors to the right/bottom offsets', Math.abs(floated.right - (stage2.right - 1 - 12)) < 2 && Math.abs(floated.bottom - (stage2.bottom - 1 - 12)) < 2, JSON.stringify([floated.right, stage2.right, floated.bottom, stage2.bottom]));
    await page.getByRole('button', { name: 'top', exact: true }).click();
    await page.waitForTimeout(50);
    const [asTop, top2, left2] = [await rect('.docs-stage > .mx-button'), await rect('.docs-stage > [data-dock="top"]'), await rect('.docs-stage > [data-dock="start"]')];
    // It comes after the start box in document order: below the top box, after the start one.
    check('changing dock in code re-lays the panel out (docks in document order)', Math.abs(asTop.top - top2.bottom) < 1 && Math.abs(asTop.left - left2.right) < 1, JSON.stringify([asTop.top, top2.bottom, asTop.left, left2.right]));
    await page.evaluate(() => (document.documentElement.dir = 'rtl'));
    const [stage3, start3] = [await rect('.docs-stage'), await rect('.docs-stage > [data-dock="start"]')];
    check('in RTL, dock start sits at the right edge', Math.abs(start3.right - (stage3.right - 1)) < 2, JSON.stringify([start3.right, stage3.right]));
    await page.evaluate(() => document.documentElement.removeAttribute('dir'));
  }

  await page.goto(base + 'grid/', { waitUntil: 'load' });
  {
    const header = await rect('.mx-grid > .mx-panel');
    const panels = await page.locator('.mx-grid > .mx-panel').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    check('grid columnSpan covers both columns', Math.abs(header.width - (panels[2].right - panels[1].left)) < 2);
    check('grid column 0 is 10rem wide', Math.abs(panels[1].width - 160) < 2, String(panels[1].width));
  }

  await page.goto(base + 'groupbox/', { waitUntil: 'load' });
  {
    const fs = await rect('fieldset.mx-groupbox');
    const lg = await rect('fieldset.mx-groupbox > legend');
    check('the caption sits on the frame line', lg.top < fs.top + 2 && lg.bottom > fs.top);
    check('the caption is inset by the header token', Math.abs(lg.left - fs.left - 13) < 2, String(lg.left - fs.left));
    await page.keyboard.press('Alt+a');
    check('Alt + the group access key focuses its first field', await page.evaluate(() => document.activeElement?.getAttribute('name') === 'street'));
    await page.getByRole('button', { name: 'Toggle enabled' }).click();
    check('a disabled group disables its fields', await page.locator('input[name=street]').isDisabled());
  }

  await page.goto(base + 'label/', { waitUntil: 'load' });
  {
    const activeId = () => page.evaluate(() => document.activeElement?.id || document.activeElement?.getAttribute('name') || document.activeElement?.textContent?.trim());
    check('a label with a target names its field', (await page.getByRole('textbox', { name: 'Name' }).count()) === 1);
    check('…and a non-labelable target through aria-labelledby', (await page.getByRole('listbox', { name: 'Fruits' }).count()) === 1);
    await page.keyboard.press('Alt+n');
    check('Alt + the label key focuses its target', (await activeId()) === 'lbl-name');
    await page.keyboard.press('Alt+p');
    check('a label names and focuses a select by id', (await activeId()) === 'lbl-pay');
    await page.keyboard.press('Alt+t');
    check('…or the field the label wraps', (await activeId()) === 'city');
    await page.keyboard.press('Alt+f');
    check('a non-labelable target is focused too', (await activeId()) === 'lbl-fruits');
    await page.locator('label.mx-label', { hasText: /^Name$/ }).click();
    check('a click on the label focuses its target', (await activeId()) === 'lbl-name');
    const font = (style) => page.locator(`.type-ramp .mx-label[data-text-style='${style}']`).evaluate((el) => getComputedStyle(el).fontSize);
    check('the type ramp: caption 12px, display 68px', (await font('caption')) === '12px' && (await font('display')) === '68px', `${await font('caption')} ${await font('display')}`);
    const one = page.locator('.trim-one');
    check('ellipsis cuts the text to one line', await one.evaluate((el) => el.scrollWidth > el.clientWidth && el.getBoundingClientRect().height < 24));
    await one.hover();
    check('…and shows the full text as a tooltip on hover', ((await one.getAttribute('title')) ?? '').startsWith('Shipment 4711'));
    const two = await page.locator('.trim-two').evaluate((el) => [el.getBoundingClientRect().height, parseFloat(getComputedStyle(el).lineHeight)]);
    check('maxLines=2 keeps two lines', Math.abs(two[0] - 2 * two[1]) < 2, JSON.stringify(two));
    const dimmed = await page.locator('.disabled-row .mx-label').evaluate((el) => getComputedStyle(el).color);
    const normal = await page.locator('label.mx-label', { hasText: /^Name$/ }).evaluate((el) => getComputedStyle(el).color);
    check('a label inside a disabled control dims (and its field is disabled)', dimmed !== normal && (await page.locator('#lbl-discount').isDisabled()), `${dimmed} vs ${normal}`);
    const status = page.locator('.status-label');
    await page.getByRole('button', { name: 'Status from code' }).click();
    check('text and tone set from code update in place', (await status.textContent()) === 'Saving…' && (await status.getAttribute('data-tone')) === 'caution');
  }

  await page.goto(base + 'splitcontainer/', { waitUntil: 'load' });
  await page.waitForTimeout(100);
  {
    const outerSplitter = page.locator('.split-demo > .mx-split__splitter');
    const p1 = () => rect('.split-demo > [data-part="first"]');
    const before = await p1();
    check('the first panel starts at position', Math.abs(before.width - 200) < 2, String(before.width));
    const sb = await outerSplitter.evaluate((el) => el.getBoundingClientRect().toJSON());
    await page.mouse.move(sb.left + sb.width / 2, sb.top + 40);
    await page.mouse.down();
    await page.mouse.move(sb.left + sb.width / 2 + 80, sb.top + 40, { steps: 4 });
    await page.mouse.up();
    const dragged = await p1();
    check('dragging the splitter resizes the first panel', Math.abs(dragged.width - 280) < 3, String(dragged.width));
    check('onSplitterMoved fires once per drag', (await page.locator('output.moved').textContent()) === '1');
    await outerSplitter.focus();
    await page.keyboard.press('ArrowLeft');
    check('arrow keys move the splitter by step', Math.abs((await p1()).width - 270) < 3);
    await page.keyboard.press('Home');
    check('Home goes to firstMinSize', Math.abs((await p1()).width - 120) < 2);
    check('the splitter announces its value', Number(await outerSplitter.getAttribute('aria-valuenow')) > 0);
    await page.getByRole('button', { name: 'Collapse first' }).click();
    const stage = await rect('.split-demo');
    const p2 = await rect('.split-demo > [data-part="second"]');
    check('a collapsed first panel leaves the second the whole area', Math.abs(p2.width - (stage.width - 2)) < 2);
  }

  // ---- MxForm: showDialog, nesting, Escape, owner lifetime, windows ----------------------
  await page.goto(base + 'form/', { waitUntil: 'load' });
  const logHas = (text) => page.evaluate((t) => [...document.querySelectorAll('.docs-list li')].some((li) => li.textContent.includes(t)), text);
  const openWindows = () => page.evaluate(() => document.querySelectorAll('dialog.mx-form-window[open]').length);
  const shown = page.locator('dialog.mx-form-window[open]');

  const opener = page.getByRole('button', { name: 'New customer…' });
  await opener.click();
  check('showDialog opens a modal window', await shown.first().evaluate((d) => d.open && d.matches(':modal')));
  check('focus goes to [autofocus] inside the form', await page.evaluate(() => document.activeElement?.getAttribute('name') === 'name'));
  // In a modal window, Tab past the last control wraps to the first one.
  await shown.first().evaluate((d) => {
    const all = [...d.querySelectorAll('button, input, select, textarea, [tabindex]')].filter((el) => el.tabIndex >= 0 && el.checkVisibility());
    all[all.length - 1].focus();
  });
  await page.keyboard.press('Tab');
  const wrapped = await shown.first().evaluate((d) => {
    const all = [...d.querySelectorAll('button, input, select, textarea, [tabindex]')].filter((el) => el.tabIndex >= 0 && el.checkVisibility());
    return document.activeElement === all[0];
  });
  check('Tab wraps around inside a modal window', wrapped);
  await page.getByRole('textbox', { name: 'Name' }).focus();
  check('window is named by the caption', (await page.getByRole('dialog', { name: 'New customer' }).count()) === 1);
  // The page behind is inert: a real click on a page button lands on nothing usable.
  const behind = await page.evaluate(() => {
    const b = [...document.querySelectorAll('main .mx-button')].find((x) => x.textContent.includes('Open a window'));
    const r = b.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return hit === b || b.contains(hit);
  });
  check('the page behind a modal form cannot be clicked', !behind);

  await page.getByRole('button', { name: 'Open another dialog from here…' }).click();
  check('a dialog opened from a dialog stacks on top', (await openWindows()) === 2);
  await page.keyboard.press('Enter');
  check('Enter on the nested OK closes only the nested dialog', (await openWindows()) === 1 && (await logHas('nested dialog → ok')));
  await page.getByRole('textbox', { name: 'Name' }).focus();
  await page.keyboard.press('Escape');
  check('Escape clicks the cancelButton → Cancel', (await openWindows()) === 0 && (await logHas('customer dialog → cancel')));
  check('focus returns to the opener', await opener.evaluate((b) => document.activeElement === b));

  await page.getByRole('button', { name: 'Notes (asks before discarding)…' }).click();
  await page.getByRole('textbox', { name: 'Notes' }).fill('draft');
  await page.keyboard.press('Escape');
  check('closeOnEscape + dirty form asks first (onClosing)', (await openWindows()) === 2);
  await page.getByRole('button', { name: 'Keep editing' }).click();
  check('"Keep editing" cancels the close', (await openWindows()) === 1);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Discard', exact: true }).click();
  check('"Discard" lets the form close', (await openWindows()) === 0);

  // x-model: two-way, state kept between openings.
  const stateBox = page.locator('input.bound-state');
  await page.getByRole('button', { name: 'Open bound form' }).click();
  check('x-model: setting the state opens the form', (await openWindows()) === 1 && (await stateBox.isChecked()));
  await page.locator('input[name="kept"]').fill('still here');
  await page.getByRole('button', { name: 'Done' }).click();
  check('x-model: closing the form writes false back', (await openWindows()) === 0 && !(await stateBox.isChecked()));
  await stateBox.check();
  check(
    'x-model: reopened with its content kept',
    (await openWindows()) === 1 && (await page.locator('input[name="kept"]').inputValue()) === 'still here',
  );
  await page.getByRole('button', { name: 'Done' }).click();

  await page.getByRole('button', { name: 'Open window owned by this panel' }).click();
  check('show() opens a modeless window', await shown.first().evaluate((d) => d.open && !d.matches(':modal')));
  // Tab past the last control of a modeless window moves on to the page.
  await shown.first().evaluate((d) => {
    const all = [...d.querySelectorAll('button, input, select, textarea, [tabindex]')].filter((el) => el.tabIndex >= 0 && el.checkVisibility());
    all[all.length - 1].focus();
  });
  await page.keyboard.press('Tab');
  check('Tab leaves a modeless window for the page', await page.evaluate(() => !!document.activeElement && !document.activeElement.closest('dialog')));
  await page.getByRole('button', { name: 'Session timeout (dispose panel)' }).click();
  await page.waitForTimeout(100);
  check('the window dies with its owner panel', (await openWindows()) === 0 && (await logHas('reason: owner')));

  // Events stop at the window root.
  await page.getByRole('button', { name: 'Open a window hosted in this row' }).click();
  const rowClicks = () => page.locator('.row-clicks').innerText();
  const clicksBefore = await rowClicks();
  await shown.first().locator('.mx-form__body p').click();
  check('clicks inside a window do not reach the component that hosts it', (await rowClicks()) === clicksBefore, `row clicks ${clicksBefore} → ${await rowClicks()}`);
  await page.getByRole('button', { name: 'OK', exact: true }).click();

  // Modeless windows: order, drag, resize, minimize to the taskbar, maximize.
  const openWin = page.getByRole('button', { name: 'Open a window on the app root' });
  await openWin.click();
  await openWin.click();
  await page.waitForTimeout(400); // let the enter animation (scale) finish before measuring
  const wins = shown;
  check('two modeless windows, the newest active', (await wins.count()) === 2 && (await wins.nth(1).evaluate((d) => d.hasAttribute('data-active'))));
  const title = wins.nth(1).locator('.mx-form__titlebar');
  const before = await wins.nth(1).boundingBox();
  const tb = await title.boundingBox();
  await page.mouse.move(tb.x + 20, tb.y + tb.height / 2);
  await page.mouse.down();
  await page.mouse.move(tb.x - 100, tb.y + tb.height / 2 + 60, { steps: 5 });
  await page.mouse.up();
  const after = await wins.nth(1).boundingBox();
  check('dragging the title bar moves the window', Math.abs(after.x - (before.x - 120)) < 2 && Math.abs(after.y - (before.y + 60)) < 2, `${before.x},${before.y} → ${after.x},${after.y}`);
  const edge = await wins.nth(1).locator('[data-edge="e"]').boundingBox();
  await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
  await page.mouse.down();
  await page.mouse.move(edge.x + edge.width / 2 + 80, edge.y + edge.height / 2, { steps: 5 });
  await page.mouse.up();
  const resized = await wins.nth(1).boundingBox();
  check('dragging the east edge resizes the window', Math.abs(resized.width - (after.width + 80)) < 2 && Math.abs(resized.x - after.x) < 2, `${after.width} → ${resized.width}`);
  // The dragged window still covers most of the first one; click its uncovered corner.
  const w0 = await wins.nth(0).boundingBox();
  await page.mouse.click(w0.x + w0.width - 12, w0.y + w0.height - 12);
  check('clicking a window brings it to front', await wins.nth(0).evaluate((d) => d.hasAttribute('data-active')));
  await page.addScriptTag({ content: axeSource });
  const formViolations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with two windows open', formViolations.length === 0, formViolations.join(', '));
  await wins.nth(0).locator('[data-action="minimize"]').click();
  check('minimize docks the window into its minimizeTarget', await page.evaluate(() => document.querySelector('.docs-taskbar dialog.mx-form-window[data-minimized-in]') !== null));
  await page.locator('.docs-taskbar [data-action="restore"]').click();
  check('restore brings it back as a floating window', await page.evaluate(() => document.querySelector('.docs-taskbar dialog') === null));
  await shown.last().locator('[data-action="maximize"]').click();
  check('maximize fills the viewport', await shown.last().evaluate((d) => d.getBoundingClientRect().width === window.innerWidth));

  check('no uncaught page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  killServer();
}

console.log(failed === 0 ? '\nSMOKE OK' : `\nSMOKE FAILED (${failed})`);
process.exit(failed === 0 ? 0 : 1);
