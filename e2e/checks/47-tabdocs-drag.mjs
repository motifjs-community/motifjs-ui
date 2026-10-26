/** Real-browser checks of the TabDocumentManager's Drag and drop page: real mouse drags, a finger, the keys. */
export default async function ({ page, base, check, axeSource, box }) {
  const groupsOf = (m) => m.locator(':scope .mx-tabdocs__group');
  const names = (m) => m.evaluate((el) => [...el.querySelectorAll('.mx-tabdocs__group')].filter((g) => g.closest('.mx-tabdocs') === el).map((g) => [...g.querySelectorAll('[role="tab"] .mx-tabdocs__title')].map((t) => t.textContent)));
  const groupBoxes = (m) => m.evaluate((el) => [...el.querySelectorAll('.mx-tabdocs__group')].map((g) => g.getBoundingClientRect().toJSON()));
  const centre = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  const content = (m, i) => box(groupsOf(m).nth(i).locator('.mx-tabdocs__panels'));
  const tabOf = (m, title) => m.getByRole('tab', { name: new RegExp(`^${title.replace('.', '\\.')}`) }).first();
  const flat = async (m) => (await names(m)).map((g) => g.join(',')).join(' | ');
  const marks = (m) =>
    m.evaluate((el) => {
      const area = el.querySelector('.mx-tabdocs__drop');
      const mark = el.querySelector('.mx-tabdocs__insert');
      return { area: area && !area.hidden ? area.getBoundingClientRect().toJSON() : null, mark: mark && !mark.hidden ? mark.getBoundingClientRect().toJSON() : null, dragging: el.dataset.dragging ?? null };
    });

  /** The box of something once the page has stopped scrolling (the docs scroll smoothly). */
  const still = async (loc) => {
    let a = await box(loc);
    for (let i = 0; i < 25; i++) {
      await page.waitForTimeout(60);
      const b = await box(loc);
      if (Math.abs(b.x - a.x) < 0.5 && Math.abs(b.y - a.y) < 0.5) return b;
      a = b;
    }
    return a;
  };
  const inView = async (loc) => {
    await loc.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await still(loc);
  };
  /** The group (its index) that has a document of that title. */
  const groupWith = async (m, title) => (await names(m)).findIndex((titles) => titles.includes(title));
  /** A tab brought into sight in its strip: the middle of the part of it that shows. */
  const grab = async (tab) => {
    await tab.evaluate((el) => el.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
    const t = await still(tab);
    const row = await tab.evaluate((el) => el.parentElement.getBoundingClientRect().toJSON());
    return { x: (Math.max(t.left, row.left) + Math.min(t.right, row.right)) / 2, y: t.y + t.height / 2 };
  };
  /** Presses at `from`, goes past the threshold, moves to `to` and lets go (unless `hold`). */
  const drag = async (from, to, { ctrl = false, hold = false, wait = 0 } = {}) => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    if (ctrl) await page.keyboard.down('Control');
    await page.mouse.move(from.x + 10, from.y + 3, { steps: 2 });
    await page.mouse.move(to.x, to.y, { steps: 8 });
    // The area glides to its place.
    await page.waitForTimeout(Math.max(wait, 150));
    if (hold) return;
    await page.mouse.up();
    if (ctrl) await page.keyboard.up('Control');
    await page.waitForTimeout(150);
  };
  const axe = async (label) => {
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await page.waitForTimeout(150);
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
      check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  };
  const open = async () => {
    await page.goto(base + 'tabdocs/drag', { waitUntil: 'load' });
    await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
    const section = page.locator('section[aria-labelledby="drag"]');
    const m = section.locator('.mx-tabdocs').first();
    await inView(m);
    return { section, m };
  };

  // Reorder, with the strip scrolling near its end.
  let { section, m } = await open();
  const state = section.locator('.td-state');
  check('starts with three groups', JSON.stringify(await names(m)) === '[["index.ts","app.ts","router.ts","index.ts"],["orders.ts","README.md"],["package.json","vite.config.ts"]]', await flat(m));
  let from = await grab(tabOf(m, 'router.ts'));
  const strip = groupsOf(m).nth(0).locator('.mx-tabdocs__row');
  const row = await box(strip);
  check('the strip starts scrolled, with router.ts in sight', (await strip.evaluate((el) => el.scrollLeft)) > 0);
  await drag(from, { x: row.x + 3, y: from.y }, { hold: true });
  // Held near the start, the strip scrolls there (by frames: as fast as the screen draws).
  for (let i = 0; i < 40 && (await strip.evaluate((el) => el.scrollLeft)) > 0; i++) await page.waitForTimeout(100);
  await page.waitForTimeout(150);
  const insert = await marks(m);
  check('a mark shows where the tab goes, at the start of the strip it scrolled back to', !!insert.mark && Math.abs(insert.mark.x + insert.mark.width / 2 - row.x) <= 3 && insert.dragging === 'move', JSON.stringify(insert));
  check('a copy of the tab follows the pointer', (await page.locator('.mx-tabdocs__ghost').textContent())?.includes('router.ts'));
  await page.mouse.up();
  await page.waitForTimeout(150);
  check('dropped there, the strip reorders', (await names(m))[0][0] === 'router.ts', await flat(m));
  check('…and the copy and the marks are gone', (await page.locator('.mx-tabdocs__ghost').count()) === 0 && !(await marks(m)).mark);

  // To another group's strip (the end of its bar), then into the middle of a group.
  from = await grab(tabOf(m, 'app.ts'));
  let bar = await box(groupsOf(m).nth(1).locator('.mx-tabdocs__bar'));
  await drag(from, { x: bar.right - 6, y: bar.y + bar.height / 2 });
  check('a tab dropped on another strip goes there, at the end', JSON.stringify((await names(m))[1]) === '["orders.ts","README.md","app.ts"]', await flat(m));
  from = await grab(tabOf(m, 'app.ts'));
  let target = centre(await content(m, 0));
  await drag(from, target, { hold: true });
  const over = await marks(m);
  const zone = await content(m, 0);
  check('over the middle of a group, a translucent area covers all its content', !!over.area && Math.abs(over.area.width - zone.width) <= 2 && Math.abs(over.area.height - zone.height) <= 2, JSON.stringify(over.area));
  check('…in the design language: a frame, a translucent fill, gliding', await m.locator('.mx-tabdocs__drop').evaluate((el) => {
    const s = getComputedStyle(el);
    const fill = Number(getComputedStyle(el, '::before').opacity);
    return fill < 1 && fill > 0 && Number(s.opacity) === 1 && parseFloat(s.borderTopWidth) > 0 && s.transitionProperty.includes('left');
  }));
  await axe('while dragging');
  await page.mouse.up();
  await page.waitForTimeout(150);
  check('dropped in the middle, it goes into that group', (await names(m))[0].includes('app.ts') && !(await names(m))[1].includes('app.ts'), await flat(m));

  // The four edges of a group, each one put back.
  for (const side of ['left', 'right', 'up', 'down']) {
    const into = await groupWith(m, 'router.ts');
    const g = await content(m, into);
    // Inside the group's edge zone (a third of it), past the layout's own band (16 px) at the manager's edge.
    const dx = (16 + g.width / 3) / 2;
    const dy = (16 + g.height / 3) / 2;
    const point = { left: { x: g.x + dx, y: g.y + g.height / 2 }, right: { x: g.right - dx, y: g.y + g.height / 2 }, up: { x: g.x + g.width / 2, y: g.y + dy }, down: { x: g.x + g.width / 2, y: g.bottom - dy } }[side];
    const targetBox = (await groupBoxes(m))[into];
    from = await grab(tabOf(m, 'orders.ts'));
    await drag(from, point, { hold: true });
    const half = (await marks(m)).area;
    const halfOk = side === 'left' || side === 'right' ? Math.abs(half?.width - g.width / 2) <= 2 : Math.abs(half?.height - g.height / 2) <= 2;
    await page.mouse.up();
    await page.waitForTimeout(150);
    const all = await names(m);
    const at = all.findIndex((titles) => titles.length === 1 && titles[0] === 'orders.ts');
    const made = (await groupBoxes(m))[at];
    const placed =
      side === 'left' ? made.right <= targetBox.x + targetBox.width / 2 + 2 : side === 'right' ? made.x >= targetBox.x + targetBox.width / 2 - 2 : side === 'up' ? made.bottom <= targetBox.y + targetBox.height / 2 + 2 : made.y >= targetBox.y + targetBox.height / 2 - 2;
    check(`the ${side} edge of a group: half of it is marked, and the new group opens on that side`, halfOk && at >= 0 && placed, `${JSON.stringify(half)} ${await flat(m)}`);
    from = await grab(tabOf(m, 'orders.ts'));
    await drag(from, centre(await content(m, await groupWith(m, 'README.md'))));
  }
  check('…and moved back, the groups are as they were', (await flat(m)) === 'router.ts,index.ts,index.ts,app.ts | README.md,orders.ts | package.json,vite.config.ts', await flat(m));

  // The edge of the whole layout.
  {
    const bottom = await content(m, 2);
    const whole = await box(m);
    from = await grab(tabOf(m, 'README.md'));
    await drag(from, { x: bottom.x + bottom.width / 2, y: bottom.bottom - 5 }, { hold: true });
    const along = (await marks(m)).area;
    await page.mouse.up();
    await page.waitForTimeout(150);
    const boxes = await groupBoxes(m);
    const made = boxes[(await names(m)).findIndex((t) => t.length === 1 && t[0] === 'README.md')];
    check('the bottom edge of the layout: a new group along the whole bottom', !!along && Math.abs(along.width - whole.width) <= 3 && !!made && Math.abs(made.width - whole.width) <= 3 && made.y > boxes[0].y, `${JSON.stringify(along)} ${await flat(m)}`);
    from = await grab(tabOf(m, 'README.md'));
    await drag(from, centre(await content(m, 1)));
  }

  // A copy with Ctrl.
  from = await grab(tabOf(m, 'package.json'));
  await drag(from, centre(await content(m, 0)), { ctrl: true });
  const copied = await names(m);
  check('Ctrl while dropping opens a copy there; the document stays where it was', copied[0].includes('package.json') && copied[2].includes('package.json'), await flat(m));
  check('…and the page says what the drop did', (await state.textContent()).includes('package.json copied'), await state.textContent());

  // Escape.
  const before = await flat(m);
  from = await grab(tabOf(m, 'vite.config.ts'));
  await drag(from, centre(await content(m, 0)), { hold: true });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await page.waitForTimeout(150);
  check('Escape cancels: nothing moved, the marks and the copy are gone', (await flat(m)) === before && (await page.locator('.mx-tabdocs__ghost').count()) === 0 && !(await marks(m)).area, await flat(m));
  check('…and it is said', (await m.locator('.mx-tabdocs__live').textContent()) === 'Move canceled');

  // A whole group, by its handle (its tabs fill its bar), onto the left of another.
  {
    const at = await groupWith(m, 'README.md');
    const moving = JSON.stringify((await names(m))[at]);
    const grip = centre(await box(groupsOf(m).nth(at).locator('.mx-tabdocs__grip')));
    const first = await content(m, 0);
    await drag(grip, { x: first.x + 30, y: first.y + first.height / 2 });
    const after = await names(m);
    check('a group dragged by its handle onto the left edge of another moves there, with its tabs', after.length === 3 && JSON.stringify(after[0]) === moving && after[1][0] === 'router.ts', await flat(m));
  }

  // The keys: "Move to…".
  const keys = page.locator('section[aria-labelledby="keys"]');
  const km = keys.locator('.mx-tabdocs');
  await inView(km);
  await tabOf(km, 'index.ts').click();
  await page.keyboard.press('Control+k');
  await page.keyboard.press('m');
  await page.waitForTimeout(100);
  check('Ctrl+K M starts "Move to…" and says how it works', (await km.locator('.mx-tabdocs__live').textContent()).startsWith('Moving index.ts'), await km.locator('.mx-tabdocs__live').textContent());
  check('…showing the same area as a drag', !!(await marks(km)).area);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(100);
  check('an arrow picks a side and says it', (await km.locator('.mx-tabdocs__live').textContent()) === 'New group below group 2');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  const moved = await names(km);
  check('Enter moves it there', moved.length === 3 && JSON.stringify(moved[2]) === '["index.ts"]', JSON.stringify(moved));
  check('…and the tab keeps focus in its new group', await page.evaluate(() => document.activeElement?.textContent?.includes('index.ts')));
  await axe('after "Move to…"');

  // Between two managers, with the mouse and with a finger.
  const between = page.locator('section[aria-labelledby="between"]');
  const [left, right] = [between.locator('.mx-tabdocs').nth(0), between.locator('.mx-tabdocs').nth(1)];
  await inView(left);
  from = await grab(tabOf(left, 'router.ts'));
  await drag(from, centre(await content(right, 0)));
  check('a tab goes to another manager of the same dragGroup', (await names(right))[0].includes('router.ts') && !(await names(left))[0].includes('router.ts'), `${await flat(left)} / ${await flat(right)}`);
  const cdp = await page.context().newCDPSession(page);
  from = await grab(tabOf(right, 'router.ts'));
  const to = centre(await content(left, 0));
  const touch = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p.x, y: p.y }] : [] });
  await touch('touchStart', from);
  await page.waitForTimeout(700);
  for (let i = 1; i <= 10; i++) await touch('touchMove', { x: from.x + ((to.x - from.x) * i) / 10, y: from.y + ((to.y - from.y) * i) / 10 });
  await touch('touchEnd');
  await page.waitForTimeout(200);
  check('a long press with a finger drags it back', (await names(left))[0].includes('router.ts') && !(await names(right))[0].includes('router.ts'), `${await flat(left)} / ${await flat(right)}`);
  from = await grab(tabOf(left, 'app.ts'));
  await touch('touchStart', from);
  await page.waitForTimeout(80);
  await touch('touchMove', { x: from.x - 60, y: from.y });
  await touch('touchEnd');
  await page.waitForTimeout(200);
  check('…while a swipe before the long press moves nothing', (await names(left))[0].includes('app.ts'), await flat(left));

  // A 3×2 layout made by drops, then frames while dragging over it.
  ({ section, m } = await open());
  // The bottom of the first group, the right edge of the layout, the bottom of that new group.
  from = await grab(tabOf(m, 'router.ts'));
  const g0 = await content(m, 0);
  await drag(from, { x: g0.x + g0.width / 2, y: g0.bottom - (16 + g0.height / 3) / 2 });
  from = await grab(tabOf(m, 'README.md'));
  const g1 = await content(m, await groupWith(m, 'orders.ts'));
  await drag(from, { x: g1.right - 5, y: g1.y + g1.height / 2 });
  from = await grab(tabOf(m, 'vite.config.ts'));
  const last = await content(m, await groupWith(m, 'README.md'));
  await drag(from, { x: last.x + last.width / 2, y: last.bottom - (16 + last.height / 3) / 2 });
  const grid = await groupBoxes(m);
  const columns = new Set(grid.map((b) => Math.round(b.x))).size;
  const rows = new Set(grid.map((b) => Math.round(b.y))).size;
  check('three drops make a layout of three columns and two rows', grid.length === 6 && columns === 3 && rows === 2, `${await flat(m)}; ${columns}×${rows}`);
  {
    // Narrow groups fold their toolbar buttons into its "…" menu before the tabs get less room.
    const folded = await m.evaluate((el) => [...el.querySelectorAll('.mx-tabdocs__group')].map((g) => ({ width: g.getBoundingClientRect().width, strip: g.querySelector('.mx-tabdocs__strip').getBoundingClientRect().width, folded: !!g.querySelector('.mx-toolbar__more:not([data-idle])') })));
    check('the strip of every group keeps at least one tab of room', folded.every((g) => g.strip >= 79), JSON.stringify(folded));
  }
  // How fast this screen draws with nothing going on, then while dragging round the six groups.
  const rate = await page.evaluate(
    () =>
      new Promise((done) => {
        const times = [];
        const tick = (t) => (times.push(t) < 61 ? requestAnimationFrame(tick) : done(60000 / (times[60] - times[0])));
        requestAnimationFrame(tick);
      }),
  );
  from = await grab(tabOf(m, 'index.ts'));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 12, from.y + 4, { steps: 2 });
  await page.evaluate(() => {
    window.__frames = [];
    const tick = (t) => {
      window.__frames.push(t);
      if (window.__frames.length < 1000) window.__raf = requestAnimationFrame(tick);
    };
    window.__raf = requestAnimationFrame(tick);
  });
  const whole = await box(m);
  const started = Date.now();
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 4;
    await page.mouse.move(whole.x + whole.width / 2 + Math.cos(a) * whole.width * 0.4, whole.y + whole.height / 2 + Math.sin(a) * whole.height * 0.4);
  }
  const seconds = (Date.now() - started) / 1000;
  const frames = await page.evaluate(() => {
    cancelAnimationFrame(window.__raf);
    const f = window.__frames;
    const gaps = f.slice(1).map((t, i) => t - f[i]);
    return { count: f.length, longest: Math.max(...gaps), long: gaps.filter((g) => g > 50).length };
  });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  const fps = frames.count / seconds;
  console.log(`fps while dragging over 3×2: ${fps.toFixed(1)} of the screen's ${rate.toFixed(1)} (${frames.count} frames in ${seconds.toFixed(2)} s, longest ${frames.longest.toFixed(1)} ms, ${frames.long} over 50 ms)`);
  check('dragging over a 3×2 layout keeps the frame rate', fps >= rate * 0.85 && frames.long <= 3, `${fps.toFixed(1)} of ${rate.toFixed(1)} fps, longest ${frames.longest.toFixed(1)} ms`);
}
