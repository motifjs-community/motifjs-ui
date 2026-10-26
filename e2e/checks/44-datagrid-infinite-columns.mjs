/** Real-browser checks of the datagrid's infinite mode and virtual columns: parts loading as the list nears its end over a slow server without a count, the mark and Retry, the end found from a short part, Ctrl+End; 200 columns × 100,000 rows with only the columns in view drawn, sideways and down at a measured frame rate, before (every column drawn) and after, keyboard into a column without cells, axe. */

export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/scrolling', { waitUntil: 'load' });
  const inf = '.dg-infinite';
  const vp = page.locator(`${inf} .mx-data-grid__viewport`);
  const count = () => page.locator(`${inf} .mx-data-grid__count`).textContent();
  const mark = () => page.evaluate((g) => {
    const m = document.querySelector(`${g} .mx-data-grid__load-more`);
    return m && getComputedStyle(m).display !== 'none' ? { state: m.dataset.state, text: m.textContent.trim() } : null;
  }, inf);
  const toEnd = () => vp.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await page.locator(inf).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${inf} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__count`)?.textContent === '50 records loaded', inf);

  // Near the end the next part loads, with the mark over the last rows; the scroll bar grows with it.
  const before = await vp.evaluate((el) => el.scrollHeight);
  await toEnd();
  await page.waitForTimeout(100);
  const loading = await mark();
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__count`)?.textContent === '100 records loaded', inf);
  const after = await vp.evaluate((el) => el.scrollHeight);
  check(
    'datagrid infinite: scrolling to the end loads the next part, with "Loading more rows…" while it comes, and the scroll bar grows',
    loading?.state === 'loading' && loading.text === 'Loading more rows…' && after > before + 40 * 36 && (await mark()) === null,
    `${JSON.stringify(loading)}, ${before} → ${after} px`,
  );

  // A part that fails offers Retry; scrolling does not ask for it again, Retry does.
  await page.getByRole('checkbox', { name: 'The next part fails' }).click();
  await toEnd();
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__load-more`)?.dataset.state === 'failed', inf);
  const failed = await mark();
  const loads = await page.locator('.dg-infinite-state').textContent();
  await toEnd();
  await page.waitForTimeout(800);
  const still = await page.locator('.dg-infinite-state').textContent();
  await page.getByRole('checkbox', { name: 'The next part fails' }).click();
  await page.locator(`${inf} .mx-data-grid__load-more`).getByRole('button', { name: 'Retry' }).click();
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__count`)?.textContent === '150 records loaded', inf);
  check(
    'datagrid infinite: a failed part shows Retry, is not asked for again by scrolling, and loads on Retry',
    failed?.state === 'failed' && failed.text.startsWith('Could not load more rows.') && loads === still && (await mark()) === null,
    `${JSON.stringify(failed)}, ${loads} | ${still}`,
  );

  // Ctrl+End: the last row shown, and the next part.
  await page.locator(`${inf} .mx-data-grid__body [data-field="customer"]`).first().click();
  await page.keyboard.press('Control+End');
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__count`)?.textContent === '200 records loaded', inf);
  const focused = await page.evaluate(() => document.activeElement?.closest('.mx-data-grid__row')?.querySelector('[data-field="id"]')?.textContent);
  check('datagrid infinite: Ctrl+End goes to the last row shown and loads the next part', focused === '150', `focused row ${focused}, ${await count()}`);

  // On to the end: the server cannot count, the short last part ends the rows.
  for (let i = 0; i < 30 && (await count()) !== '1,030 records'; i++) {
    const was = await count();
    await toEnd();
    await page.waitForFunction(([g, c]) => document.querySelector(`${g} .mx-data-grid__count`)?.textContent !== c, [inf, was], { timeout: 4000 }).catch(() => {});
  }
  const end = await page.locator('.dg-infinite-state').textContent();
  await toEnd();
  await page.waitForTimeout(800);
  const endAgain = await page.locator('.dg-infinite-state').textContent();
  const rowcount = await vp.getAttribute('aria-rowcount');
  const domRows = await vp.evaluate((el) => el.querySelectorAll('.mx-data-grid__body > .mx-data-grid__row').length);
  check(
    'datagrid infinite: the end is reached from a short part; nothing more is asked for, aria-rowcount is known, the rows stay pooled',
    (await count()) === '1,030 records' && end.includes('every row is here') && end === endAgain && rowcount === '1032' && domRows < 40,
    `${await count()}, ${end} | ${endAgain}, aria-rowcount ${rowcount}, ${domRows} row elements`,
  );

  // A sort starts again from the first part, at the top.
  await page.locator(`${inf} .mx-data-grid__row--header [data-field="customer"] .mx-data-grid__title`).click();
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__count`)?.textContent === '50 records loaded', inf);
  check('datagrid infinite: sorting starts again from the first part', (await vp.evaluate((el) => el.scrollTop)) === 0, await count());

  // The grouped example in memory: parts of group rows and rows; the second city shows once its part does.
  const groups = '.dg-infinite-groups';
  await page.locator(groups).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${groups} .mx-data-grid__body > .mx-data-grid__group-row:not([hidden])`);
  const groupVp = page.locator(`${groups} .mx-data-grid__viewport`);
  const height0 = await groupVp.evaluate((el) => el.scrollHeight);
  await groupVp.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await page.waitForTimeout(200);
  const height1 = await groupVp.evaluate((el) => el.scrollHeight);
  check('datagrid infinite: grouped rows in memory show part by part', height1 > height0 && height0 < 110 * 40, `${height0} → ${height1} px`);

  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="infinite"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid infinite: axe clean', axe.length === 0, axe.join('; '));

  // Virtual columns: 200 sensors × 100,000 rows.
  const cols = '.dg-columns';
  const cvp = page.locator(`${cols} .mx-data-grid__viewport`);
  await page.locator(cols).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${cols} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  const cells = () => page.evaluate((g) => document.querySelectorAll(`${g} .mx-data-grid__cell, ${g} .mx-data-grid__header-cell, ${g} .mx-data-grid__filter-cell`).length, cols);
  /** Scrolls sideways (or down) for 2 s, a step a frame: the frames, the long ones and the most cells seen. */
  const scroll = (dir) =>
    page.evaluate(
      ([g, d]) =>
        new Promise((done) => {
          const el = document.querySelector(`${g} .mx-data-grid__viewport`);
          const count = () => el.querySelectorAll('.mx-data-grid__cell, .mx-data-grid__header-cell, .mx-data-grid__filter-cell').length;
          const times = [];
          let most = 0;
          let last = performance.now();
          const start = last;
          let forward = true;
          const prop = d === 'side' ? 'scrollLeft' : 'scrollTop';
          const max = d === 'side' ? el.scrollWidth - el.clientWidth : 200_000;
          const step = () => {
            const now = performance.now();
            times.push(now - last);
            last = now;
            most = Math.max(most, count());
            if (el[prop] >= max - 1) forward = false;
            if (el[prop] <= 0) forward = true;
            el[prop] += forward ? 160 : -160;
            if (now - start < 2000) requestAnimationFrame(step);
            else {
              el[prop] = 0;
              done({ frames: times.length, long: times.filter((t) => t > 34).length, avg: times.reduce((a, b) => a + b, 0) / times.length, most });
            }
          };
          requestAnimationFrame(step);
        }),
      [cols, dir],
    );
  const virtualCells = await cells();
  const virtualSide = await scroll('side');
  const virtualDown = await scroll('down');
  await page.getByRole('checkbox', { name: 'Virtual columns' }).click();
  await page.waitForTimeout(400);
  const standardCells = await cells();
  const standardSide = await scroll('side');
  const standardDown = await scroll('down');
  await page.getByRole('checkbox', { name: 'Virtual columns' }).click();
  await page.waitForTimeout(400);
  const fps = (s) => Math.round(1000 / s.avg);
  const report = `before (every column): ${standardCells} cells, sideways ${fps(standardSide)} fps (${standardSide.long}/${standardSide.frames} long, up to ${standardSide.most} cells), down ${fps(standardDown)} fps (${standardDown.long}/${standardDown.frames} long) | after (virtual): ${virtualCells} cells, sideways ${fps(virtualSide)} fps (${virtualSide.long}/${virtualSide.frames} long, up to ${virtualSide.most} cells), down ${fps(virtualDown)} fps (${virtualDown.long}/${virtualDown.frames} long)`;
  console.log(`MEASURE ${report}`);
  check(
    'datagrid virtual columns: the DOM cell count stays small while scrolling sideways, a tenth of every column drawn',
    virtualCells * 5 < standardCells && virtualSide.most * 5 < standardCells && virtualSide.most < 700,
    report,
  );
  check(
    'datagrid virtual columns: scrolling sideways and down keeps the frame rate',
    virtualSide.long <= virtualSide.frames * 0.1 && virtualDown.long <= virtualDown.frames * 0.1,
    `sideways ${fps(virtualSide)} fps, down ${fps(virtualDown)} fps`,
  );

  // The cells drawn sit under their headers, the band over its columns drawn.
  await cvp.evaluate((el) => (el.scrollLeft = 6000));
  await page.waitForTimeout(200);
  const lined = await page.evaluate((g) => {
    const rect = (el) => el.getBoundingClientRect();
    const heads = [...document.querySelectorAll(`${g} .mx-data-grid__row--header:not(.mx-data-grid__row--band) > [data-field]`)];
    const row = document.querySelector(`${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
    const bad = heads.filter((h) => {
      const c = row.querySelector(`[data-field="${h.dataset.field}"]`);
      return !c || Math.abs(rect(c).left - rect(h).left) > 1 || Math.abs(rect(c).width - rect(h).width) > 1;
    });
    const band = [...document.querySelectorAll(`${g} .mx-data-grid__band`)];
    return { heads: heads.length, bad: bad.map((h) => h.dataset.field), bands: band.length, index: row.querySelector('[data-field="s70"]')?.getAttribute('aria-colindex') ?? null };
  }, cols);
  check('datagrid virtual columns: each drawn cell sits under its header, aria-colindex stays the column\'s own', lined.bad.length === 0 && lined.heads < 30 && lined.bands >= 1 && lined.index === '72', JSON.stringify(lined));

  // The keyboard reaches the last column: it gets its cells and scrolls into view.
  await cvp.evaluate((el) => (el.scrollLeft = 0));
  await page.waitForTimeout(100);
  await page.locator(`${cols} .mx-data-grid__body [data-field="s1"]`).first().click();
  await page.keyboard.press('End');
  await page.waitForTimeout(150);
  const atEnd = await page.evaluate((g) => {
    const a = document.activeElement;
    const vpEl = document.querySelector(`${g} .mx-data-grid__viewport`);
    const r = a.getBoundingClientRect();
    const v = vpEl.getBoundingClientRect();
    return { field: a.dataset.field, inView: r.left >= v.left - 1 && r.right <= v.right + 1, left: vpEl.scrollLeft };
  }, cols);
  // The last column is pinned; Left goes on into the scrolling ones at the far end.
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(150);
  const back = await page.evaluate((g) => {
    const a = document.activeElement;
    const vpEl = document.querySelector(`${g} .mx-data-grid__viewport`);
    const r = a.getBoundingClientRect();
    const v = vpEl.getBoundingClientRect();
    return { field: a.dataset.field, inView: r.left >= v.left + 89 && r.right <= v.right - 99, left: vpEl.scrollLeft };
  }, cols);
  check(
    'datagrid virtual columns: End and the arrow keys reach columns without cells and scroll them into view',
    atEnd.field === 'total' && atEnd.inView && back.field === 's198' && back.inView && back.left > 10_000,
    `${JSON.stringify(atEnd)}, then ${JSON.stringify(back)}`,
  );

  const axe2 = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="virtual-columns"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid virtual columns: axe clean', axe2.length === 0, axe2.join('; '));
}
