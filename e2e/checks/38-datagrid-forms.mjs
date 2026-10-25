/** Real-browser checks of the datagrid's edit forms: the form in place of a row with its fields, a message, Save writing the row, Escape, the rows below moved by the form's height, the modal window and focus coming back, a new row in the window, an async rule, and axe. */

export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/forms', { waitUntil: 'load' });
  const form = '.dg-form';
  const rows = (g) => `${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`;
  const row = (g, i) => `${rows(g)}[aria-rowindex="${i + 2}"]`;
  const formRow = `${form} .mx-data-grid__form-row:not([hidden])`;
  const field = (root, name) => `${root} .mx-data-grid__form-field[data-field="${name}"]`;
  await page.locator(form).scrollIntoViewIfNeeded();
  await page.waitForSelector(row(form, 2));

  // Enter on a cell: the row opens as a form in its place, with a field per column and focus in it.
  await page.locator(`${row(form, 1)} [data-field="customer"]`).click();
  await page.keyboard.press('Enter');
  await page.waitForSelector(formRow);
  const shown = await page.evaluate(
    ([f, r]) => ({
      fields: [...document.querySelectorAll(`${r} .mx-data-grid__form-field`)].map((x) => x.dataset.field),
      groups: [...document.querySelectorAll(`${r} legend`)].map((x) => x.textContent),
      rowIndex: document.querySelector(r).getAttribute('aria-rowindex'),
      focused: document.activeElement.closest('.mx-data-grid__form-field')?.dataset.field,
      hidden: !document.querySelector(`${f} .mx-data-grid__body > .mx-data-grid__row:not([hidden])[aria-rowindex="3"]`),
    }),
    [form, formRow],
  );
  check(
    'datagrid forms: Enter opens the form in place of the row, with its groups and fields, focus in the field',
    shown.fields.join() === 'customer,date,status,amount,city,paid,note' && shown.groups.join() === 'Order,Delivery' && shown.rowIndex === '3' && shown.focused === 'customer' && shown.hidden,
    JSON.stringify(shown),
  );
  const formBox = await page.locator(formRow).evaluate((el) => el.getBoundingClientRect().toJSON());
  const rowAbove = await page.locator(row(form, 0)).evaluate((el) => el.getBoundingClientRect().toJSON());
  const rowBelow = await page.locator(row(form, 2)).evaluate((el) => el.getBoundingClientRect().toJSON());
  const vp = await page.locator(`${form} .mx-data-grid__viewport`).evaluate((el) => el.clientWidth);
  check(
    'datagrid forms: the form takes the row’s place across the grid, the rows below move down by its height',
    Math.abs(formBox.top - rowAbove.bottom) < 2 && Math.abs(rowBelow.top - formBox.bottom) < 2 && formBox.height > 150 && Math.abs(formBox.width - vp) < 2,
    `above ${rowAbove.bottom}, form ${formBox.top}–${formBox.bottom} × ${formBox.width} (${vp}), below ${rowBelow.top}`,
  );

  // An empty customer: the message shows on its field and Save keeps the form.
  const customer = page.locator(`${field(formRow, 'customer')} input`);
  await customer.fill('');
  await page.locator(`${formRow} .mx-data-grid__form-buttons button`, { hasText: 'Save' }).click();
  await page.waitForFunction((f) => document.querySelector(f)?.textContent.includes('This field is required.'), field(formRow, 'customer'));
  check('datagrid forms: a message shows on the field and the form stays', (await page.locator(formRow).count()) === 1 && (await customer.getAttribute('aria-invalid')) === 'true');

  // A name and Save: the row is written and the form closes.
  await customer.fill('Hedy Lamarr');
  await page.locator(`${formRow} .mx-data-grid__form-buttons button`, { hasText: 'Save' }).click();
  await page.waitForSelector(formRow, { state: 'detached', timeout: 5000 });
  await page.waitForFunction((r) => document.querySelector(`${r} [data-field="customer"]`)?.textContent === 'Hedy Lamarr', row(form, 1), { timeout: 5000 });
  const back = await page.evaluate(() => document.activeElement.closest('[role="row"]')?.getAttribute('aria-rowindex'));
  check('datagrid forms: Save writes the row, closes the form and gives focus back to the row', back === '3', back);

  // Escape gives up.
  await page.keyboard.press('Enter');
  await page.waitForSelector(formRow);
  await page.locator(`${field(formRow, 'note')} input`).fill('changed and given up');
  await page.keyboard.press('Escape');
  await page.waitForSelector(formRow, { state: 'detached' });
  const note = await page.locator(`${row(form, 1)} [data-field="note"]`).textContent();
  check('datagrid forms: Escape closes the form without keeping the edit', !note.includes('given up'), note);

  // The modal window: F2 opens it, focus is trapped in it and comes back.
  const popup = '.dg-popup';
  await page.locator(popup).scrollIntoViewIfNeeded();
  await page.waitForSelector(row(popup, 0));
  await page.locator(`${row(popup, 2)} [data-field="customer"]`).click();
  await page.keyboard.press('F2');
  const win = 'dialog.mx-data-grid__popup[open]';
  await page.waitForSelector(win);
  const modal = await page.evaluate((w) => {
    const d = document.querySelector(w);
    return { modal: d.matches(':modal'), title: d.textContent.includes('Order'), focus: d.contains(document.activeElement), number: !!d.querySelector('[data-field="id"]') };
  }, win);
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  const stillInside = await page.evaluate((w) => document.querySelector(w).contains(document.activeElement), win);
  check('datagrid forms: the window opens modal with its title, focus kept inside', modal.modal && modal.title && modal.focus && !modal.number && stillInside, JSON.stringify({ ...modal, stillInside }));
  await page.locator(`${win} .mx-data-grid__form-field[data-field="amount"] input`).fill('123.45');
  await page.locator(`${win} .mx-data-grid__form-field[data-field="amount"] input`).press('Enter');
  await page.waitForSelector(win, { state: 'detached', timeout: 5000 });
  const returned = await page.evaluate(() => ({ row: document.activeElement.closest('[role="row"]')?.getAttribute('aria-rowindex'), field: document.activeElement.dataset?.field }));
  const amount = await page.locator(`${row(popup, 2)} [data-field="amount"]`).textContent();
  check('datagrid forms: Enter saves in the window and focus comes back to the cell', returned.row === '4' && returned.field === 'customer' && amount === '123.45', `${JSON.stringify(returned)} · ${amount}`);

  // A new row in the window: the toolbar's "New row".
  const before = await page.locator(`${popup} .mx-data-grid__count`).textContent();
  await page.locator(`${popup} .mx-data-grid__add`).click();
  await page.waitForSelector(win);
  const newTitle = await page.locator(`${win}`).textContent();
  await page.locator(`${win} .mx-data-grid__form-field[data-field="customer"] input`).fill('Radia Perlman');
  await page.locator(`${win} .mx-data-grid__form-field[data-field="amount"] input`).fill('10');
  await page.locator(`${win} .mx-data-grid__form-buttons button`, { hasText: 'Save' }).click();
  await page.waitForSelector(win, { state: 'detached', timeout: 5000 });
  const after = await page.locator(`${popup} .mx-data-grid__count`).textContent();
  check('datagrid forms: a new row opens in the window and is added on Save', newTitle.includes('Order') && before !== after, `${before} → ${after}`);

  // An async rule: the server turns the name down, the row waits for its answer.
  const rules = '.dg-rules';
  await page.locator(rules).scrollIntoViewIfNeeded();
  await page.waitForSelector(row(rules, 0));
  const cell = page.locator(`${row(rules, 0)} [data-field="customer"]`);
  await cell.click();
  await page.keyboard.press('F2');
  await page.keyboard.press('Control+a');
  await page.keyboard.type('test buyer');
  await page.keyboard.press('Enter');
  const busy = await cell.getAttribute('aria-busy');
  await page.waitForFunction((c) => document.querySelector(c)?.getAttribute('aria-invalid') === 'true', `${row(rules, 0)} [data-field="customer"]`, { timeout: 5000 });
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);
  const stays = await page.evaluate(() => document.activeElement.closest('[role="row"]')?.getAttribute('aria-rowindex'));
  check('datagrid forms: an async rule marks the cell busy, then its message keeps the row', busy === 'true' && stays === '2', `${busy} · ${stays}`);
  await page.keyboard.press('Escape');

  // axe over the page with the form open, light and dark.
  await page.locator(form).scrollIntoViewIfNeeded();
  await page.locator(`${row(form, 0)} [data-field="customer"]`).click();
  await page.keyboard.press('Enter');
  await page.waitForSelector(formRow);
  await page.addScriptTag({ content: axeSource });
  const found = [];
  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    await page.waitForTimeout(300);
    const v = await page.evaluate(async () => (await window.axe.run(document.querySelector('main') ?? document.body)).violations.map((x) => `${x.id}: ${x.nodes.length}`));
    found.push(...v.map((x) => `${theme} ${x}`));
  }
  await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
  check('datagrid forms: axe clean with the form open, light and dark', found.length === 0, found.join('; '));
  await page.keyboard.press('Escape');
}
