/** Real-browser checks of the FilterBuilder (a filter with groups built from the keyboard alone) and of the DataGrid's filter panel and its builder window, with axe on both. */

export default async function ({ page, base, check, axeSource }) {
  // The FilterBuilder page: one Tab stop, conditions and a group from the keyboard.
  await page.goto(base + 'filterbuilder#custom', { waitUntil: 'load' });
  const fb = '.fb-custom';
  await page.locator(fb).scrollIntoViewIfNeeded();
  const rows = () => page.locator(`${fb} [role="row"]`);
  const levels = () => rows().evaluateAll((rs) => rs.map((r) => r.getAttribute('aria-level')).join(','));
  const part = () => page.evaluate(() => document.activeElement?.closest('[data-part]')?.getAttribute('data-part'));
  const tabbable = () => page.locator(`${fb} .mx-button__face`).evaluateAll((fs) => fs.filter((f) => f.tabIndex >= 0).length);
  check('filterbuilder: the tree is one Tab stop', (await tabbable()) === 1, `${await tabbable()}`);
  await page.locator(`${fb} [data-part="group"] .mx-button__face`).focus();
  await page.keyboard.press('Insert');
  await page.waitForFunction((s) => document.querySelectorAll(`${s} [role="row"]`).length === 2, fb);
  check('filterbuilder: Insert adds a condition and focuses its field', (await part()) === 'field', await part());
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  check('filterbuilder: Right moves along the row to the value', (await part()) === 'value', await part());
  await page.keyboard.press('Enter');
  await page.waitForSelector(`${fb} .mx-filter-builder__editor input`);
  await page.keyboard.type('Desk');
  await page.keyboard.press('Enter');
  await page.waitForFunction((s) => !document.querySelector(`${s} .mx-filter-builder__editor`), fb);
  check('filterbuilder: Enter keeps the value and focus goes back to its button', (await part()) === 'value' && (await page.locator('.fb-custom-text').textContent()) === "[Product] Contains 'Desk'", await page.locator('.fb-custom-text').textContent());
  // A group: up to the root row, the add button's menu, "Add Group".
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('End');
  check('filterbuilder: Up and End reach the root row\'s add button', (await part()) === 'add', await part());
  await page.keyboard.press('Alt+ArrowDown');
  await page.waitForSelector(`${fb} .mx-menu__item:focus`);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction((s) => document.querySelectorAll(`${s} [role="row"]`).length === 4, fb);
  check('filterbuilder: "Add Group" adds a group with a condition, a level deeper', (await levels()) === '1,2,2,3' && (await part()) === 'field', `${await levels()} · ${await part()}`);
  // Its field from the menu by a letter, its value, then the group's operation.
  await page.keyboard.press('Alt+ArrowDown');
  await page.waitForSelector(`${fb} .mx-menu__item:focus`);
  await page.keyboard.press('a');
  await page.keyboard.press('Enter');
  await page.waitForFunction((s) => document.querySelectorAll(`${s} [role="row"]`)[3]?.querySelector('[data-part="field"]')?.textContent.startsWith('Amount'), fb);
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.waitForSelector(`${fb} .mx-filter-builder__editor input`);
  await page.keyboard.type('500');
  await page.keyboard.press('Enter');
  await page.waitForFunction((s) => !document.querySelector(`${s} .mx-filter-builder__editor`), fb);
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  check('filterbuilder: on the group row, Home and Right reach its operation', (await part()) === 'group', await part());
  await page.keyboard.press('Alt+ArrowDown');
  await page.waitForSelector(`${fb} .mx-menu__item:focus`);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction((s) => document.querySelectorAll(`${s} [role="row"]`)[2]?.textContent.includes('Or'), fb);
  const value = JSON.parse(await page.locator('.fb-custom-value').textContent());
  const text = await page.locator('.fb-custom-text').textContent();
  check(
    'filterbuilder: the keyboard built the filter value',
    JSON.stringify(value) === JSON.stringify({ and: [{ field: 'product', op: 'contains', value: 'Desk' }, { field: 'amount', op: '=', value: 500 }] }) && /^\[Product\] Contains 'Desk' And \[Amount\] Equals '€500\.00'$/.test(text),
    `${JSON.stringify(value)} · ${text}`,
  );
  await page.keyboard.press('Delete');
  await page.waitForFunction((s) => document.querySelectorAll(`${s} [role="row"]`).length === 2, fb);
  check('filterbuilder: Delete takes the focused group out, one Tab stop stays', (await levels()) === '1,2' && (await tabbable()) === 1, await levels());
  await page.addScriptTag({ content: axeSource });
  await page.locator(`${fb} [data-part="field"] .mx-button__face`).first().click();
  await page.waitForSelector(`${fb} .mx-menu__item:focus`);
  const axeBuilder = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="custom"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('filterbuilder: axe clean, a menu open', axeBuilder.length === 0, axeBuilder.join('; '));
  await page.keyboard.press('Escape');

  // The DataGrid's filter panel: the builder in a window, OK, the text, the check box, Clear.
  await page.goto(base + 'datagrid/filtering#filter-panel', { waitUntil: 'load' });
  const grid = '.dg-server-filters';
  await page.locator(grid).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${grid} .mx-data-grid__body > .mx-data-grid__row:not([hidden]):not([data-loading])`);
  const total = async () => Number((await page.locator('.dg-server-filter').textContent()).match(/^([\d,]+)/)[1].replace(/,/g, ''));
  const panelText = page.locator(`${grid} .mx-data-grid__filter-text`);
  check('datagrid filter panel: "Create Filter" while there is no filter', (await panelText.textContent()) === 'Create Filter' && (await total()) === 100000, await panelText.textContent());
  await panelText.click();
  const win = page.locator('dialog.mx-data-grid__filter-window[open]');
  await win.waitFor();
  await page.waitForFunction(() => document.activeElement?.closest('dialog.mx-data-grid__filter-window'));
  check('datagrid filter panel: the builder opens in a modal window, focus in its tree', (await win.locator('.mx-dialog__title, [class*="title"]').first().textContent()).includes('Filter the orders'), await win.textContent());
  await page.keyboard.press('Insert');
  await win.locator('[role="row"]').nth(1).waitFor();
  await page.keyboard.press('Alt+ArrowDown');
  await page.waitForSelector('dialog[open] .mx-menu__item:focus');
  await page.keyboard.press('a');
  await page.keyboard.press('Enter');
  const condition = win.locator('[role="row"]').nth(1);
  await page.waitForFunction(() => document.querySelectorAll('dialog[open] [role="row"]')[1]?.querySelector('[data-part="field"]')?.textContent.startsWith('Amount'));
  await condition.locator('[data-part="operation"] .mx-button__face').click();
  await condition.locator('.mx-menu__item', { hasText: /^Is greater than$/ }).click();
  await condition.locator('[data-part="value"] .mx-button__face').click();
  await condition.locator('.mx-filter-builder__editor input').waitFor();
  await page.keyboard.type('900');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.querySelector('dialog[open] .mx-filter-builder__editor'));
  const axeWindow = await (async () => {
    await page.addScriptTag({ content: axeSource });
    return page.evaluate(async () => (await window.axe.run(document.querySelector('dialog.mx-data-grid__filter-window'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  })();
  check('datagrid filter panel: axe clean in the builder window', axeWindow.length === 0, axeWindow.join('; '));
  await win.getByRole('button', { name: 'OK', exact: true }).click();
  // Loaded: a count other than all of them and none, and the rows drawn.
  await page.waitForFunction((s) => {
    const t = document.querySelector('.dg-server-filter').textContent;
    return /^[1-9]/.test(t) && !/^100,000 /.test(t) && document.querySelector(`${s} .mx-data-grid__body > .mx-data-grid__row:not([hidden]):not([data-loading]) [data-field="amount"]`);
  }, grid);
  const sent = await page.locator('.dg-server-filter').textContent();
  const amounts = await page.evaluate((s) => [...document.querySelectorAll(`${s} .mx-data-grid__body > .mx-data-grid__row:not([hidden]):not([data-loading]) [data-field="amount"]`)].map((c) => Number(c.textContent.replace(/,/g, ''))), grid);
  check('datagrid filter panel: OK filters the rows on the server', /"op":">","value":900/.test(sent) && amounts.length > 0 && amounts.every((a) => a > 900), `${sent.slice(0, 90)} · ${amounts.slice(0, 3)}`);
  check('datagrid filter panel: the panel reads the filter', (await panelText.textContent()) === "[Amount] Is greater than '900.00'", await panelText.textContent());
  const cell = await page.locator(`${grid} .mx-data-grid__filter-cell[data-field="amount"] input`).inputValue();
  check('datagrid filter panel: the filter row shows the condition (sync)', cell === '900', cell);
  const filtered = await total();
  const box = page.locator(`${grid} .mx-data-grid__filter-enabled input`);
  await box.click();
  await page.waitForFunction(() => /^100,000 /.test(document.querySelector('.dg-server-filter').textContent));
  check('datagrid filter panel: the check box turns the filter off', (await page.locator(`${grid} .mx-data-grid__filter-panel`).getAttribute('data-off')) === '' && !(await box.isChecked()));
  await box.click();
  await page.waitForFunction((n) => Number(document.querySelector('.dg-server-filter').textContent.match(/^([\d,]+)/)[1].replace(/,/g, '')) === n, filtered);
  check('datagrid filter panel: and on again', (await box.isChecked()) && (await total()) === filtered, `${await total()}`);
  await page.addScriptTag({ content: axeSource });
  const axePanel = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="filter-panel"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid filter panel: axe clean', axePanel.length === 0, axePanel.join('; '));
  await page.locator(`${grid} .mx-data-grid__filter-clear`).click();
  await page.waitForFunction(() => /^100,000 /.test(document.querySelector('.dg-server-filter').textContent));
  check('datagrid filter panel: Clear takes the filter away', (await panelText.textContent()) === 'Create Filter' && (await page.locator(`${grid} .mx-data-grid__filter-cell[data-field="amount"] input`).inputValue()) === '');
}
