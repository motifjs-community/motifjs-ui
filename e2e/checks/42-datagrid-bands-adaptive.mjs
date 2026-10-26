/** Real-browser checks of the datagrid's band headers and adaptive columns: bands over their columns, moving a column inside its band and not out of it, resizing a column under a band, axe with bands; narrowing the grid hides the low-priority columns, the "…" opens their values, widening shows them again. */

export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/bands', { waitUntil: 'load' });
  const bands = '.dg-bands';
  const head = `${bands} .mx-data-grid__head`;
  const bandCell = (id) => page.locator(`${head} [data-band="${id}"]`);
  const header = (field) => page.locator(`${head} .mx-data-grid__row--header:not(.mx-data-grid__row--band) [data-field="${field}"]`);
  const box = (loc) => loc.evaluate((el) => el.getBoundingClientRect().toJSON());
  const order = () => page.evaluate((h) => [...document.querySelectorAll(`${h} .mx-data-grid__row--header:not(.mx-data-grid__row--band) > [role="columnheader"]`)].filter((el) => el.offsetWidth > 0).map((el) => el.dataset.field), head);
  await page.locator(bands).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${bands} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);

  // Each band spans its columns exactly; the header rows are numbered from the top.
  const spans = await page.evaluate((h) => {
    const rect = (el) => el.getBoundingClientRect();
    const cell = (f) => document.querySelector(`${h} .mx-data-grid__row--header:not(.mx-data-grid__row--band) [data-field="${f}"]`);
    const span = (id, first, last) => {
      const b = rect(document.querySelector(`${h} [data-band="${id}"]`));
      return Math.abs(b.left - rect(cell(first)).left) < 1.5 && Math.abs(b.right - rect(cell(last)).right) < 1.5;
    };
    const rows = [...document.querySelectorAll(`${h} [role="row"]:not([hidden])`)].map((r) => r.getAttribute('aria-rowindex'));
    return { order: span('order', 'customer', 'note'), delivery: span('delivery', 'city', 'note'), payment: span('payment', 'status', 'amount'), rows: rows.join(), colspan: document.querySelector(`${h} [data-band="order"]`).getAttribute('aria-colspan') };
  }, head);
  check('datagrid bands: each band header spans exactly its columns, a row per level over the titles', spans.order && spans.delivery && spans.payment && spans.rows === '1,2,3' && spans.colspan === '4', JSON.stringify(spans));

  // Drag a column inside its band: it moves; past its band's edge it stops at the edge.
  const drag = async (from, to, dx = 0) => {
    const a = await box(from);
    const b = await box(to);
    await page.mouse.move(a.left + a.width / 2, a.top + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(a.left + a.width / 2 + 12, a.top + a.height / 2, { steps: 3 });
    await page.mouse.move(b.left + b.width / 2 + dx, b.top + b.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(150);
  };
  await drag(header('customer'), header('date'), 10);
  const inside = await order();
  await drag(header('date'), header('amount'), 40);
  const outside = await order();
  check(
    'datagrid bands: a column moves inside its band, and not out of it',
    inside.join() === 'id,date,customer,city,note,status,paid,amount' && outside.indexOf('date') === 4 && outside.slice(5).join() === 'status,paid,amount',
    `${inside.join()} | ${outside.join()}`,
  );

  // Drag a band among its neighbours (scrolled so that the middle of the band before it shows): its columns go with it.
  const viewport = page.locator(`${bands} .mx-data-grid__viewport`);
  const vpBox = await box(viewport);
  const orderBox = await box(bandCell('order'));
  await viewport.evaluate((el, x) => (el.scrollLeft = x), Math.max(0, (orderBox.left + orderBox.right) / 2 - vpBox.left - 30));
  await page.waitForTimeout(100);
  const from = await box(bandCell('payment'));
  const before = await box(bandCell('order'));
  const grab = Math.min(from.left + 30, vpBox.right - 10);
  await page.mouse.move(grab, from.top + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(grab - 12, from.top + from.height / 2, { steps: 3 });
  await page.mouse.move((before.left + before.right) / 2 - 10, from.top + from.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  await viewport.evaluate((el) => (el.scrollLeft = 0));
  const moved = await order();
  check('datagrid bands: a band moves with all its columns', moved.join() === 'id,status,paid,amount,customer,city,note,date', moved.join());

  // Resize a column under a band: the band grows with it.
  await header('city').locator('.mx-data-grid__resize').scrollIntoViewIfNeeded();
  const band0 = await box(bandCell('delivery'));
  const city = await box(header('city'));
  const handle = header('city').locator('.mx-data-grid__resize');
  const h = await box(handle);
  await page.mouse.move(h.left + h.width / 2, h.top + h.height / 2);
  await page.mouse.down();
  await page.mouse.move(h.left + h.width / 2 + 60, h.top + h.height / 2, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  const after = await box(bandCell('delivery'));
  const cityAfter = await box(header('city'));
  check('datagrid bands: resizing a column under a band widens it and its band', Math.abs(cityAfter.width - city.width - 60) < 3 && Math.abs(after.width - band0.width - 60) < 3, `city ${city.width} → ${cityAfter.width}, band ${band0.width} → ${after.width}`);

  // Pinned: the band stays at the start while the rows scroll sideways.
  await page.getByRole('button', { name: 'Pin “Order”' }).click();
  await page.waitForTimeout(100);
  const vp = page.locator(`${bands} .mx-data-grid__viewport`);
  const pinned = await box(bandCell('order'));
  await vp.evaluate((el) => (el.scrollLeft = 300));
  await page.waitForTimeout(100);
  const pinnedAfter = await box(bandCell('order'));
  await vp.evaluate((el) => (el.scrollLeft = 0));
  await page.getByRole('button', { name: 'Pin “Order”' }).click();
  check('datagrid bands: a pinned band stays in place while the columns scroll sideways', Math.abs(pinned.left - pinnedAfter.left) < 1.5, `${pinned.left} → ${pinnedAfter.left}`);

  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="bands"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid bands: axe clean with band headers', axe.length === 0, axe.join('; '));

  // Adaptive columns: a narrow grid hides the lowest priorities first, the "…" opens their values.
  const ad = '.dg-adaptive';
  const shown = () => page.evaluate((g) => [...document.querySelectorAll(`${g} .mx-data-grid__row--header > [role="columnheader"]`)].filter((el) => el.offsetWidth > 0).map((el) => el.dataset.field), ad);
  await page.locator(ad).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${ad} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  // By priority: note, amount, date, city, status; the number and the customer never hide.
  const hidden = async () => ((await page.locator('.dg-adaptive-hidden').textContent()) ?? '').replace('hidden: ', '').split(', ').filter((f) => f && f !== 'none');
  const byPriority = ['note', 'amount', 'date', 'city', 'status'];
  const inOrder = (list) => list.length <= byPriority.length && [...list].sort((a, b) => byPriority.indexOf(a) - byPriority.indexOf(b)).every((f, i) => f === byPriority[i]);
  await page.getByRole('button', { name: 'Wide', exact: true }).click();
  await page.waitForTimeout(250);
  const wide = await shown();
  const wideHidden = await hidden();
  await page.getByRole('button', { name: 'Narrow', exact: true }).click();
  await page.waitForTimeout(250);
  const narrow = await shown();
  const narrowHidden = await hidden();
  check(
    'datagrid adaptive: narrowing the grid hides the low-priority columns first and adds the "…" column',
    narrowHidden.length > wideHidden.length && inOrder(wideHidden) && inOrder(narrowHidden) && narrow.includes('mx:adaptive') && narrowHidden.every((f) => !narrow.includes(f)) && narrow.includes('customer') && narrow.includes('id'),
    `${wide.join()} [${wideHidden}] → ${narrow.join()} [${narrowHidden}]`,
  );
  const rowOf = (id) => page.locator(`${ad} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`).filter({ has: page.locator('[data-field="id"]', { hasText: new RegExp(`^${id}$`) }) });
  await rowOf(2).locator('.mx-data-grid__adaptive-button').click();
  await page.waitForSelector(`${ad} .mx-data-grid__adaptive-row:not([hidden]) .mx-data-grid__form-field, ${ad} .mx-data-grid__adaptive-row:not([hidden]) .mx-data-grid__adaptive-item`);
  const detail = await page.evaluate((g) => {
    const d = document.querySelector(`${g} .mx-data-grid__adaptive-row:not([hidden])`);
    const r = [...document.querySelectorAll(`${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`)].find((el) => el.querySelector('[data-field="id"]')?.textContent === '2');
    const next = [...document.querySelectorAll(`${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`)].find((el) => el.querySelector('[data-field="id"]')?.textContent === '3');
    const labels = [...d.querySelectorAll('label, .mx-data-grid__adaptive-label')].map((l) => l.textContent.trim()).filter(Boolean);
    const values = [...d.querySelectorAll('input')].map((i) => i.value);
    return { labels, values, under: Math.abs(d.getBoundingClientRect().top - r.getBoundingClientRect().bottom) < 2, next: Math.abs(next.getBoundingClientRect().top - d.getBoundingClientRect().bottom) < 2, expanded: r.querySelector('.mx-data-grid__adaptive-button').getAttribute('aria-expanded') };
  }, ad);
  check(
    'datagrid adaptive: the "…" opens a detail under the row with the hidden columns\' titles and values; the rows below move down',
    detail.labels.some((l) => l.startsWith('Note')) && detail.labels.some((l) => l.startsWith('Date')) && detail.under && detail.next && detail.expanded === 'true',
    JSON.stringify(detail),
  );
  await page.getByRole('button', { name: 'Wide', exact: true }).click();
  await page.waitForTimeout(300);
  const again = await shown();
  const againHidden = await hidden();
  const closed = await page.locator(`${ad} .mx-data-grid__adaptive-row:not([hidden])`).count();
  const back = narrowHidden.filter((f) => !againHidden.includes(f));
  check(
    'datagrid adaptive: widening the grid shows the columns again, and closes the detail once nothing is hidden',
    back.length > 0 && back.every((f) => again.includes(f)) && (againHidden.length > 0 || (closed === 0 && !again.includes('mx:adaptive'))),
    `${again.join()} [${againHidden}] (${closed} open)`,
  );
  await page.getByRole('button', { name: 'Narrow', exact: true }).click();
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: 'Open row 3' }).click();
  await page.waitForTimeout(150);
  const axe2 = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="adaptive"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid adaptive: axe clean with hidden columns and an open detail', axe2.length === 0, axe2.join('; '));

  // Scrolling under band headers, and with columns hidden and a detail open, keeps the frame rate.
  const scroll = (sel) =>
    page.evaluate(
      (s) =>
        new Promise((done) => {
          const el = document.querySelector(s);
          const times = [];
          let last = performance.now();
          const start = last;
          let down = true;
          const step = () => {
            const now = performance.now();
            times.push(now - last);
            last = now;
            if (el.scrollTop > 2400) down = false;
            if (el.scrollTop <= 0) down = true;
            el.scrollTop += down ? 120 : -120;
            if (now - start < 2000) requestAnimationFrame(step);
            else done({ frames: times.length, long: times.filter((t) => t > 34).length, avg: times.reduce((a, b) => a + b, 0) / times.length, rows: el.querySelectorAll(':scope > .mx-data-grid__body > .mx-data-grid__row:not([hidden])').length });
          };
          requestAnimationFrame(step);
        }),
      sel,
    );
  const fps = [];
  for (const g of [bands, ad]) {
    await page.locator(g).scrollIntoViewIfNeeded();
    fps.push(await scroll(`${g} .mx-data-grid__viewport`));
  }
  check(
    'datagrid bands and adaptive: scrolling keeps the frame rate, the DOM stays small',
    fps.every((s) => s.long <= s.frames * 0.1 && s.rows < 40),
    fps.map((s) => `${Math.round(1000 / s.avg)} fps, ${s.long}/${s.frames} frames over 34 ms, ${s.rows} rows`).join(' | '),
  );
}
