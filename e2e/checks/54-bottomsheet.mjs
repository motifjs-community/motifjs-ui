/** Real-browser checks of the BottomSheet page: opening and closing every way, the detents by mouse, keys and touch, the content taking the sheet along, the back button, focus, inert, axe. */
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
  const sheetIn = (anchor) => `section[aria-labelledby="${anchor}"] .mx-bottom-sheet`;
  const state = (sel) =>
    page.evaluate((s) => {
      const el = document.querySelector(s);
      const panel = el?.querySelector('.mx-bottom-sheet__panel');
      const handle = el?.querySelector('.mx-bottom-sheet__handle');
      return {
        open: !!el?.hasAttribute('data-open'),
        height: Math.round(panel?.getBoundingClientRect().height ?? 0),
        detent: handle?.getAttribute('aria-valuetext') ?? '',
        value: handle?.getAttribute('aria-valuenow') ?? '',
        scroll: Math.round(el?.querySelector('.mx-bottom-sheet__body')?.scrollTop ?? 0),
      };
    }, sel);
  const settle = () => page.waitForTimeout(450);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + 'bottomsheet', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Over the page, from JSX: a modal dialog with focus inside, the rest inert, Escape gives focus back.
  const ways = section('ways');
  await ways.scrollIntoViewIfNeeded();
  const edit = ways.getByRole('button', { name: 'Edit the name' });
  await edit.click();
  await settle();
  const opened = await page.evaluate(() => {
    const layer = [...document.querySelectorAll('.mx-bottom-sheet')].find((s) => s.hasAttribute('data-open') && !s.hasAttribute('data-contained'));
    const panel = layer?.querySelector('[role="dialog"]');
    return {
      top: !!layer?.matches(':popover-open'),
      name: panel ? document.getElementById(panel.getAttribute('aria-labelledby'))?.textContent : null,
      modal: panel?.getAttribute('aria-modal'),
      focus: !!document.activeElement?.closest('.mx-bottom-sheet__panel') && document.activeElement.localName === 'input',
      inert: !!document.querySelector('.docs-layout, main, header')?.closest('[inert]'),
      back: history.state?.mxBack ?? 0,
    };
  });
  check('a sheet over the page opens in the top layer as a modal dialog named by its title', opened.top && opened.name === 'Your name' && opened.modal === 'true', JSON.stringify(opened));
  check('…with focus on its field, the page around it inert, one history entry held', opened.focus && opened.inert && opened.back >= 1, JSON.stringify(opened));
  await axe('a modal sheet open over the page');
  await page.keyboard.press('Escape');
  await settle();
  check('Escape closes it and gives focus back to its button', await page.evaluate(() => !document.querySelector('.mx-bottom-sheet[data-open]:not([data-contained])') && document.activeElement?.textContent === 'Edit the name' && !document.querySelector('[inert]')));
  // The browser's back closes it, and the page stays.
  await edit.click();
  await settle();
  const path = await page.evaluate(() => location.pathname);
  await page.goBack();
  await settle();
  check("the browser's back closes it and stays on the page", await page.evaluate((p) => location.pathname === p && !document.querySelector('.mx-bottom-sheet[data-open]:not([data-contained])'), path));
  // The one made in code: show() into the page, disposed when it closes.
  await ways.getByRole('button', { name: 'Share (programmatically)' }).click();
  await settle();
  const fit = await page.evaluate(() => {
    const panel = [...document.querySelectorAll('.mx-bottom-sheet[data-open] .mx-bottom-sheet__panel')].find((p) => p.textContent.includes('Anyone with the link'));
    const body = panel?.querySelector('.mx-bottom-sheet__body');
    return { height: Math.round(panel?.getBoundingClientRect().height ?? 0), fits: body ? body.scrollHeight <= body.clientHeight + 1 : false };
  });
  check("a 'fit' sheet is as tall as its content", fit.height > 100 && fit.height < 400 && fit.fits, JSON.stringify(fit));
  await page.getByRole('button', { name: 'Copy the link' }).click();
  await settle();
  check('…and it is gone from the page once closed', await page.evaluate(() => ![...document.querySelectorAll('.mx-bottom-sheet')].some((s) => s.textContent.includes('Anyone with the link'))), await ways.locator('output').textContent());

  // Over a frame, non-modal, at a peek: the mouse, the keys and a finger move it between heights.
  const detents = section('detents');
  const inFrame = sheetIn('detents') + '[data-contained]';
  await detents.locator('[style*="28rem"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  let s = await state(inFrame);
  check('the frame sheet starts open at its peek, not modal', s.open && s.detent === 'Small' && s.height > 60 && s.height < 140 && !(await page.evaluate(() => document.querySelector('[inert]'))), JSON.stringify(s));
  const handle = page.locator(inFrame + ' .mx-bottom-sheet__handle');
  let box = await handle.boundingBox();
  const mid = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(mid.x, mid.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(mid.x, mid.y - i * 18);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(200);
  await page.mouse.up();
  await settle();
  s = await state(inFrame);
  check('a slow drag of the handle by the mouse snaps to the nearest height (half)', s.detent === 'Half height', JSON.stringify(s));
  await handle.focus();
  await page.keyboard.press('ArrowUp');
  await settle();
  s = await state(inFrame);
  check('Up on the handle goes to full, a slider at 100', s.detent === 'Full height' && s.value === '100' && (await handle.getAttribute('role')) === 'slider', JSON.stringify(s));
  await page.keyboard.press('Home');
  await settle();
  check('Home goes to the lowest', (await state(inFrame)).detent === 'Small');
  const checked = await detents.evaluate((el) => [...el.querySelectorAll('[role="radio"], input[type="radio"]')].filter((r) => r.checked || r.getAttribute('aria-checked') === 'true').map((r) => r.closest('label')?.textContent ?? r.getAttribute('aria-label') ?? r.textContent));
  check('the height the user moved it to is written back to the state (the radio buttons show it)', checked.length === 1 && /Peek/.test(checked[0]), JSON.stringify(checked));

  // A finger: a flick up on the handle goes on, the content scrolls, from its top a drag takes the sheet down.
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p.x, y: p.y }] : [] });
  const stroke = async (from, to, steps, ms) => {
    await touch('touchStart', from);
    for (let i = 1; i <= steps; i++) {
      await touch('touchMove', { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps });
      if (ms) await page.waitForTimeout(ms);
    }
    await touch('touchEnd');
    await settle();
  };
  box = await handle.boundingBox();
  await stroke({ x: box.x + box.width / 2, y: box.y + 8 }, { x: box.x + box.width / 2, y: box.y - 50 }, 4, 0);
  s = await state(inFrame);
  check('a quick flick of a finger on the handle goes on to the next height', s.detent === 'Half height', JSON.stringify(s));
  await handle.focus();
  await page.keyboard.press('End');
  await settle();
  const bodyBox = await page.locator(inFrame + ' .mx-bottom-sheet__body').boundingBox();
  const at = { x: bodyBox.x + bodyBox.width / 2, y: bodyBox.y + bodyBox.height * 0.75 };
  await stroke(at, { x: at.x, y: at.y - 160 }, 10, 16);
  s = await state(inFrame);
  check('at full height a finger swiping up on the content scrolls it, the sheet stays', s.scroll > 40 && s.detent === 'Full height', JSON.stringify(s));
  await stroke({ x: at.x, y: at.y - 160 }, at, 10, 16);
  await page.evaluate((sel) => (document.querySelector(sel + ' .mx-bottom-sheet__body').scrollTop = 0), inFrame);
  await stroke({ x: at.x, y: bodyBox.y + 40 }, { x: at.x, y: bodyBox.y + 220 }, 12, 30);
  s = await state(inFrame);
  check('from the top of the content, a finger dragging down takes the sheet down', s.detent !== 'Full height' && s.open, JSON.stringify(s));
  box = await handle.boundingBox();
  await stroke({ x: box.x + box.width / 2, y: box.y + 8 }, { x: box.x + box.width / 2, y: box.y + 360 }, 12, 20);
  s = await state(inFrame);
  check('dragged far down past its lowest height, it closes', !s.open, JSON.stringify(s));
  check('…and the Open button is back', await detents.getByRole('button', { name: 'Open' }).isEnabled());
  await detents.getByRole('button', { name: 'Open' }).click();
  await settle();
  // Every behaviour is live: off, the handle drags nothing and swipes do not close.
  const before = await state(inFrame);
  await detents.getByText('Draggable', { exact: true }).click();
  await detents.getByText('Swipe down closes', { exact: true }).click();
  box = await handle.boundingBox();
  await stroke({ x: box.x + box.width / 2, y: box.y + 8 }, { x: box.x + box.width / 2, y: box.y - 200 }, 8, 20);
  s = await state(inFrame);
  check('with draggable off a finger on the handle moves nothing', s.open && s.detent === before.detent && s.height === before.height, JSON.stringify([before, s]));
  await detents.getByText('Draggable', { exact: true }).click();
  await detents.getByText('Handle', { exact: true }).click();
  check('the handle can be turned off', await page.evaluate((sel) => document.querySelector(sel + ' .mx-bottom-sheet__handle').hidden, inFrame));
  await axe('the frame sheet open');

  // Events, in order, and a refusal.
  const events = section('events');
  await events.scrollIntoViewIfNeeded();
  await events.getByRole('button', { name: 'Open' }).click();
  await settle();
  const keep = events.getByRole('switch', { name: 'Keep it open' });
  await keep.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await keep.click();
  // Modal inside its frame: the switch outside it took focus; back into the sheet, then Escape.
  await page.locator(sheetIn('events') + ' .mx-bottom-sheet__handle').focus();
  await page.keyboard.press('Escape');
  await settle();
  check('onClosing can keep it open', await page.evaluate(() => !!document.querySelector('section[aria-labelledby="events"] .mx-bottom-sheet[data-open]')));
  // A click programmatically: the frame clips the sheet, and scrolling it into view would scroll the frame.
  await events.getByRole('button', { name: 'Close by code' }).dispatchEvent('click');
  await settle();
  const log = await events.locator('output').textContent();
  check('the events come in order, with their reasons', /opening · opened/.test(log) && /closing \(escape\)/.test(log) && /closing \(code\) · closed \(code\)/.test(log), log);
}
