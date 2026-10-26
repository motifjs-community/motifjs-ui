/** Real-browser checks of selecting by dragging: rows (plain, Ctrl, Shift, over the check boxes, past the bottom edge), cell ranges (a range, a Ctrl second range, Shift+click, the keys, past the side edge), copying a range, Delete in an editable grid, the bar's summary, the frame rate while drawing over 100,000 rows with no cell text written again, axe in light and dark. */

export default async function ({ page, base, check, axeSource }) {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
  await page.goto(base + 'datagrid/drag-select', { waitUntil: 'load' });
  const rowsGrid = '.dg-drag-rows';
  const cellsGrid = '.dg-cell-ranges';
  const bigGrid = '.dg-range-virtual';
  const cell = (g, i, field) => page.locator(`${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])[aria-rowindex="${i + 2}"] [data-field="${field}"]`);
  /** A point inside a cell, a quarter in from its start (the middle of a cell may be under a pinned column). */
  const middle = async (g, i, field) => {
    const b = await cell(g, i, field).boundingBox();
    return { x: b.x + b.width / 4, y: b.y + b.height / 2 };
  };
  /** The grid in the middle of the window, its rows at the top. */
  const center = async (g) => {
    await page.waitForSelector(`${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
    await page.evaluate((s) => {
      const grid = document.querySelector(s);
      grid.scrollIntoView({ block: 'center', behavior: 'instant' });
      const vp = grid.querySelector('.mx-data-grid__viewport');
      vp.scrollTop = 0;
      vp.scrollLeft = 0;
    }, g);
    await page.waitForTimeout(100);
  };
  /** A real mouse drag from one cell over others, with keys held. */
  const drag = async (g, from, over, modifiers = []) => {
    for (const m of modifiers) await page.keyboard.down(m);
    const a = await middle(g, ...from);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    for (const to of over) {
      const b = await middle(g, ...to);
      await page.mouse.move(b.x, b.y, { steps: 4 });
    }
    await page.mouse.up();
    for (const m of modifiers) await page.keyboard.up(m);
    await page.waitForTimeout(60);
  };
  const live = (g) => page.locator(`${g} .mx-data-grid__live[aria-live]`).textContent();
  const selectedIds = (g) =>
    page.evaluate((s) => [...document.querySelectorAll(`${s} .mx-data-grid__body > .mx-data-grid__row[data-selected]:not([hidden]) [data-field="id"]`)].map((c) => Number(c.textContent)).sort((x, y) => x - y), g);

  // Rows.
  await center(rowsGrid);
  await page.waitForSelector(`${rowsGrid} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  await drag(rowsGrid, [1, 'customer'], [[2, 'customer'], [4, 'city']]);
  const plain = await selectedIds(rowsGrid);
  const plainSaid = await live(rowsGrid);
  await drag(rowsGrid, [6, 'customer'], [[7, 'customer']], ['Control']);
  const added = await selectedIds(rowsGrid);
  await drag(rowsGrid, [7, 'customer'], [[8, 'customer']], ['Shift']);
  const extended = await selectedIds(rowsGrid);
  await drag(rowsGrid, [2, 'mx:select'], [[3, 'mx:select'], [7, 'mx:select']]);
  const painted = await selectedIds(rowsGrid);
  check(
    'datagrid drag select: a drag selects the rows passed, Ctrl adds, Shift goes from the anchor, the check boxes paint',
    plain.join() === '2,3,4,5' && plainSaid === '4 rows selected' && added.join() === '2,3,4,5,7,8' && extended.join() === '2,3,4,5,7,8,9' && painted.join() === '2,9' && (await page.locator('.dg-drag-rows-state').textContent()).includes('by dragging'),
    `${plain} "${plainSaid}" | ${added} | ${extended} | ${painted}`,
  );

  // Past the bottom edge the rows scroll and the rows that come are taken in.
  await center(rowsGrid);
  const rvp = page.locator(`${rowsGrid} .mx-data-grid__viewport`);
  const box = await rvp.boundingBox();
  const a = await middle(rowsGrid, 0, 'customer');
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(a.x, a.y + 20, { steps: 2 });
  await page.mouse.move(a.x, box.y + box.height + 30, { steps: 4 });
  await page.waitForTimeout(700);
  const scrolled = await rvp.evaluate((el) => el.scrollTop);
  await page.mouse.up();
  const count = await page.locator(`${rowsGrid} .mx-data-grid__selected`).textContent();
  check('datagrid drag select: past the bottom edge the rows scroll, the rows that come are selected', scrolled > 400 && Number(count.replace(/\D/g, '')) > 20, `scrollTop ${scrolled}, ${count}`);

  // Cells: a range, a second one with Ctrl, Shift+click.
  await center(cellsGrid);
  await page.waitForSelector(`${cellsGrid} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  const ranged = () => page.evaluate((g) => document.querySelectorAll(`${g} .mx-data-grid__body [data-range]`).length, cellsGrid);
  await drag(cellsGrid, [1, 'customer'], [[2, 'city'], [3, 'city']]);
  const first = await ranged();
  const firstSaid = await live(cellsGrid);
  const look = await cell(cellsGrid, 1, 'customer').evaluate((el) => ({ range: el.dataset.range, selected: el.getAttribute('aria-selected'), image: getComputedStyle(el).backgroundImage.includes('gradient') }));
  await drag(cellsGrid, [6, 'customer'], [[7, 'customer']], ['Control']);
  const second = await ranged();
  await cell(cellsGrid, 8, 'city').click({ modifiers: ['Shift'], position: { x: 10, y: 10 } });
  await page.waitForTimeout(60);
  const third = await ranged();
  const summary = await page.locator(`${cellsGrid} .mx-data-grid__cell-summary`).textContent();
  check(
    'datagrid cell ranges: a drag draws a range with its frame and aria-selected, Ctrl adds one, Shift+click extends the last, the bar sums up',
    first === 6 && firstSaid === '3 × 2 cells selected' && look.range === 'top start anchor' && look.selected === 'true' && look.image && second === 8 && third === 6 + 3 * 2 && summary.startsWith('Count:'),
    `${first} "${firstSaid}" ${JSON.stringify(look)} | ${second} | ${third} | ${summary}`,
  );

  // Copy a range.
  await drag(cellsGrid, [0, 'customer'], [[1, 'city']]);
  // What the copy put on the clipboard, read in the copy event itself.
  await page.evaluate(() => window.addEventListener('copy', (e) => (window.__copied = e.clipboardData?.getData('text/plain') ?? ''), { once: true }));
  await page.keyboard.press('Control+c');
  await page.waitForTimeout(100);
  const copied = await page.evaluate(() => window.__copied ?? '');
  const expected = await page.evaluate((g) => {
    const t = (i, f) => document.querySelector(`${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])[aria-rowindex="${i + 2}"] [data-field="${f}"]`).textContent;
    return `${t(0, 'customer')}\t${t(0, 'city')}\n${t(1, 'customer')}\t${t(1, 'city')}`;
  }, cellsGrid);
  check('datagrid cell ranges: Ctrl+C copies the range as tab-separated text', copied.replace(/\r\n/g, '\n') === expected && (await live(cellsGrid)) === '4 cells copied', JSON.stringify(copied));

  // The keys: Shift+arrows from the active cell, Escape.
  await center(cellsGrid);
  await cell(cellsGrid, 4, 'customer').click();
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(60);
  const keyed = await ranged();
  const keySaid = await live(cellsGrid);
  const focused = await page.evaluate(() => document.activeElement?.dataset.field);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(60);
  check('datagrid cell ranges: Shift and the arrows extend from the active cell, focus with the corner; Escape clears', keyed === 6 && keySaid === '3 × 2 cells selected' && focused === 'city' && (await ranged()) === 0, `${keyed} "${keySaid}" ${focused}`);

  // Delete empties the cells of a range through the edit path.
  await center(cellsGrid);
  await drag(cellsGrid, [4, 'city'], [[6, 'city']]);
  await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
  const emptied = await page.evaluate((g) => [4, 5, 6].map((i) => document.querySelector(`${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])[aria-rowindex="${i + 2}"] [data-field="city"]`).textContent), cellsGrid);
  check('datagrid cell ranges: Delete empties the range in an editable grid', emptied.every((t) => t === '') && (await live(cellsGrid)) === '3 cells cleared', JSON.stringify(emptied));

  // Axe, light and dark, with a range drawn.
  await drag(cellsGrid, [1, 'customer'], [[3, 'status']]);
  await page.addScriptTag({ content: axeSource });
  const axe = [];
  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    await page.waitForTimeout(150);
    axe.push(...(await page.evaluate(async () => (await window.axe.run(document.querySelector('main') ?? document)).violations.map((v) => `${v.id}: ${v.nodes.length} ${v.nodes[0]?.target.join(' ')}`))).map((v) => `${theme} ${v}`));
  }
  await page.evaluate(() => delete document.documentElement.dataset.theme);
  check('datagrid drag select: axe clean in light and dark', axe.length === 0, axe.join('; '));

  // Sideways past the edge, over 100,000 rows × 60 virtual columns.
  await center(bigGrid);
  await page.waitForSelector(`${bigGrid} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  const bvp = page.locator(`${bigGrid} .mx-data-grid__viewport`);
  const bbox = await bvp.boundingBox();
  const s = await middle(bigGrid, 1, 's1');
  await page.mouse.move(s.x, s.y);
  await page.mouse.down();
  await page.mouse.move(s.x + 30, s.y + 10, { steps: 2 });
  await page.mouse.move(bbox.x + bbox.width + 20, s.y + 40, { steps: 4 });
  await page.waitForTimeout(600);
  const side = await bvp.evaluate((el) => el.scrollLeft);
  await page.mouse.up();
  const far = await page.evaluate((g) => document.querySelector(`${g} .mx-data-grid__body [data-range~="end"]`)?.dataset.field, bigGrid);
  check('datagrid cell ranges: past the side edge the columns scroll and the range takes the ones that come', side > 300 && Number(far?.slice(1)) > 8, `scrollLeft ${side}, far column ${far}`);

  // The frame rate while drawing a range over the virtual grid, scrolling down past the bottom; no cell text is written again while only the range changes.
  await bvp.evaluate((el) => {
    el.scrollTop = 0;
    el.scrollLeft = 0;
  });
  await page.waitForTimeout(200);
  const p = await middle(bigGrid, 0, 's0');
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 20, p.y + 20, { steps: 2 });
  const measured = await page.evaluate(
    ([g, x0, y0]) =>
      new Promise((done) => {
        const vp = document.querySelector(`${g} .mx-data-grid__viewport`);
        const r = vp.getBoundingClientRect();
        const times = [];
        const drawing = [];
        let texts = 0;
        const watch = new MutationObserver((list) => {
          for (const m of list) if (m.type === 'characterData' || (m.type === 'childList' && m.target.classList?.contains('mx-data-grid__cell'))) texts++;
        });
        let last = performance.now();
        const start = last;
        let k = 0;
        const move = (x, y) => window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: x, clientY: y, buttons: 1, bubbles: true }));
        const step = () => {
          const now = performance.now();
          (now - start < 1000 ? drawing : times).push(now - last);
          last = now;
          k++;
          // The first second sideways and down inside the rows (only the range changes), then past the bottom edge.
          if (now - start < 1000) {
            if (k === 2) watch.observe(vp, { subtree: true, characterData: true, childList: true });
            move(x0 + (k % 60) * 9, y0 + (k % 40) * 6);
          } else {
            watch.disconnect();
            move(x0 + 200, r.bottom + 40);
          }
          if (now - start < 2500) requestAnimationFrame(step);
          else {
            const all = [...drawing, ...times];
            const avg = (list) => list.reduce((s2, t) => s2 + t, 0) / list.length;
            done({ frames: all.length, long: all.filter((t) => t > 34).length, avg: avg(all), drawAvg: avg(drawing), drawLong: drawing.filter((t) => t > 34).length, drawFrames: drawing.length, scrollAvg: avg(times), texts, top: vp.scrollTop, marked: vp.querySelectorAll('[data-range]').length });
          }
        };
        requestAnimationFrame(step);
      }),
    [bigGrid, p.x + 20, p.y + 20],
  );
  await page.mouse.up();
  const fps = Math.round(1000 / measured.avg);
  console.log(`MEASURE drawing a range over 100,000 rows × 60 virtual columns: ${fps} fps, ${measured.long}/${measured.frames} long frames (drawing inside the rows ${Math.round(1000 / measured.drawAvg)} fps, ${measured.drawLong}/${measured.drawFrames} long; scrolling past the bottom ${Math.round(1000 / measured.scrollAvg)} fps), ${measured.texts} cell text writes while only the range changed, scrolled to ${measured.top}px, ${measured.marked} cells marked`);
  check(
    'datagrid cell ranges: drawing over 100,000 rows keeps the frame rate and writes no cell text while only the range changes',
    measured.long <= measured.frames * 0.1 && measured.texts === 0 && measured.top > 1000 && measured.marked > 0,
    `${fps} fps, ${measured.long}/${measured.frames} long, ${measured.texts} text writes, scrollTop ${measured.top}`,
  );
}
