/** Real-browser checks of the Drawer page: over the page, every edge of a frame, push, a finger from the edge and back, Escape, the scrim, the back button, focus, axe. */
export default async function ({ page, base, check, axeSource }) {
  const section = (anchor) => page.locator(`section[aria-labelledby="${anchor}"]`);
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
  const settle = () => page.waitForTimeout(450);
  const panelBox = (sel) => page.evaluate((s) => document.querySelector(s + ' .mx-drawer__panel')?.getBoundingClientRect().toJSON() ?? null, sel);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + 'drawer', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Over the page from the start edge.
  const ways = section('ways');
  await ways.scrollIntoViewIfNeeded();
  await ways.getByRole('button', { name: 'Menu' }).click();
  await settle();
  const page1 = await page.evaluate(() => {
    const d = [...document.querySelectorAll('.mx-drawer[data-open]')].find((e) => !e.hasAttribute('data-contained'));
    const p = d?.querySelector('[role="dialog"]')?.getBoundingClientRect();
    return { top: !!d?.matches(':popover-open'), left: Math.round(p?.left ?? -1), height: Math.round(p?.height ?? 0), modal: d?.querySelector('[role="dialog"]').getAttribute('aria-modal'), focus: !!document.activeElement?.closest('.mx-drawer__panel') };
  });
  check('a drawer over the page comes in at the start edge, full height, modal, focus inside', page1.top && page1.left === 0 && page1.height === 900 && page1.modal === 'true' && page1.focus, JSON.stringify(page1));
  await axe('a drawer open over the page');
  await page.keyboard.press('Escape');
  await settle();
  check('Escape closes it, focus back on Menu', await page.evaluate(() => !document.querySelector('.mx-drawer[data-open]') && document.activeElement?.textContent === 'Menu'));
  await ways.getByRole('button', { name: 'Menu' }).click();
  await settle();
  await page.mouse.click(1200, 450);
  await settle();
  check('a press on the scrim closes it', await page.evaluate(() => !document.querySelector('.mx-drawer[data-open]')));
  await ways.getByRole('button', { name: 'Menu' }).click();
  await settle();
  await page.goBack();
  await settle();
  check("the browser's back closes it and stays on the page", await page.evaluate(() => location.pathname.endsWith('/drawer') && !document.querySelector('.mx-drawer[data-open]')));
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await ways.getByRole('button', { name: 'Menu' }).click();
  await settle();
  const rtl = await page.evaluate(() => document.querySelector('.mx-drawer[data-open] .mx-drawer__panel').getBoundingClientRect().right);
  check('right to left, the start edge is the right one', Math.round(rtl) === 1280, String(rtl));
  await page.keyboard.press('Escape');
  await settle();
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));

  // Over a frame, every edge, and push.
  const options = section('options');
  const frameSel = 'section[aria-labelledby="options"] .mx-drawer';
  const frame = options.locator('[style*="28rem"]');
  await frame.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const f = await frame.boundingBox();
  const edges = {};
  for (const [label, name] of [['start', 'Start'], ['end', 'End'], ['top', 'Top'], ['bottom', 'Bottom']]) {
    await options.getByText(name, { exact: true }).click();
    await options.getByRole('button', { name: 'Open' }).dispatchEvent('click');
    await settle();
    const b = await panelBox(frameSel);
    edges[label] = b && { l: Math.round(b.left - f.x), t: Math.round(b.top - f.y), r: Math.round(f.x + f.width - b.right), b: Math.round(f.y + f.height - b.bottom), w: Math.round(b.width), h: Math.round(b.height) };
    await page.keyboard.press('Escape');
    await settle();
  }
  const touches = (e, side) => e && e[side] <= 1;
  check(
    'in a frame it comes in at each edge, against it',
    touches(edges.start, 'l') && touches(edges.end, 'r') && touches(edges.top, 't') && touches(edges.bottom, 'b') && edges.top.h < 260 && edges.start.w < 400,
    JSON.stringify(edges),
  );
  await options.getByText('Start', { exact: true }).click();
  await options.getByText('Push', { exact: true }).click();
  await options.getByRole('switch', { name: 'Modal' }).click();
  await options.getByRole('button', { name: 'Open' }).dispatchEvent('click');
  await settle();
  const pushed = await page.evaluate((sel) => {
    const d = document.querySelector(sel);
    const content = document.querySelector('[data-mx-drawer-push]');
    return { modal: d.querySelector('[role="dialog"]').getAttribute('aria-modal'), push: content?.style.getPropertyValue('--_mx-push'), shift: Math.round(content?.getBoundingClientRect().left ?? 0) - Math.round(d.getBoundingClientRect().left) };
  }, frameSel);
  check('push moves the content aside by the drawer, not modal', pushed.modal === null && pushed.shift > 200, JSON.stringify(pushed));
  await page.locator(frameSel + ' .mx-drawer__close').first().dispatchEvent('click');
  await settle();
  check('…and back when it closes', await page.evaluate(() => !document.querySelector('[data-mx-drawer-push]')));
  await options.getByText('Over', { exact: true }).click();
  await options.getByRole('switch', { name: 'Modal' }).click();

  // A finger from the frame's edge, and back.
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p.x, y: p.y }] : [] });
  const stroke = async (from, to, steps, ms, up = true) => {
    await touch('touchStart', from);
    for (let i = 1; i <= steps; i++) {
      await touch('touchMove', { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps });
      if (ms) await page.waitForTimeout(ms);
    }
    if (up) await touch('touchEnd');
  };
  const y = f.y + f.height / 2;
  await stroke({ x: f.x + 6, y }, { x: f.x + 120, y }, 8, 30, false);
  const half = await panelBox(frameSel);
  await touch('touchEnd');
  await settle();
  const back = await page.evaluate((sel) => document.querySelector(sel).hasAttribute('data-open'), frameSel);
  check('a finger from the edge brings it in with it, and let go early it goes back', half && half.right - f.x > 80 && half.right - f.x < 160 && !back, JSON.stringify(half));
  await stroke({ x: f.x + 6, y }, { x: f.x + 260, y }, 12, 30);
  await settle();
  let b = await panelBox(frameSel);
  check('…and far enough, it stays open', await page.evaluate((sel) => document.querySelector(sel).hasAttribute('data-open'), frameSel) && Math.abs(b.left - f.x) <= 2, JSON.stringify([b, f]));
  await stroke({ x: b.right - 20, y }, { x: b.right - 200, y }, 4, 0);
  await settle();
  check('a quick swipe back towards its edge closes it', await page.evaluate((sel) => !document.querySelector(sel).hasAttribute('data-open'), frameSel));
  await options.getByRole('switch', { name: 'Swipe in from the edge' }).click();
  // Off, nothing takes the swipe (a real one would be the browser's own back gesture here): touch events made in the page.
  const taken = await page.evaluate((frameX) => {
    const frame = document.querySelector('section[aria-labelledby="options"] [style*="28rem"]');
    const send = (type, x) => {
      const t = new Touch({ identifier: 9, target: frame, clientX: x, clientY: 300 });
      const e = new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [t], changedTouches: [t] });
      frame.dispatchEvent(e);
      return e.defaultPrevented;
    };
    send('touchstart', frameX + 6);
    const moved = [send('touchmove', frameX + 40), send('touchmove', frameX + 200)];
    send('touchend', frameX + 200);
    return moved.some(Boolean);
  }, f.x);
  check('with edgeSwipe off a swipe from the edge is left alone', !taken && (await page.evaluate((sel) => !document.querySelector(sel).hasAttribute('data-open'), frameSel)));

  // Events.
  const events = section('events');
  await events.scrollIntoViewIfNeeded();
  await events.getByRole('button', { name: 'Open' }).click();
  await settle();
  await events.getByRole('switch', { name: 'Keep it open' }).dispatchEvent('click');
  await page.locator('.mx-drawer[data-open] .mx-drawer__panel').focus();
  await page.keyboard.press('Escape');
  await settle();
  check('onClosing can keep it open', await page.evaluate(() => !!document.querySelector('.mx-drawer[data-open][data-side="end"]')));
  await page.locator('.mx-drawer[data-open]').getByRole('button', { name: 'Close by code' }).click();
  await settle();
  const log = await events.locator('output').textContent();
  check('the events come in order', /opening · opened/.test(log) && /closing \(escape\)/.test(log) && /closed \(code\)/.test(log), log);
}
