/**
 * Real-browser checks of the TabDocumentManager on a phone (390 × 844) and a tablet (820 × 1180), both with touch:
 * the presentation switching and back with every content and its state kept, the phone's list (search, swipe to
 * close, long press to move), swipes between documents, the tools in sheets by their handle, drawers on a tablet,
 * the action sheet, the back button closing in order, axe in light and dark.
 */
export default async function ({ page, base, check, axeSource }) {
  const browser = page.context().browser();
  const settle = (p) => p.waitForTimeout(450);

  /** A page with touch at `width` × `height`, and a finger driven through the protocol. */
  const device = async (width, height) => {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const p = await context.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(String(e)));
    p.on('console', (m) => (m.type() === 'error' || (m.type() === 'warning' && /\[motifjs\]|MJX\d/.test(m.text()))) && errors.push(m.text()));
    const cdp = await context.newCDPSession(p);
    const touch = (type, at) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: at ? [{ x: at.x, y: at.y }] : [] });
    /** Down at `from`, held `hold` ms, moved to `to` in `steps`, `ms` apart, then up (unless `up` is false). */
    const stroke = async (from, to, { steps = 10, ms = 16, hold = 0, up = true } = {}) => {
      await touch('touchStart', from);
      if (hold) await p.waitForTimeout(hold);
      for (let i = 1; i <= steps; i++) {
        await touch('touchMove', { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps });
        if (ms) await p.waitForTimeout(ms);
      }
      if (up) await touch('touchEnd');
      await settle(p);
    };
    const tap = async (at) => {
      await p.touchscreen.tap(at.x, at.y);
      await settle(p);
    };
    const axe = async (label) => {
      for (const theme of ['light', 'dark']) {
        await p.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
        await p.waitForTimeout(150);
        await p.addScriptTag({ content: axeSource });
        // The docs' own header hides its brand name on a narrow screen (a link without a name there): not this page's.
        const violations = await p.evaluate(async () => (await window.axe.run({ exclude: [['.docs-brand']] })).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
        check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
      }
      await p.evaluate(() => document.documentElement.removeAttribute('data-theme'));
    };
    return { context, page: p, errors, touch, stroke, tap, axe };
  };
  const centre = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

  // The phone.
  const phone = await device(390, 844);
  let p = phone.page;
  await p.goto(base + 'tabdocs/mobile', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  const W = 'section[aria-labelledby="width"] .mx-tabdocs';
  await p.locator(W).scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  const look = () =>
    p.evaluate((m) => {
      const el = document.querySelector(m);
      const list = el.querySelector('.mx-tabdocs__phone-list');
      const tool = [...el.querySelectorAll('.mx-tabdocs__tool-panel')].find((t) => t.hasAttribute('data-open'));
      return {
        presentation: el.dataset.presentation ?? 'desktop',
        width: Math.round(el.getBoundingClientRect().width),
        title: el.querySelector('.mx-tabdocs__phone-title')?.textContent ?? null,
        count: el.querySelector('.mx-tabdocs__phone-count')?.textContent ?? null,
        shown: [...el.querySelectorAll('.mx-tabdocs__group')].filter((g) => g.dataset.slot && g.dataset.slot !== 'none').length,
        list: !!list?.hasAttribute('data-open'),
        rows: list ? [...list.querySelectorAll('.mx-tabdocs__list-row')].filter((r) => !r.hidden).map((r) => r.querySelector('.mx-tabdocs__list-title').textContent) : [],
        tool: tool ? tool.querySelector('.mx-bottom-sheet__handle')?.getAttribute('aria-valuetext') : null,
        actions: !!document.querySelector('.mx-tabdocs__menu-sheet[data-open]'),
      };
    }, W);
  let s = await look();
  check('a manager that follows its width is a phone at 308 pixels: one document under its bar', s.presentation === 'phone' && s.shown === 1 && s.title === 'Note' && s.count === '6', JSON.stringify(s));
  const touchTargets = await p.evaluate((m) => [...document.querySelectorAll(m + ' .mx-tabdocs__phone-bar button, ' + m + ' .mx-tabdocs__phone-tool')].map((b) => Math.round(Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height))), W);
  check('its bar and tool buttons are at least 32 pixels for a finger', touchTargets.every((n) => n >= 32), JSON.stringify(touchTargets));
  await phone.axe('the phone presentation');

  // Swipes on the title go to the documents beside.
  let title = centre(await p.locator(W + ' .mx-tabdocs__phone-title').boundingBox());
  await phone.stroke({ x: title.x + 60, y: title.y }, { x: title.x - 80, y: title.y }, { steps: 6 });
  const next = (await look()).title;
  await phone.stroke({ x: title.x - 60, y: title.y }, { x: title.x + 80, y: title.y }, { steps: 6 });
  check('a swipe to the left on the title shows the next document, to the right the one before', next === 'index.ts' && (await look()).title === 'Note', next);

  // The list.
  await phone.tap(centre(await p.locator(W + ' .mx-tabdocs__phone-count').boundingBox()));
  s = await look();
  check('the count opens the full-screen list, the shown document marked', s.list && s.rows.length === 6 && (await p.locator(W + ' .mx-tabdocs__list-row[aria-current="true"]').textContent()).includes('Note'), JSON.stringify(s));
  const sheetBox = await p.locator(W + ' .mx-tabdocs__phone-list .mx-bottom-sheet__panel').boundingBox();
  const managerBox = await p.locator(W).boundingBox();
  check('…over the whole manager', Math.abs(sheetBox.height - managerBox.height) <= 2 && Math.abs(sheetBox.y - managerBox.y) <= 2, JSON.stringify([sheetBox, managerBox]));
  await phone.axe('the phone list open');
  const search = p.locator(W + ' .mx-tabdocs__list-search input');
  await search.fill('ts');
  await p.waitForTimeout(200);
  s = await look();
  check('the search filters the rows', s.rows.length === 4 && s.rows.every((r) => r.includes('ts')), JSON.stringify(s.rows));
  await search.fill('');
  await p.waitForTimeout(200);
  let row = await p.locator(W + ' .mx-tabdocs__list-row', { hasText: 'app.ts' }).boundingBox();
  await phone.stroke({ x: row.x + row.width * 0.75, y: row.y + row.height / 2 }, { x: row.x + 10, y: row.y + row.height / 2 }, { steps: 8 });
  s = await look();
  check('a row swiped sideways closes its document', !s.rows.includes('app.ts') && s.rows.length === 5, JSON.stringify(s.rows));
  const before = (await look()).rows;
  const rowAt = (i) => p.locator(W + ' .mx-tabdocs__list-row').nth(i).boundingBox();
  row = await rowAt(0);
  const second = await rowAt(1);
  await phone.stroke({ x: row.x + 40, y: row.y + row.height / 2 }, { x: row.x + 40, y: second.y + second.height * 0.8 }, { hold: 700, steps: 10, ms: 30 });
  s = await look();
  check('a long press lifts a row; dragged below the next one, the document moves there', s.rows[0] === before[1] && s.rows[1] === before[0], JSON.stringify([before, s.rows]));
  row = await rowAt(0);
  await phone.stroke({ x: row.x + 40, y: row.y + row.height / 2 }, { x: row.x + 40, y: row.y + row.height / 2 }, { hold: 700, steps: 1 });
  check('a long press let go where it was opens the document\'s commands in an action sheet', (await look()).actions);
  await phone.axe('the action sheet over the list');
  // The back button closes what is on top, one after the other.
  await p.goBack();
  await settle(p);
  s = await look();
  check('back closes the action sheet first, the list stays', !s.actions && s.list, JSON.stringify(s));
  await p.goBack();
  await settle(p);
  s = await look();
  check('…then the list', !s.list && p.url().endsWith('/tabdocs/mobile'), JSON.stringify(s));

  // A tool in its sheet: half, then full by the handle, then a swipe down closes it.
  await phone.tap(centre(await p.locator(W + ' .mx-tabdocs__phone-tool', { hasText: 'Problems' }).boundingBox()));
  check('a tool\'s button opens its area in a sheet at half height', (await look()).tool === 'Half height');
  let handle = centre(await p.locator(W + ' .mx-tabdocs__tool-panel[data-open] .mx-bottom-sheet__handle').boundingBox());
  await phone.stroke(handle, { x: handle.x, y: handle.y - 180 }, { steps: 12, ms: 30 });
  check('dragged up by its handle it goes to full height', (await look()).tool === 'Full height');
  handle = centre(await p.locator(W + ' .mx-tabdocs__tool-panel[data-open] .mx-bottom-sheet__handle').boundingBox());
  await phone.stroke(handle, { x: handle.x, y: handle.y + 520 }, { steps: 12, ms: 20 });
  check('dragged far down it closes', (await look()).tool === null);
  await phone.tap(centre(await p.locator(W + ' .mx-tabdocs__phone-tool', { hasText: 'Problems' }).boundingBox()));
  await phone.axe('a tool sheet open');
  await p.goBack();
  await settle(p);
  check('back closes the tool sheet', (await look()).tool === null);
  // Nothing open: back goes back through the documents.
  const was = (await look()).title;
  await p.goBack();
  await settle(p);
  s = await look();
  check('with nothing open, back goes back to the document before', s.title !== was && p.url().endsWith('/tabdocs/mobile'), `${was} → ${s.title}`);

  // The title's commands as an action sheet.
  await phone.tap(centre(await p.locator(W + ' .mx-tabdocs__phone-title').boundingBox()));
  const items = await p.locator('.mx-tabdocs__menu-sheet[data-open] .mx-menu__item .mx-menu__label').allTextContents();
  check('a tap on the title opens the tab menu as an action sheet, without new windows', items.includes('Close') && items.includes('Pin') && !items.some((i) => /new window/i.test(i)), JSON.stringify(items));
  const pin = p.locator('.mx-tabdocs__menu-sheet[data-open] .mx-menu__item', { hasText: 'Pin' }).first();
  // The sheet is as tall as the manager lets it be: its list scrolls to the item.
  await pin.evaluate((el) => {
    const body = el.closest('.mx-bottom-sheet__body');
    body.scrollTop += el.getBoundingClientRect().top - body.getBoundingClientRect().top - 40;
  });
  await p.waitForTimeout(100);
  await phone.tap(centre(await pin.boundingBox()));
  await phone.tap(centre(await p.locator(W + ' .mx-tabdocs__phone-count').boundingBox()));
  const pinned = await p.locator(W + ' .mx-tabdocs__list-row[data-pinned] .mx-tabdocs__list-title').allTextContents();
  check('…and its items run: the document shown is pinned (first in the list, marked)', !(await look()).actions && pinned.length === 1 && (await look()).rows[0] === pinned[0], JSON.stringify(pinned));
  await p.goBack();
  await settle(p);

  // Switching presentations and back keeps every content and its state.
  const P = 'section[aria-labelledby="ways"] .mx-tabdocs';
  await p.locator(P).scrollIntoViewIfNeeded();
  const mark = () =>
    p.evaluate((m) => {
      const el = document.querySelector(m);
      const panels = [...el.querySelectorAll('.mx-tabdocs__panel')];
      for (const panel of panels) panel.__mark ??= Math.random();
      return { marks: panels.map((x) => x.__mark).sort().join(','), json: null };
    }, P);
  const first = await mark();
  const saved = [];
  for (const kind of ['Desktop', 'Phone', 'Tablet', 'Desktop']) {
    await p.locator('section[aria-labelledby="ways"] .mx-radio-group__text', { hasText: kind }).click();
    await settle(p);
    await p.locator('section[aria-labelledby="ways"]').getByRole('button', { name: 'Save the layout' }).click();
    saved.push(await p.locator('section[aria-labelledby="ways"] output').last().textContent());
  }
  const after = await mark();
  check('desktop → phone → tablet → desktop: the same panels, never made again', after.marks === first.marks, `${first.marks.length} / ${after.marks.length}`);
  check('…and the layout saves the same in each', saved.every((t) => t.includes('the same as the first save')), JSON.stringify(saved));
  check('no errors or MotifJS warnings on the phone', phone.errors.length === 0, phone.errors.slice(0, 3).join(' | '));
  await phone.context.close();

  // The tablet.
  const tablet = await device(820, 1180);
  p = tablet.page;
  await p.goto(base + 'tabdocs/mobile', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  await p.locator(P).scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  const tab = () =>
    p.evaluate((m) => {
      const el = document.querySelector(m);
      return {
        presentation: el.dataset.presentation ?? 'desktop',
        slots: [...el.querySelectorAll('.mx-tabdocs__group')].filter((g) => g.dataset.slot && g.dataset.slot !== 'none').map((g) => g.dataset.slot + ':' + [...g.querySelectorAll('[role="tab"]')].map((t) => t.querySelector('.mx-tabdocs__title').textContent + (t.hasAttribute('data-guest') ? '*' : '')).join(',')),
        drawer: !!el.querySelector('.mx-drawer[data-open]'),
        sheet: [...el.querySelectorAll('.mx-tabdocs__tool-panel.mx-bottom-sheet')].some((x) => x.hasAttribute('data-open')),
      };
    }, P);
  let t = await tab();
  check('a tablet: two groups side by side, the third folded into the second as tabs', t.presentation === 'tablet' && t.slots.length === 2 && t.slots[1].includes('*'), JSON.stringify(t));
  const tabletTargets = await p.evaluate((m) => [...document.querySelectorAll(m + ' [role="tab"]')].filter((x) => x.offsetParent).map((x) => Math.round(x.getBoundingClientRect().height)), P);
  check('on a touch screen its tabs are taller (control.height.lg)', tabletTargets.every((h) => h >= 40), JSON.stringify(tabletTargets));
  const guest = p.locator(P + ' [role="tab"][data-guest]').first();
  // In sight in its strip first (the strip scrolls, it is not under the toolbar).
  await guest.evaluate((el) => el.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
  await tablet.tap(centre(await guest.boundingBox()));
  t = await tab();
  check('a tap on a folded tab shows its own group in that place', t.slots.length === 2 && /2:router\.ts,README\.md\*|2:router\.ts/.test(t.slots[1]), JSON.stringify(t));
  await tablet.tap(centre(await p.locator(P + ' .mx-tabdocs__autohide[data-side="left"] .mx-tabdocs__autohide-tab').first().boundingBox()));
  check('a title along the left edge opens its area in a drawer', (await tab()).drawer);
  await tablet.axe('the tablet with a drawer open');
  await p.goBack();
  await settle(p);
  check('back closes the drawer', !(await tab()).drawer);
  const m = await p.locator(P).boundingBox();
  await tablet.stroke({ x: m.x + 8, y: m.y + m.height / 2 }, { x: m.x + 480, y: m.y + m.height / 2 }, { steps: 12, ms: 25 });
  check('a finger swiping in from the left edge opens the drawer', (await tab()).drawer);
  await p.goBack();
  await settle(p);
  await tablet.tap(centre(await p.locator(P + ' .mx-tabdocs__autohide[data-side="bottom"] .mx-tabdocs__autohide-tab').first().boundingBox()));
  check('a title along the bottom opens its area in a sheet', (await tab()).sheet);
  await p.goBack();
  await settle(p);
  // A window floats as a large sheet.
  await p.locator('section[aria-labelledby="ways"] .mx-radio-group__text', { hasText: 'Phone' }).click();
  await settle(p);
  await p.locator('section[aria-labelledby="ways"] .mx-radio-group__text', { hasText: 'Tablet' }).click();
  await settle(p);
  await tablet.axe('the tablet presentation');

  // Width on a touch screen: the full width of a tablet (738) is a tablet; narrowed under 560 a phone; widened, a tablet again.
  await p.locator(W).scrollIntoViewIfNeeded();
  const w = () => p.evaluate((sel) => document.querySelector(sel).dataset.presentation ?? 'desktop', W);
  const full = await w();
  const bars = await p.evaluate((sel) => [...document.querySelectorAll(sel + ' .mx-tabdocs__group[data-slot]:not([data-slot="none"])')].map((g) => [g.hasAttribute('data-compact'), g.hasAttribute('data-scroll-buttons'), g.dataset.barSize]), W);
  check('on a touch screen the manager at the full width of a tablet (738 px) shows as on a tablet', full === 'tablet', full);
  check('…its groups with the compact bars: no scroll buttons, small buttons', bars.length > 0 && bars.every(([compact, scroll, size]) => compact && !scroll && size === 'small'), JSON.stringify(bars));
  await p.locator('section[aria-labelledby="width"] textarea').fill('typed on a tablet');
  await p.locator('section[aria-labelledby="width"]').getByRole('button', { name: '390 px' }).click();
  await settle(p);
  const asPhone = await w();
  await p.locator('section[aria-labelledby="width"]').getByRole('button', { name: 'Full width' }).click();
  await settle(p);
  const back = await w();
  const typed = await p.locator('section[aria-labelledby="width"] textarea').inputValue();
  check('narrowed it goes tablet → phone, and widened back to tablet', asPhone === 'phone' && back === 'tablet', [full, asPhone, back].join(' → '));
  check('…keeping what was typed in its document', typed === 'typed on a tablet', typed);
  check('no errors or MotifJS warnings on the tablet', tablet.errors.length === 0, tablet.errors.slice(0, 3).join(' | '));
  await tablet.context.close();

  // A mouse: the same narrow manager stays a desktop until it is under phoneWidth.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + 'tabdocs/mobile', { waitUntil: 'networkidle' });
  await page.locator(W).scrollIntoViewIfNeeded();
  const kind = () => page.evaluate((sel) => document.querySelector(sel).dataset.presentation ?? 'desktop', W);
  const wide = await kind();
  await page.locator('section[aria-labelledby="width"]').getByRole('button', { name: '390 px' }).click();
  await page.waitForTimeout(400);
  const narrow = await kind();
  check('with a mouse a 590 px manager stays a desktop, and is a phone only under 560', wide === 'desktop' && narrow === 'phone', `${wide} → ${narrow}`);
}
