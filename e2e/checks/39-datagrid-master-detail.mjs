/** Real-browser checks of the datagrid's master-detail rows: opening by click and by keys, the nested grid loading its rows, the rows below moved by the details' height, Tab into the details and back, tabs that make the row grow, a long list with several open details scrolled at frame rate, and axe. */

export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/master-detail', { waitUntil: 'load' });
  const master = '.dg-master';
  // The grid's own body, not the body of a grid in its details.
  const own = (g) => `${g} > .mx-data-grid__main > .mx-data-grid__viewport > .mx-data-grid__body`;
  const rows = (g) => `${own(g)} > .mx-data-grid__row:not([hidden])`;
  const rowOf = (g, id) => page.locator(rows(g)).filter({ has: page.locator(`[data-field="id"]`, { hasText: new RegExp(`^${id}$`) }) });
  const detailRows = (g) => `${own(g)} > .mx-data-grid__detail-row:not([hidden])`;
  const box = (loc) => loc.evaluate((el) => el.getBoundingClientRect().toJSON());
  await page.locator(master).scrollIntoViewIfNeeded();
  await page.waitForSelector(rows(master));

  // A click on the arrow: the details open under the row, across the grid, with the customer's own orders.
  await rowOf(master, 1).locator('.mx-data-grid__expand-button').click();
  await page.waitForSelector(`${detailRows(master)} .dg-orders .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  const opened = await page.evaluate(
    ([g, d]) => {
      const detail = document.querySelector(d);
      const masterRow = [...document.querySelectorAll(`${g} > .mx-data-grid__row:not([hidden])`)].find((r) => r.querySelector('[data-field="id"]')?.textContent === '1');
      const button = masterRow.querySelector('.mx-data-grid__expand-button');
      const inner = detail.querySelector('.dg-orders');
      return {
        expanded: masterRow.hasAttribute('data-expanded'),
        button: button.getAttribute('aria-expanded'),
        controls: button.getAttribute('aria-controls') === detail.id,
        rowIndex: [masterRow.getAttribute('aria-rowindex'), detail.getAttribute('aria-rowindex')].join(),
        orders: inner.querySelectorAll('.mx-data-grid__body > .mx-data-grid__row:not([hidden])').length,
        count: inner.querySelector('.mx-data-grid__count')?.textContent,
      };
    },
    [own(master), detailRows(master)],
  );
  check(
    'datagrid master-detail: a click opens the details, the nested grid loads the customer’s orders',
    opened.expanded && opened.button === 'true' && opened.controls && opened.rowIndex === '2,3' && opened.orders === 3 && opened.count === '3 records',
    JSON.stringify(opened),
  );
  const masterBox = await box(rowOf(master, 1));
  const detailBox = await box(page.locator(detailRows(master)).first());
  const nextBox = await box(rowOf(master, 2));
  const vpWidth = await page.locator(`${master} > .mx-data-grid__main > .mx-data-grid__viewport`).evaluate((el) => el.clientWidth);
  check(
    'datagrid master-detail: the details sit under their row across the grid, the rows below move down by their height',
    Math.abs(detailBox.top - masterBox.bottom) < 2 && Math.abs(nextBox.top - detailBox.bottom) < 2 && detailBox.height > 150 && Math.abs(detailBox.width - vpWidth) < 2,
    `row ${masterBox.bottom}, details ${detailBox.top}–${detailBox.bottom} × ${detailBox.width} (${vpWidth}), next ${nextBox.top}`,
  );
  // Sideways the details stay where they are.
  await page.locator(`${master} > .mx-data-grid__main > .mx-data-grid__viewport`).evaluate((el) => (el.scrollLeft = 200));
  await page.waitForTimeout(100);
  const sideways = await box(page.locator(detailRows(master)).first());
  await page.locator(`${master} > .mx-data-grid__main > .mx-data-grid__viewport`).evaluate((el) => (el.scrollLeft = 0));
  check('datagrid master-detail: the details do not scroll sideways with the columns', Math.abs(sideways.left - detailBox.left) < 2, `${detailBox.left} → ${sideways.left}`);

  // Keys on the expand cell: Enter opens, Left closes, Right opens again.
  await rowOf(master, 2).locator('[data-field="mx:expand"]').click();
  await page.waitForFunction((g) => document.querySelectorAll(`${g} > .mx-data-grid__detail-row:not([hidden])`).length === 2, own(master));
  await page.keyboard.press('Enter');
  const afterEnter = await page.locator(detailRows(master)).count();
  await page.keyboard.press('Enter');
  await page.waitForFunction((g) => document.querySelectorAll(`${g} > .mx-data-grid__detail-row:not([hidden])`).length === 2, own(master));
  await page.keyboard.press('ArrowLeft');
  const afterLeft = await page.locator(detailRows(master)).count();
  await page.keyboard.press('ArrowRight');
  const afterRight = await page.locator(detailRows(master)).count();
  await page.keyboard.press('ArrowRight');
  const moved = await page.evaluate(() => document.activeElement?.dataset.field);
  check('datagrid master-detail: Enter, Left and Right on the expand cell open and close, Right then moves on', afterEnter === 1 && afterLeft === 1 && afterRight === 2 && moved === 'id', `${afterEnter} ${afterLeft} ${afterRight} ${moved}`);

  // Tab goes into the details of the row, Escape back to it; Shift+Tab from the first stop too.
  await page.keyboard.press('Tab');
  const inside = await page.evaluate(() => ({ grid: document.activeElement?.closest('.dg-orders')?.getAttribute('aria-label') ?? document.activeElement?.closest('.dg-orders .mx-data-grid')?.querySelector('[role=grid]')?.getAttribute('aria-label'), cell: document.activeElement?.className }));
  await page.keyboard.press('ArrowDown');
  const stillMaster = await page.evaluate((g) => document.querySelector(`${g} > .mx-data-grid__row[data-active] [data-field="id"]`)?.textContent, own(master));
  await page.keyboard.press('Escape');
  const back = await page.evaluate(() => ({ field: document.activeElement?.dataset.field, id: document.activeElement?.closest('.mx-data-grid__row')?.querySelector('[data-field="id"]')?.textContent }));
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  const backAgain = await page.evaluate(() => document.activeElement?.closest('.mx-data-grid__row')?.querySelector('[data-field="id"]')?.textContent);
  check(
    'datagrid master-detail: Tab goes into the row’s details, keys there stay theirs, Escape and Shift+Tab come back',
    /mx-data-grid__cell/.test(inside.cell ?? '') && stillMaster === '2' && back.field === 'id' && back.id === '2' && backAgain === '2',
    `${JSON.stringify(inside)} active ${stillMaster} back ${JSON.stringify(back)} ${backAgain}`,
  );

  // Tabs in the details: another tab makes the row grow, the rows below move with it.
  const tabs = '.dg-detail-tabs';
  await page.locator(tabs).scrollIntoViewIfNeeded();
  await page.waitForSelector(rows(tabs));
  await rowOf(tabs, 1).locator('.mx-data-grid__expand-button').click();
  await page.waitForSelector(`${detailRows(tabs)} .mx-form-layout, ${detailRows(tabs)} form`);
  const before = await box(rowOf(tabs, 2));
  await page.locator(`${detailRows(tabs)} [role="tab"]`, { hasText: 'Orders' }).click();
  await page.waitForSelector(`${detailRows(tabs)} .dg-detail-list`);
  await page.waitForTimeout(150);
  const tabsDetail = await box(page.locator(detailRows(tabs)).first());
  const after = await box(rowOf(tabs, 2));
  const noArrow = await rowOf(tabs, 7).locator('.mx-data-grid__expand-button').evaluate((el) => el.hidden);
  check(
    'datagrid master-detail: a tab made in the details resizes the row, the rows below follow; a row without details has no arrow',
    Math.abs(after.top - tabsDetail.bottom) < 2 && after.top !== before.top && noArrow,
    `next row ${before.top} → ${after.top}, details end ${tabsDetail.bottom}, no arrow ${noArrow}`,
  );
  await page.locator(`${detailRows(tabs)} button`, { hasText: 'Close' }).click();
  await page.waitForFunction((g) => !document.querySelector(`${g} > .mx-data-grid__detail-row:not([hidden])`), own(tabs));
  check('datagrid master-detail: ctx.collapse() closes the row from inside its details', (await page.locator('.dg-detail-log').textContent()) === 'Closed Ada Lovelace 1');

  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="master-detail"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid master-detail: axe clean with open details and a nested grid', axe.length === 0, axe.join('; '));

  // Several rows open: the scroll height grows by each one's height, and scrolling the long virtual
  // list keeps the frame rate with the DOM small.
  await page.locator(master).scrollIntoViewIfNeeded();
  const spacer = () => page.locator(own(master)).evaluate((el) => el.offsetHeight);
  let grown = 0;
  let added = 0;
  for (const id of [3, 5, 8, 12]) {
    const before = await spacer();
    const button = rowOf(master, id).locator('.mx-data-grid__expand-button');
    await button.click();
    await page.waitForFunction((b) => document.getElementById(b.getAttribute('aria-controls') ?? '')?.querySelector('.dg-orders .mx-data-grid__count')?.textContent, await button.elementHandle());
    await page.waitForTimeout(100);
    added += await page.evaluate((b) => document.getElementById(b.getAttribute('aria-controls')).offsetHeight, await button.elementHandle());
    grown += (await spacer()) - before;
  }
  check('datagrid master-detail: the scroll height grows by the height of each details opened', Math.abs(grown - added) < 4 && added > 600, `grew ${grown}, details ${added}`);
  const stats = await page.evaluate(
    (sel) =>
      new Promise((done) => {
        const el = document.querySelector(sel);
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
          if (now - start < 2500) requestAnimationFrame(step);
          else
            done({
              frames: times.length,
              long: times.filter((t) => t > 34).length,
              avg: times.reduce((a, b) => a + b, 0) / times.length,
              rows: el.querySelectorAll(':scope > .mx-data-grid__body > .mx-data-grid__row:not([hidden])').length,
              details: el.querySelectorAll(':scope > .mx-data-grid__body > .mx-data-grid__detail-row').length,
            });
        };
        requestAnimationFrame(step);
      }),
    `${master} > .mx-data-grid__main > .mx-data-grid__viewport`,
  );
  check(
    'datagrid master-detail: scrolling a long list with several open details keeps the frame rate, the DOM stays small',
    stats.long <= stats.frames * 0.1 && stats.rows < 40 && stats.details <= 6,
    `${Math.round(1000 / stats.avg)} fps, ${stats.long}/${stats.frames} frames over 34 ms, ${stats.rows} rows, ${stats.details} details`,
  );
  // A jump far down and back: the open rows are where they were.
  await page.locator(`${master} > .mx-data-grid__main > .mx-data-grid__viewport`).evaluate((el) => (el.scrollTop = el.scrollHeight));
  await page.waitForTimeout(300);
  await page.locator(`${master} > .mx-data-grid__main > .mx-data-grid__viewport`).evaluate((el) => (el.scrollTop = 0));
  await page.waitForTimeout(300);
  const top = await page.evaluate((g) => document.querySelectorAll(`${g} > .mx-data-grid__detail-row:not([hidden])`).length, own(master));
  check('datagrid master-detail: after a jump to the end and back the open details show again', top >= 2, `${top} details at the top`);
}
