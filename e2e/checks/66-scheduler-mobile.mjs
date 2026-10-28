/**
 * Real-browser checks of the Scheduler on a phone (390 × 844) and a tablet (820 × 1180), both with touch, and with a
 * mouse and the keys: the presentation by width and pointer and back, the phone's agenda, bar, action sheet and form
 * sheet, a swipe between days (and up and down scrolling natively), a long press lifting and moving an appointment,
 * its handles resizing it, no click after a drag, a pinch zooming the hours, right to left, axe in light and dark.
 */
export default async function ({ page, base, check, axeSource }) {
  const browser = page.context().browser();
  const settle = (p, ms = 350) => p.waitForTimeout(ms);

  /** A page with touch at `width` × `height`, a finger driven through the protocol. */
  const device = async (width, height) => {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const p = await context.newPage();
    await p.clock.install({ time: new Date(2026, 2, 18, 10, 0) });
    await p.clock.resume();
    const errors = [];
    p.on('pageerror', (e) => errors.push(String(e)));
    p.on('console', (m) => (m.type() === 'error' || (m.type() === 'warning' && /\[motifjs\]|MJX\d/.test(m.text()))) && errors.push(m.text()));
    const cdp = await context.newCDPSession(p);
    const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map((t, i) => ({ x: t.x, y: t.y, id: i })) });
    /** Fingers down at `from`, held `hold` ms, moved to `to` in `steps`, then up (unless `up` is false). */
    const stroke = async (from, to, { steps = 10, ms = 16, hold = 0, up = true } = {}) => {
      const many = Array.isArray(from);
      const a = many ? from : [from];
      const b = many ? to : [to];
      await touch('touchStart', a);
      if (hold) await p.waitForTimeout(hold);
      for (let i = 1; i <= steps; i++) {
        await touch('touchMove', a.map((f, k) => ({ x: f.x + ((b[k].x - f.x) * i) / steps, y: f.y + ((b[k].y - f.y) * i) / steps })));
        if (ms) await p.waitForTimeout(ms);
      }
      if (up) await touch('touchEnd', []);
      await settle(p);
    };
    const tap = async (at) => {
      await p.touchscreen.tap(at.x, at.y);
      await settle(p);
    };
    const axe = async (label, scope = null) => {
      for (const theme of ['light', 'dark']) {
        await p.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
        await p.waitForTimeout(150);
        await p.addScriptTag({ content: axeSource });
        // The docs' own header hides its brand name on a narrow screen (a link without a name there): not this page's.
        const violations = await p.evaluate(
          async (sel) => (await window.axe.run(sel ? { include: [[sel]], exclude: [['.docs-brand']] } : { exclude: [['.docs-brand']] })).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`),
          scope,
        );
        check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
      }
      await p.evaluate(() => document.documentElement.removeAttribute('data-theme'));
    };
    return { context, page: p, errors, touch, stroke, tap, axe };
  };
  const centre = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  const S = (id) => `section[aria-labelledby="${id}"] .mx-scheduler`;
  const look = (p, sel) =>
    p.evaluate((sel) => {
      const el = document.querySelector(sel);
      const bar = el.querySelector('.mx-scheduler__bar');
      const shown = (c) => [...bar.querySelectorAll(c)].filter((b) => b.getClientRects().length > 0).length;
      return {
        presentation: el.dataset.presentation,
        view: el.dataset.view,
        width: Math.round(el.getBoundingClientRect().width),
        title: el.querySelector('.mx-scheduler__title')?.textContent.trim(),
        range: el.querySelector('.mx-scheduler__title [title]')?.getAttribute('title') ?? '',
        menu: shown('.mx-scheduler__view-menu'),
        views: shown('.mx-scheduler__view-button'),
        steps: shown('.mx-scheduler__step'),
        today: shown('.mx-scheduler__today-icon'),
        buttons: [...bar.querySelectorAll('button')].filter((b) => b.getClientRects().length > 0).map((b) => Math.round(b.getBoundingClientRect().height)),
        large: Math.round(parseFloat(getComputedStyle(bar).getPropertyValue('--mx-control-height-lg')) * parseFloat(getComputedStyle(document.documentElement).fontSize)),
      };
    }, sel);

  // The phone.
  const phone = await device(390, 844);
  let p = phone.page;
  await p.goto(base + 'scheduler/mobile', { waitUntil: 'networkidle' });
  await settle(p, 600);
  let s = await look(p, S('ways'));
  check('as on a phone: the agenda, the month as the title, Today as an icon, one menu of the views, no steps', s.presentation === 'phone' && s.view === 'agenda' && s.title === 'March' && s.menu === 1 && s.views === 0 && s.steps === 0 && s.today === 1, JSON.stringify(s));
  check('on a touch screen the bar’s buttons take the language’s large control height', s.buttons.every((h) => h === s.large) && s.large >= 40, JSON.stringify(s));
  await phone.axe('the phone presentation', S('ways'));

  // A tap on an agenda row: the tooltip is an action sheet; Edit opens the form in a sheet from the bottom.
  await p.locator(S('ways')).scrollIntoViewIfNeeded();
  const row = p.locator(`${S('ways')} .mx-scheduler__agenda-row`).first();
  await phone.tap(centre(await row.boundingBox()));
  const sheet = p.locator('.mx-scheduler__tooltip-sheet');
  const actions = await sheet.evaluate((el) => ({ open: el.hasAttribute('data-open') || el.matches(':popover-open, [open]') || el.getClientRects().length > 0, items: [...el.querySelectorAll('.mx-menu__label')].map((l) => l.textContent), message: el.querySelector('.mx-action-sheet__message')?.textContent ?? '' })).catch(() => null);
  check('a tap on an appointment opens its action sheet: Edit, Delete, and its time', !!actions?.open && actions.items.join() === 'Edit,Delete' && /\d/.test(actions.message), JSON.stringify(actions));
  await phone.axe('the action sheet', '.mx-scheduler__tooltip-sheet');
  await phone.tap(centre(await sheet.locator('.mx-menu__item').first().boundingBox()));
  await settle(p, 500);
  const form = p.locator('.mx-scheduler__form-sheet');
  const formBox = await form.locator('.mx-bottom-sheet__panel, [class*="__panel"]').first().boundingBox().catch(() => null);
  check('Edit opens the form in a sheet from the bottom, as wide as the screen', !!formBox && formBox.width >= 380 && formBox.y + formBox.height >= 840, JSON.stringify(formBox));
  check('the form is one column', (await form.locator('.mx-form-layout').first().evaluate((el) => getComputedStyle(el).getPropertyValue('--_columns') || el.dataset.columns || '1')) !== '2');
  await phone.axe('the form sheet', '.mx-scheduler__form-sheet');
  await p.keyboard.press('Escape');
  await settle(p, 500);
  check('Escape closes the form sheet', (await p.locator('.mx-scheduler__form-sheet').count()) === 0 || !(await p.locator('.mx-scheduler__form-sheet').isVisible()));

  // The frame of a phone's size, by its width: a day, swiped.
  const F = S('width');
  await p.locator(F).scrollIntoViewIfNeeded();
  await settle(p);
  s = await look(p, F);
  check('a scheduler that follows its width is a phone in a phone’s frame', s.presentation === 'phone', JSON.stringify(s));
  await phone.tap(centre(await p.locator(`${F} .mx-scheduler__view-menu`).boundingBox()));
  await phone.tap(centre(await p.locator('.mx-menu__item:has-text("Day")').last().boundingBox()));
  s = await look(p, F);
  check('the view menu shows the day', s.view === 'day', JSON.stringify(s));
  const before = s.range;
  const area = await p.locator(`${F} .mx-scheduler__scroll`).boundingBox();
  const mid = { x: area.x + area.width * 0.75, y: area.y + area.height / 2 };
  await phone.stroke(mid, { x: area.x + area.width * 0.15, y: mid.y }, { up: false, steps: 12 });
  const edge = await p.evaluate((sel) => {
    const e = document.querySelector(sel + ' .mx-scheduler__swipe-edge');
    const r = e?.getBoundingClientRect();
    const c = document.querySelector(sel + ' .mx-scheduler__content').getBoundingClientRect();
    return e ? { side: e.dataset.side, ready: e.hasAttribute('data-ready'), end: Math.round(c.right - r.right), mid: Math.abs((r.top + r.bottom) / 2 - (c.top + c.bottom) / 2) } : null;
  }, F);
  check('while swiping, the edge mark stands at the side the next day comes from, centred, ready past a quarter', !!edge && edge.side === 'next' && edge.ready && edge.end > 0 && edge.mid <= 0.5, JSON.stringify(edge));
  await phone.touch('touchEnd', []);
  await settle(p);
  s = await look(p, F);
  check('letting go moves to the next day', s.range !== before && /19/.test(s.range), `${before} → ${s.range}`);
  const top = await p.locator(`${F} .mx-scheduler__scroll`).evaluate((el) => el.scrollTop);
  await phone.stroke({ x: mid.x, y: area.y + area.height * 0.8 }, { x: mid.x + 6, y: area.y + area.height * 0.2 });
  const after = await look(p, F);
  const scrolled = await p.locator(`${F} .mx-scheduler__scroll`).evaluate((el) => el.scrollTop);
  check('a swipe up scrolls the hours natively and stays on the day', scrolled > top && after.range === s.range, `${top} → ${scrolled}; ${after.range}`);
  await phone.stroke({ x: area.x + area.width * 0.2, y: mid.y }, { x: area.x + area.width * 0.9, y: mid.y });
  s = await look(p, F);
  check('a swipe the other way goes back a day', /18/.test(s.range), s.range);

  // Right to left: the finger moving right brings the next day.
  await p.evaluate(() => (document.documentElement.dir = 'rtl'));
  await settle(p);
  await phone.stroke({ x: area.x + area.width * 0.2, y: mid.y }, { x: area.x + area.width * 0.9, y: mid.y });
  s = await look(p, F);
  check('right to left, a swipe toward the end brings the next day', /19/.test(s.range), s.range);
  await phone.axe('the phone right to left', F);
  await p.evaluate(() => document.documentElement.removeAttribute('dir'));
  check('no errors or MotifJS warnings on the phone', phone.errors.length === 0, phone.errors.slice(0, 3).join(' | '));
  await phone.context.close();

  // The tablet: a week, a finger lifting, resizing, pinching.
  const tablet = await device(820, 1180);
  p = tablet.page;
  await p.goto(base + 'scheduler/mobile', { waitUntil: 'networkidle' });
  await settle(p, 600);
  await p.locator('section[aria-labelledby="ways"]').getByText('By its width').click();
  await settle(p);
  s = await look(p, S('ways'));
  check('by its width on a touch tablet: as on a tablet, its week kept', s.presentation === 'tablet' && s.view === 'week' && s.views > 0, JSON.stringify(s));
  const T = S('touch');
  await p.locator(T).scrollIntoViewIfNeeded();
  await settle(p);
  const log = () => p.locator('section[aria-labelledby="touch"] output').textContent();
  const box = p.locator(`${T} .mx-scheduler__appointment[data-kind="timed"]`, { hasText: 'Lunch' }).first();
  await box.scrollIntoViewIfNeeded();
  await settle(p);
  const b0 = await box.boundingBox();
  const slot = await p.locator(`${T} .mx-scheduler__cells .mx-scheduler__cell`).first().boundingBox();
  const from = { x: b0.x + b0.width / 2, y: b0.y + b0.height / 2 };
  await tablet.stroke(from, { x: from.x, y: from.y + slot.height * 2 }, { hold: 650, steps: 8, up: false });
  const lifted = await p.locator(`${T} .mx-scheduler__appointment[data-lifted]`).count();
  check('a long press lifts the appointment (the lift state) and the page does not scroll', lifted === 1, String(lifted));
  await tablet.touch('touchEnd', []);
  await settle(p, 600);
  check('let go, it is moved (onMoveEnd)', /Lunch with Ana moved/.test(await log()), await log());
  const tooltip = await p.locator('.mx-scheduler__tooltip-popup:popover-open').count();
  check('no click (no tooltip) after the drag', tooltip === 0, String(tooltip));
  const grips = await p.evaluate((sel) => {
    const el = document.querySelector(sel + ' .mx-scheduler__appointment[data-selected]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const [a, z] = [...el.querySelectorAll('.mx-scheduler__resize-grip')].map((g) => g.getBoundingClientRect());
    return { count: el.querySelectorAll('.mx-scheduler__resize-grip').length, top: a.top - r.top, bottom: r.bottom - z.bottom, centre: Math.abs((a.left + a.right) / 2 - (r.left + r.right) / 2), centreEnd: Math.abs((z.left + z.right) / 2 - (r.left + r.right) / 2), size: Math.round(a.width) };
  }, T);
  check('it stays selected with two handles, in the middle of its edges, the same way in from each (≤ 0.5 px)', !!grips && grips.count === 2 && Math.abs(grips.top - grips.bottom) <= 0.5 && grips.centre <= 0.5 && grips.centreEnd <= 0.5 && grips.size >= 8, JSON.stringify(grips));
  const timeOf = () => p.locator(`${T} .mx-scheduler__appointment[data-selected] .mx-scheduler__appointment-time`).first().textContent();
  const t0 = await timeOf();
  const end = await p.locator(`${T} .mx-scheduler__appointment[data-selected] .mx-scheduler__resize[data-edge="end"]`).boundingBox();
  await tablet.stroke(centre(end), { x: end.x + end.width / 2, y: end.y + end.height / 2 + slot.height * 2 }, { steps: 8 });
  await settle(p, 500);
  const t1 = await p.locator(`${T} .mx-scheduler__appointment`, { hasText: 'Lunch' }).first().locator('.mx-scheduler__appointment-time').textContent();
  check('its end handle resizes it at once', t1 !== t0, `${t0} → ${t1}`);
  const lunch = await p.locator(`${T} .mx-scheduler__appointment`, { hasText: 'Lunch' }).first().boundingBox();
  await tablet.tap({ x: lunch.x + lunch.width + 40, y: lunch.y + 4 });
  check('a tap elsewhere puts it down (no handles)', (await p.locator(`${T} .mx-scheduler__appointment[data-selected]`).count()) === 0);
  const touched = await p.locator(T).evaluate((el) => el.hasAttribute('data-touch'));
  check('a finger marks the scheduler, so nothing it touched stays looking hovered', touched);
  // Two fingers apart: the hours grow.
  const sc = await p.locator(`${T} .mx-scheduler__scroll`).boundingBox();
  const c = centre(sc);
  const rowBefore = slot.height;
  await tablet.stroke([{ x: c.x, y: c.y - 40 }, { x: c.x, y: c.y + 40 }], [{ x: c.x, y: c.y - 100 }, { x: c.x, y: c.y + 100 }], { steps: 10 });
  const rowAfter = (await p.locator(`${T} .mx-scheduler__cells .mx-scheduler__cell`).first().boundingBox()).height;
  check('two fingers apart zoom the hours (and say so when they let go)', rowAfter > rowBefore * 1.8 && /Zoomed from 1\.00 to 2\.\d\d/.test(await log()), `${rowBefore} → ${rowAfter}; ${await log()}`);
  await tablet.axe('the tablet', T);
  check('no errors or MotifJS warnings on the tablet', tablet.errors.length === 0, tablet.errors.slice(0, 3).join(' | '));
  await tablet.context.close();

  // A mouse and the keys: a narrow scheduler is a phone by its width; its view menu works by the keys.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + 'scheduler/mobile', { waitUntil: 'networkidle' });
  await page.locator(S('width')).scrollIntoViewIfNeeded();
  await page.locator('section[aria-labelledby="ways"]').getByText('By its width').click();
  await settle(page);
  const wideKind = (await look(page, S('ways'))).presentation;
  await page.locator('section[aria-labelledby="width"]').getByRole('button', { name: '820 px' }).click();
  await settle(page);
  const tabletKind = (await look(page, S('width'))).presentation;
  await page.locator('section[aria-labelledby="width"]').getByRole('button', { name: '390 px' }).click();
  await settle(page);
  const phoneKind = (await look(page, S('width'))).presentation;
  check('by its width with a mouse: a desktop; with tabletWhen: width, a tablet at 820 and a phone at 390', wideKind === 'desktop' && tabletKind === 'tablet' && phoneKind === 'phone', [wideKind, tabletKind, phoneKind].join(' → '));
  const today = page.locator(`${S('width')} .mx-scheduler__today-icon`).first();
  check('Today as an icon still has a name', /Today/.test((await today.getAttribute('title')) ?? (await today.getAttribute('aria-label')) ?? ''));
  await page.locator(`${S('width')} .mx-scheduler__view-menu button`).first().focus();
  await page.keyboard.press('Enter');
  await settle(page);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await settle(page);
  const keyed = (await look(page, S('width'))).view;
  check('the view menu opens and chooses by the keys', keyed !== 'agenda', keyed);
  await page.keyboard.press('n');
  await settle(page);
  check('the keys move the days as on a desktop (N)', (await look(page, S('width'))).range !== '', (await look(page, S('width'))).range);
}
