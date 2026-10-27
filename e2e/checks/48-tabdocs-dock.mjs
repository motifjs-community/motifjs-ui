/** Real-browser checks of the TabDocumentManager's Dock and floating windows page: guides, windows, dock areas, auto hide, the keys. */
export default async function ({ page, base, check, axeSource, box }) {
  const centre = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  const tabOf = (m, title) => m.getByRole('tab', { name: new RegExp(`^${title.replace('.', '\\.')}`) }).first();
  /** The titles of the documents' groups, of each dock area and of each window. */
  const layout = (m) =>
    m.evaluate((el) => {
      const titles = (g) => [...g.querySelectorAll('[role="tab"] .mx-tabdocs__title')].map((t) => t.textContent).join(',');
      const groups = [...el.querySelectorAll('.mx-tabdocs__group')].filter((g) => g.closest('.mx-tabdocs') === el);
      const main = groups.filter((g) => !g.closest('.mx-tabdocs__area, .mx-tabdocs__window')).map(titles);
      const areas = Object.fromEntries([...el.querySelectorAll('.mx-tabdocs__area')].map((a) => [a.dataset.side, [...a.querySelectorAll('.mx-tabdocs__group')].map(titles)]));
      const windows = [...el.querySelectorAll('.mx-tabdocs__window')].map((w) => [...w.querySelectorAll('.mx-tabdocs__group')].map(titles));
      return { main, areas, windows };
    });
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
  const grab = async (tab) => {
    const t = await still(tab);
    return { x: t.x + Math.min(t.width / 2, 40), y: t.y + t.height / 2 };
  };
  /** Presses at `from`, goes past the threshold, moves to `to` and lets go (unless `hold`). */
  const drag = async (from, to, { hold = false } = {}) => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x + 12, from.y + 6, { steps: 2 });
    await page.mouse.move(to.x, to.y, { steps: 10 });
    await page.waitForTimeout(180);
    if (hold) return;
    await page.mouse.up();
    await page.waitForTimeout(200);
  };
  /** The shown guides, by kind and side, with their middles. */
  const guides = () =>
    page.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll('.mx-tabdocs__guide')]
          .filter((g) => !g.hidden)
          .map((g) => {
            const r = g.getBoundingClientRect();
            return [`${g.dataset.kind}:${g.dataset.side}`, { x: r.x + r.width / 2, y: r.y + r.height / 2, pointed: g.hasAttribute('data-pointed') }];
          }),
      ),
    );
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
  const open = async (anchor = 'ide') => {
    await page.goto(base + 'tabdocs/dock', { waitUntil: 'load' });
    await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
    const m = page.locator(`section[aria-labelledby="${anchor}"] .mx-tabdocs`).first();
    await m.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await still(m);
    return m;
  };
  const flat = (l) => JSON.stringify(l);

  // The starting layout: files in the middle, the explorer and the outline folded at the left, problems and output at the bottom.
  let m = await open();
  const start = await layout(m);
  check('starts with the files among the documents, two tools folded left, two at the bottom', flat(start) === flat({ main: ['index.ts,app.ts,router.ts'], areas: { left: ['Explorer,Outline'], bottom: ['Problems,Output'] }, windows: [] }), flat(start));
  check('…the left area shows only its titles, as a toolbar', await m.locator('.mx-tabdocs__autohide[data-side="left"]').evaluate((s) => !s.hidden && s.getAttribute('role') === 'toolbar' && s.querySelectorAll('button').length === 2));

  // The guides while dragging over the manager, none away from it.
  const mainContent = await box(m.locator('.mx-tabdocs__group').first().locator('.mx-tabdocs__panels'));
  await drag(await grab(tabOf(m, 'app.ts')), centre(mainContent), { hold: true });
  let shown = await guides();
  check('dragging over a group: four guides of its cross (its own group: no middle) and four at the edges', Object.keys(shown).sort().join(' ') === 'cross:down cross:left cross:right cross:up edge:bottom edge:left edge:right edge:top', Object.keys(shown).join(' '));
  await page.mouse.move(5, 5, { steps: 4 });
  await page.waitForTimeout(120);
  check('…and none away from the manager', Object.keys(await guides()).length === 0);
  await page.keyboard.press('Escape');
  await page.mouse.up();

  // Each guide of the cross over the documents' group, each one from a fresh page.
  for (const side of ['left', 'right', 'up', 'down']) {
    m = await open();
    const content = await box(m.locator('.mx-tabdocs__group').first().locator('.mx-tabdocs__panels'));
    await drag(await grab(tabOf(m, 'app.ts')), centre(content), { hold: true });
    const g = (await guides())[`cross:${side}`];
    await page.mouse.move(g.x, g.y, { steps: 4 });
    await page.waitForTimeout(150);
    const pointed = (await guides())[`cross:${side}`]?.pointed;
    const area = await m.evaluate(() => {
      const a = document.querySelector('.mx-tabdocs__drop');
      return a && !a.hidden ? a.getBoundingClientRect().toJSON() : null;
    });
    const half = side === 'left' || side === 'right' ? Math.abs(area?.width - content.width / 2) <= 2 : Math.abs(area?.height - content.height / 2) <= 2;
    await page.mouse.up();
    await page.waitForTimeout(200);
    const after = await layout(m);
    const boxes = await m.evaluate((el) => [...el.querySelectorAll(':scope .mx-tabdocs__group')].filter((x) => !x.closest('.mx-tabdocs__area, .mx-tabdocs__window')).map((x) => ({ t: x.textContent.includes('app.ts'), r: x.getBoundingClientRect().toJSON() })));
    const made = boxes.find((b) => b.t)?.r;
    const other = boxes.find((b) => !b.t)?.r;
    const placed = side === 'left' ? made.right <= other.x + 2 : side === 'right' ? made.x >= other.right - 2 : side === 'up' ? made.bottom <= other.y + 2 : made.y >= other.bottom - 2;
    check(`the ${side} guide of the cross: pointed, half the group marked, a new group on that side`, pointed && half && after.main.length === 2 && placed, `${flat(after)} ${JSON.stringify(area)}`);
  }

  // The middle of the cross over another group, and the four guides at the edges.
  m = await open();
  {
    const bottom = await box(m.locator('.mx-tabdocs__area[data-side="bottom"] .mx-tabdocs__panels').first());
    await drag(await grab(tabOf(m, 'app.ts')), centre(bottom), { hold: true });
    const g = (await guides())['cross:center'];
    await page.mouse.move(g.x, g.y, { steps: 4 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(200);
    const after = await layout(m);
    check('the middle guide over the bottom area\'s group: the tab joins that group', flat(after.areas.bottom) === flat(['Problems,Output,app.ts']), flat(after));
  }
  for (const side of ['left', 'right', 'top', 'bottom']) {
    m = await open();
    const content = await box(m.locator('.mx-tabdocs__group').first().locator('.mx-tabdocs__panels'));
    await drag(await grab(tabOf(m, 'router.ts')), centre(content), { hold: true });
    const g = (await guides())[`edge:${side}`];
    await page.mouse.move(g.x, g.y, { steps: 4 });
    await page.waitForTimeout(150);
    const marked = await page.evaluate(() => !document.querySelector('.mx-tabdocs__drop')?.hidden);
    await page.mouse.up();
    await page.waitForTimeout(200);
    const after = await layout(m);
    const where = after.areas[side] ?? [];
    check(`the ${side} guide at the edge: marked, router.ts docks in the ${side} area`, marked && where.some((t) => t.split(',').includes('router.ts')) && !after.main.join(',').includes('router.ts'), flat(after));
  }

  // Floating: let go away from every guide, then move, resize, and back into a group by its strip.
  m = await open();
  {
    const content = await box(m.locator('.mx-tabdocs__group').first().locator('.mx-tabdocs__panels'));
    await drag(await grab(tabOf(m, 'app.ts')), { x: content.x + 40, y: content.bottom - 30 });
    let after = await layout(m);
    check('let go away from the guides, the tab floats in a window of its own', flat(after.windows) === flat([['app.ts']]) && !after.main[0].includes('app.ts'), flat(after));
    const w = page.locator('.mx-tabdocs__window');
    check('…a dialog in front, named, active', await w.evaluate((el) => el.getAttribute('role') === 'dialog' && el.getAttribute('aria-label') === 'Floating window 1' && el.hasAttribute('data-active')));
    await axe('with a floating window open');
    let r = await box(w);
    const strip = await box(w.locator('.mx-tabdocs__strip'));
    // Away from the manager (over it, a guide would dock it): the window follows the pointer.
    const page1 = await box(m);
    const to = { x: page1.right + 20, y: page1.y + 30 };
    const from = { x: strip.right - 20, y: strip.y + strip.height / 2 };
    await drag(from, to);
    let r2 = await box(w);
    check('the window moves by the empty part of its strip', Math.abs(r2.x - (r.x + to.x - from.x)) <= 1 && Math.abs(r2.y - (r.y + to.y - from.y)) <= 1, `${JSON.stringify(r)} → ${JSON.stringify(r2)}`);
    await drag({ x: r2.right - 3, y: r2.bottom - 3 }, { x: r2.right + 47, y: r2.bottom + 27 });
    const r3 = await box(w);
    check('…and resizes from its corner', Math.abs(r3.width - (r2.width + 50)) <= 1 && Math.abs(r3.height - (r2.height + 30)) <= 1, `${JSON.stringify(r2)} → ${JSON.stringify(r3)}`);
    // The popups of a window lie over it, and the tab gets focus back.
    const wtab = await box(w.getByRole('tab').first());
    await page.mouse.click(wtab.x + 20, wtab.y + wtab.height / 2, { button: 'right' });
    await page.waitForTimeout(250);
    const menuOnTop = await page.evaluate(() => {
      const menu = [...document.querySelectorAll('.mx-popup')].find((p) => p.matches(':popover-open'));
      if (!menu) return false;
      const b = menu.getBoundingClientRect();
      return menu.contains(document.elementFromPoint(b.x + b.width / 2, b.y + 12));
    });
    check('the tab\'s menu in a window lies above the window', menuOnTop);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    check('…and Escape gives the tab its focus back', await page.evaluate(() => document.activeElement?.closest('.mx-tabdocs__window') && document.activeElement?.getAttribute('role') === 'tab'));
    const ghostOver = await (async () => {
      const t = await grab(tabOf(m, 'index.ts'));
      const c = centre(await box(w));
      await drag(t, c, { hold: true });
      const result = await page.evaluate(() => {
        const ghost = document.querySelector('.mx-tabdocs__ghost');
        const win = document.querySelector('.mx-tabdocs__window');
        return !!ghost && Number(getComputedStyle(ghost).zIndex) > Number(getComputedStyle(win).zIndex);
      });
      await page.keyboard.press('Escape');
      await page.mouse.up();
      return result;
    })();
    check('the copy of a tab dragged lies above a window', ghostOver);
    // Back into the documents' group: the window dropped on its strip.
    const main = await box(m.locator('.mx-tabdocs__group').first().locator('.mx-tabdocs__strip'));
    r = await box(w);
    const wstrip = await box(w.locator('.mx-tabdocs__strip'));
    await drag({ x: wstrip.right - 20, y: wstrip.y + wstrip.height / 2 }, { x: main.right - 30, y: main.y + main.height / 2 });
    after = await layout(m);
    check('a window let go on a strip docks there: its tab joins that group, the window closes', after.windows.length === 0 && after.main[0].split(',').includes('app.ts'), flat(after));
  }

  // Auto hide: a click slides the folded area out, Escape and a press outside slide it back.
  m = await open();
  {
    const title = m.locator('.mx-tabdocs__autohide-tab').first();
    await title.click();
    await page.waitForTimeout(400);
    const area = m.locator('.mx-tabdocs__area[data-side="left"]');
    const out = await area.evaluate((el) => el.hasAttribute('data-open') && el.getBoundingClientRect().width > 100);
    check('a click on a folded title slides its area out over the documents, focus inside', out && (await page.evaluate(() => !!document.activeElement?.closest('.mx-tabdocs__area'))) && (await title.getAttribute('aria-expanded')) === 'true');
    await axe('with a folded area slid out');
    const tipOk = await (async () => {
      // A menu over the slid out area.
      const tab = await box(area.getByRole('tab').first());
      await page.mouse.click(tab.x + 20, tab.y + tab.height / 2, { button: 'right' });
      await page.waitForTimeout(250);
      const ok = await page.evaluate(() => {
        const menu = [...document.querySelectorAll('.mx-popup')].find((p) => p.matches(':popover-open'));
        const b = menu?.getBoundingClientRect();
        return !!b && menu.contains(document.elementFromPoint(b.x + b.width / 2, b.y + 12));
      });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      return ok;
    })();
    check('a menu opened in the slid out area lies above it', tipOk);
    const before = await page.evaluate(() => `${document.activeElement?.className} ${document.activeElement?.textContent?.slice(0, 20)}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const focus = await page.evaluate(() => `${document.activeElement?.className} ${document.activeElement?.textContent?.slice(0, 20)}`);
    check('Escape slides it back, and the title gets focus', !(await area.evaluate((el) => el.hasAttribute('data-open'))) && focus.startsWith('mx-tabdocs__autohide-tab'), `${before} → ${focus}`);
    await title.click();
    await page.waitForTimeout(300);
    const content = await box(m.locator('.mx-tabdocs__group').first().locator('.mx-tabdocs__panels'));
    await page.mouse.click(content.right - 20, content.bottom - 20);
    await page.waitForTimeout(400);
    check('…and a press outside it too', !(await area.evaluate((el) => el.hasAttribute('data-open'))));
    // The pin of the bottom area folds it.
    await m.locator('.mx-tabdocs__area[data-side="bottom"] .mx-tabdocs__auto-hide').first().click();
    await page.waitForTimeout(200);
    check('the pin of the bottom area folds it to its edge', await m.locator('.mx-tabdocs__autohide[data-side="bottom"]').evaluate((s) => !s.hidden));
    await page.mouse.move(5, 5);
    // Frame by frame while an area slides out and back: it comes from under its strip, and nothing else moves.
    for (const side of ['left', 'bottom']) {
      const watch = () =>
        m.evaluate(
          (el, side) =>
            new Promise((done) => {
              const strip = el.querySelector(`.mx-tabdocs__autohide[data-side="${side}"]`);
              const main = [...el.querySelectorAll('.mx-tabdocs__group')].find((g) => !g.closest('.mx-tabdocs__area'));
              const seen = { under: true, mainY: new Set(), scroll: new Set() };
              const start = performance.now();
              const frame = () => {
                const s = strip.getBoundingClientRect();
                seen.under &&= !!document.elementFromPoint(s.x + s.width / 2, s.y + s.height / 2)?.closest('.mx-tabdocs__autohide');
                seen.mainY.add(Math.round(main.getBoundingClientRect().y));
                seen.scroll.add(`${el.scrollTop},${el.scrollLeft},${document.scrollingElement.scrollTop}`);
                if (performance.now() - start < 500) requestAnimationFrame(frame);
                else done({ under: seen.under, mainY: [...seen.mainY], scroll: [...seen.scroll] });
              };
              requestAnimationFrame(frame);
            }),
          side,
        );
      const title = m.locator(`.mx-tabdocs__autohide[data-side="${side}"] .mx-tabdocs__autohide-tab`).first();
      const out = watch();
      await title.click();
      await page.mouse.move(5, 5);
      const o = await out;
      const back = watch();
      await page.keyboard.press('Escape');
      const b = await back;
      const ok = (r) => r.under && r.mainY.length === 1 && r.scroll.length === 1;
      check(`the ${side} area slides out and back from under its strip, the documents and the page stay still`, ok(o) && ok(b), JSON.stringify({ o, b }));
    }
  }

  // The keys.
  m = await open();
  {
    await tabOf(m, 'router.ts').click();
    await page.keyboard.press('Control+k');
    await page.keyboard.press('o');
    await page.waitForTimeout(150);
    let after = await layout(m);
    check('Ctrl+K O floats the active document', flat(after.windows) === flat([['router.ts']]), flat(after));
    const w = page.locator('.mx-tabdocs__window');
    const r = await box(w);
    await page.keyboard.press('Control+k');
    await page.keyboard.press('Space');
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Enter');
    const r2 = await box(w);
    check('Ctrl+K Space moves the window by the arrows and resizes it with Shift', Math.abs(r2.x - r.x - 30) <= 1 && Math.abs(r2.height - r.height - 10) <= 1, `${JSON.stringify(r)} → ${JSON.stringify(r2)}`);
    await page.keyboard.press('F6');
    const f1 = await page.evaluate(() => (document.activeElement?.closest('.mx-tabdocs__window') ? 'window' : document.activeElement?.closest('.mx-tabdocs__area') ? 'area' : 'documents'));
    await page.keyboard.press('F6');
    const f2 = await page.evaluate(() => (document.activeElement?.closest('.mx-tabdocs__window') ? 'window' : document.activeElement?.closest('.mx-tabdocs__area') ? 'area' : 'documents'));
    check('F6 goes round the parts: documents, the bottom area, the window', f1 === 'documents' && f2 === 'area', `${f1} ${f2}`);
    await tabOf(m, 'router.ts').click();
    await page.keyboard.press('Control+k');
    await page.keyboard.press('d');
    await page.waitForTimeout(150);
    after = await layout(m);
    check('Ctrl+K D docks it back where it was', after.windows.length === 0 && after.main[0].includes('router.ts'), flat(after));
    await tabOf(m, 'router.ts').click();
    await page.keyboard.press('Control+k');
    await page.keyboard.press('Alt+ArrowRight');
    await page.waitForTimeout(150);
    after = await layout(m);
    check('Ctrl+K Alt+Right docks it in a new right area', flat(after.areas.right) === flat(['router.ts']), flat(after));
    await tabOf(m, 'router.ts').click();
    await page.keyboard.press('Control+k');
    await page.keyboard.press('h');
    await page.waitForTimeout(150);
    check('Ctrl+K H folds its area', await m.locator('.mx-tabdocs__area[data-side="right"]').evaluate((a) => a.hasAttribute('data-auto-hide')));
    check('…and it is said', (await m.locator('.mx-tabdocs__live').textContent()) === 'Right dock area folded to its edge', await m.locator('.mx-tabdocs__live').textContent());
  }

  // Saving and loading the whole layout.
  m = await open('layout');
  {
    const section = page.locator('section[aria-labelledby="layout"]');
    await section.getByRole('button', { name: 'Float Notes' }).click();
    await section.getByRole('button', { name: 'Save layout' }).click();
    const json = JSON.parse(await section.locator('.td-json').textContent());
    check('the saved layout has the areas and the window', json.version === 3 && json.areas?.length === 2 && json.windows?.length === 1 && json.windows[0].rect.width === 380, JSON.stringify({ areas: json.areas?.map((a) => a.side), windows: json.windows?.map((w) => w.rect) }));
    const before = await layout(m);
    // Change it: the window docks back, the right area folds.
    await page.locator('.mx-tabdocs__window').evaluate(() => {});
    await m.locator('.mx-tabdocs__window .mx-tabdocs__strip').first().dblclick();
    await m.locator('.mx-tabdocs__area[data-side="right"] .mx-tabdocs__auto-hide').first().click();
    await page.waitForTimeout(150);
    const changed = await layout(m);
    await section.getByRole('button', { name: 'Restore layout' }).click();
    await page.waitForTimeout(200);
    const back = await layout(m);
    const wr = await box(page.locator('.mx-tabdocs__window'));
    check('restored: the window at its place and the areas as they were', flat(back) === flat(before) && flat(changed) !== flat(before) && Math.abs(wr.width - 380) <= 1, `${flat(before)} / ${flat(changed)} / ${flat(back)}`);
  }

  // How fast the screen draws while a window is dragged around.
  m = await open('windows');
  {
    const section = page.locator('section[aria-labelledby="windows"]');
    await section.getByRole('button', { name: 'Float README.md' }).click();
    await page.waitForTimeout(200);
    const w = page.locator('.mx-tabdocs__window');
    const rate = await page.evaluate(
      () =>
        new Promise((done) => {
          const times = [];
          const tick = (t) => (times.push(t) < 61 ? requestAnimationFrame(tick) : done(60000 / (times[60] - times[0])));
          requestAnimationFrame(tick);
        }),
    );
    const strip = await box(w.locator('.mx-tabdocs__strip'));
    const from = { x: strip.right - 20, y: strip.y + strip.height / 2 };
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x + 12, from.y + 6, { steps: 2 });
    await page.evaluate(() => {
      window.__frames = [];
      const tick = (t) => {
        window.__frames.push(t);
        if (window.__frames.length < 1000) window.__raf = requestAnimationFrame(tick);
      };
      window.__raf = requestAnimationFrame(tick);
    });
    const started = Date.now();
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 4;
      await page.mouse.move(from.x - 150 + Math.cos(a) * 140, from.y + 120 + Math.sin(a) * 90);
    }
    const seconds = (Date.now() - started) / 1000;
    const frames = await page.evaluate(() => {
      cancelAnimationFrame(window.__raf);
      const f = window.__frames;
      const gaps = f.slice(1).map((t, i) => t - f[i]);
      return { count: f.length, longest: Math.max(...gaps), long: gaps.filter((g) => g > 50).length };
    });
    await page.mouse.up();
    const fps = frames.count / seconds;
    console.log(`fps while dragging a window: ${fps.toFixed(1)} of the screen's ${rate.toFixed(1)} (${frames.count} frames in ${seconds.toFixed(2)} s, longest ${frames.longest.toFixed(1)} ms, ${frames.long} over 50 ms)`);
    check('dragging a window keeps the frame rate', fps >= rate * 0.85 && frames.long <= 3, `${fps.toFixed(1)} of ${rate.toFixed(1)} fps, longest ${frames.longest.toFixed(1)} ms`);
  }
}
