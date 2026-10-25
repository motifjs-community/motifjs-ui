/** Real-browser checks of the datagrid's actions in the toolbar and the bottom bar: nothing without a selection, one row's actions, the common ones of three rows with their count, applied to all three, the bottom bar, the row's context menu, the "menu only" display with the tone of its items, and axe. */

export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/editing', { waitUntil: 'load' });
  const grid = '.dg-bar-actions';
  await page.locator(grid).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${grid} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  const row = (i) => `${grid} .mx-data-grid__body > .mx-data-grid__row:not([hidden])[aria-rowindex="${i + 2}"]`;
  const cell = (i) => page.locator(`${row(i)} [data-field="customer"]`);
  const barButtons = (where) =>
    page.evaluate(
      ([g, w]) =>
        [...document.querySelectorAll(`${g} .mx-data-grid__${w} .mx-data-grid__bar-action:not([hidden])`)]
          .filter((b) => b.isConnected && !b.closest('[hidden]'))
          .map((b) => {
            const face = b.classList.contains('mx-button__face') ? b : b.querySelector('.mx-button__face');
            return { id: b.dataset.action, text: b.textContent.trim(), label: face.getAttribute('aria-label') ?? face.title ?? '' };
          }),
      [grid, where],
    );
  const toolbarShown = () => page.evaluate((g) => !!document.querySelector(`${g} .mx-data-grid__toolbar`)?.checkVisibility(), grid);
  const menuItems = async () => {
    await page.waitForSelector('[role="menu"]:visible [role^="menuitem"]');
    return (await page.locator('[role="menu"]:visible [role^="menuitem"]').allTextContents()).map((t) => t.trim());
  };

  // No selection: no actions (the toolbar still holds "Save changes" and "Discard" of batch mode).
  const empty = await page.evaluate((g) => document.querySelector(`${g} .mx-data-grid__bar-target`)?.textContent, grid);
  check('datagrid bar actions: nothing shows without a selected row', (await barButtons('toolbar')).length === 0 && empty === '' && (await toolbarShown()), `target “${empty}”`);

  // One row: its own actions in the toolbar.
  await cell(0).click();
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__toolbar .mx-data-grid__bar-action:not([hidden])`), grid);
  const one = await barButtons('toolbar');
  const target = await page.evaluate((g) => document.querySelector(`${g} .mx-data-grid__bar-target`)?.textContent, grid);
  check(
    'datagrid bar actions: one selected row shows its actions in the toolbar',
    one.some((b) => b.id === 'print' && b.text === 'Print') && one.some((b) => b.id === 'remove') && target === 'Actions for the selected row',
    `${JSON.stringify(one)} · ${target}`,
  );

  // Three rows: the common ones, with the count.
  await cell(1).click({ modifiers: ['Control'] });
  await cell(2).click({ modifiers: ['Control'] });
  await page.waitForFunction((g) => [...document.querySelectorAll(`${g} .mx-data-grid__toolbar .mx-data-grid__bar-action`)].some((b) => b.textContent.includes('(3)')), grid);
  const three = await barButtons('toolbar');
  const print = three.find((b) => b.id === 'print');
  const remove = three.find((b) => b.id === 'remove');
  check(
    'datagrid bar actions: three rows show their common actions with “(3)”',
    print?.text === 'Print (3)' && print?.label === 'Print, 3 rows' && remove?.label === 'Delete, 3 rows',
    JSON.stringify(three),
  );

  // Print row by row: the progress panel with Stop, then gone.
  await page.locator(`${grid} .mx-data-grid__toolbar .mx-data-grid__bar-action[data-action="print"]`).click();
  await page.waitForSelector(`${grid} .mx-data-grid__export-panel:visible`);
  const panel = await page.textContent(`${grid} .mx-data-grid__export-panel`);
  await page.waitForSelector(`${grid} .mx-data-grid__export-panel`, { state: 'hidden', timeout: 10_000 });
  check('datagrid bar actions: an action row by row shows its progress and Stop', panel.includes('Print…') && panel.includes('Stop'), panel);

  // Delete applies to all three (batch: marked).
  await page.locator(`${grid} .mx-data-grid__toolbar .mx-data-grid__bar-action[data-action="remove"]`).click();
  await page.waitForFunction((g) => document.querySelectorAll(`${g} .mx-data-grid__row[data-status="removed"]:not([hidden])`).length === 3, grid);
  const removed = await page.locator(`${grid} .mx-data-grid__row[data-status="removed"]:not([hidden])`).count();
  const afterRemove = await barButtons('toolbar');
  check('datagrid bar actions: the action applies to all three rows', removed === 3 && afterRemove.some((b) => b.id === 'restore' && /Restore/.test(b.label + b.text)), `${removed} · ${JSON.stringify(afterRemove)}`);

  // The bottom bar.
  await page.locator(`section[aria-labelledby="actions"] [role="group"][aria-label="Where the actions show"] button:text-is("bottom")`).click();
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__bar-actions .mx-data-grid__bar-action:not([hidden])`), grid);
  const bottom = await barButtons('bar-actions');
  const bottomLabel = await page.getAttribute(`${grid} .mx-data-grid__bar-actions`, 'aria-label');
  check(
    'datagrid bar actions: in the bottom location the bar holds them, named after what it acts on',
    bottom.some((b) => b.id === 'restore') && (await barButtons('toolbar')).length === 0 && bottomLabel === 'Actions for 3 selected rows',
    `${JSON.stringify(bottom)} · ${bottomLabel}`,
  );

  // The context menu: a row outside the selection shows its own actions; focus moves to it.
  await cell(5).click({ button: 'right' });
  const own = await menuItems();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const focusedRow = await page.evaluate(() => document.activeElement?.closest('.mx-data-grid__row')?.getAttribute('aria-rowindex'));
  check(
    'datagrid bar actions: right click on a row shows that row’s actions and makes it the active row',
    own.includes('Print') && own.includes('Delete') && !own.some((t) => t.includes('(')) && focusedRow === '7',
    `${own.join(' | ')} · focus row ${focusedRow}`,
  );

  // Inside the selection: the common ones with (3); an item applies to all of them.
  await cell(1).click({ button: 'right' });
  const common = await menuItems();
  // The three rows are marked for deletion: what they share is Restore.
  check('datagrid bar actions: right click inside a three-row selection shows the common actions with (3)', JSON.stringify(common) === '["Restore (3)"]', common.join(' | '));
  await page.locator('[role="menu"]:visible [role^="menuitem"]', { hasText: 'Restore (3)' }).click();
  await page.waitForFunction((g) => document.querySelectorAll(`${g} .mx-data-grid__row[data-status="removed"]:not([hidden])`).length === 0, grid);
  check('datagrid bar actions: a menu item applies to the selection', (await page.locator(`${grid} .mx-data-grid__row[data-status="removed"]:not([hidden])`).count()) === 0);

  // Shift+F10 on the active cell opens it; Escape gives focus back to the cell.
  await cell(1).focus();
  await page.keyboard.press('Shift+F10');
  const byKey = await menuItems();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const back = await page.evaluate((sel) => document.activeElement === document.querySelector(`${sel} [data-field="customer"]`), row(1));
  check('datagrid bar actions: Shift+F10 opens the row menu and Escape returns to the cell', byKey.includes('Print (3)') && back, `${byKey.join(' | ')} · back ${back}`);

  // Menu only, in the row: only "more", whose menu lists every action; an item applies.
  await page.locator(`section[aria-labelledby="actions"] [role="group"][aria-label="Where the actions show"] button:text-is("row")`).click();
  await page.locator('section[aria-labelledby="actions"] label', { hasText: 'Menu only' }).click();
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__more:not([hidden])`), grid);
  const rowButtons = await page.evaluate((sel) => [...document.querySelectorAll(`${sel} .mx-data-grid__actions > button:not([hidden])`)].map((b) => b.dataset.action ?? 'more'), row(6));
  const more = page.locator(`${row(6)} .mx-data-grid__more`);
  const moreName = await more.getAttribute('aria-label');
  await more.click();
  const all = await menuItems();
  const tones = await page.evaluate(() => [...document.querySelectorAll('[role="menu"] [role^="menuitem"]')].filter((i) => i.checkVisibility()).map((i) => `${i.textContent.trim()}:${i.dataset.tone ?? ''}`));
  check('datagrid bar actions: a danger action’s menu item carries data-tone="danger"', tones.includes('Delete:danger') && tones.includes('Print:'), tones.join(' | '));
  await page.locator('[role="menu"]:visible [role^="menuitem"]', { hasText: 'Print' }).click();
  await page.waitForFunction(() => /printed/.test(document.querySelector('.dg-bar-note')?.textContent ?? ''), null, { timeout: 5000 });
  const note = await page.textContent('.dg-bar-note');
  check(
    'datagrid bar actions: the menu display shows only “more”, listing every action, and an item applies',
    JSON.stringify(rowButtons) === '["more"]' && moreName === 'More actions for row 7' && all.includes('Print') && all.includes('Delete') && note.includes('printed'),
    `${JSON.stringify(rowButtons)} · ${moreName} · ${all.join(' | ')} · ${note}`,
  );

  // The bar's menu button in the menu display, then axe in both themes with the toolbar shown.
  await page.locator(`section[aria-labelledby="actions"] [role="group"][aria-label="Where the actions show"] button:text-is("toolbar")`).click();
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__toolbar .mx-data-grid__bar-menu:not([hidden])`), grid);
  const menuName = await page.getAttribute(`${grid} .mx-data-grid__toolbar .mx-data-grid__bar-menu .mx-button__face`, 'aria-label');
  check('datagrid bar actions: the bars hold one “Actions” menu button in the menu display', /^Actions for \d+ selected rows?$|^Actions for the selected row$/.test(menuName ?? ''), menuName);
  await page.addScriptTag({ content: axeSource });
  const found = [];
  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    await page.waitForTimeout(300);
    const v = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="actions"]'))).violations.map((x) => `${x.id}: ${x.nodes.length}`));
    found.push(...v.map((x) => `${theme} ${x}`));
  }
  await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
  check('datagrid bar actions: axe clean with the actions in the toolbar, light and dark', found.length === 0, found.join('; '));
}
