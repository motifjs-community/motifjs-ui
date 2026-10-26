/** Real-browser checks of the TabDocumentManager page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'tabdocs', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const selected = (scope) => scope.locator('[role="tab"][aria-selected="true"] .mx-tabdocs__title').allTextContents();
  const names = (scope) => scope.locator('[role="tab"] .mx-tabdocs__title').allTextContents();

  // Open, activate, close.
  const code = page.locator('section[aria-labelledby="code"]');
  const docs = code.locator('.mx-tabdocs');
  const state = code.locator('.td-state');
  await docs.getByRole('tab', { name: 'Page 2' }).waitFor();
  check('opens the documents made in code', JSON.stringify(await names(docs)) === '["Page 1","Page 2"]', (await names(docs)).join(', '));
  await code.getByRole('button', { name: 'Open', exact: true }).click();
  check('Open adds a tab after the active one and shows it', JSON.stringify(await selected(docs)) === '["Page 3"]' && (await docs.locator('[role="tabpanel"]:visible').textContent()).includes('Page 3'));
  await docs.getByRole('tab', { name: 'Page 1' }).click();
  check('a click activates a tab', JSON.stringify(await selected(docs)) === '["Page 1"]' && (await state.textContent()).endsWith('active: Page 1'));
  await code.getByRole('button', { name: 'Close active' }).click();
  check('closing the active tab activates the one used before', JSON.stringify(await names(docs)) === '["Page 2","Page 3"]' && JSON.stringify(await selected(docs)) === '["Page 3"]', await state.textContent());
  check('…and the events report it', (await code.locator('.td-log li').first().textContent()) === 'active: Page 3');

  // Split, and the splitter by the keys.
  await code.getByRole('button', { name: 'Split right' }).first().click();
  const groups = docs.locator('.mx-tabdocs__group');
  check('Split right opens a second group with the active document', (await groups.count()) === 2 && JSON.stringify(await names(groups.nth(1))) === '["Page 3"]');
  const [g1, g2] = [await box(groups.nth(0)), await box(groups.nth(1))];
  check('the two groups share the width', Math.abs(g1.width - g2.width) <= 2 && g2.left > g1.right - 1, `${g1.width} / ${g2.width}`);
  const sash = docs.getByRole('separator');
  check('the splitter is a separator with a value', (await sash.getAttribute('aria-valuenow')) === '50' && (await sash.getAttribute('aria-orientation')) === 'vertical');
  await sash.focus();
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  const wider = await box(groups.nth(0));
  check('Right moves the splitter by the step', Math.abs(wider.width - g1.width - 30) <= 2 && Number(await sash.getAttribute('aria-valuenow')) > 50, `${g1.width} → ${wider.width}`);
  await page.keyboard.press('End');
  const widest = await box(groups.nth(1));
  check('End stops at the smallest size of the other group', Math.abs(widest.width - 160) <= 1, String(widest.width));
  await sash.dblclick();
  const even = await box(groups.nth(0));
  check('a double click evens the sizes', Math.abs(even.width - g1.width) <= 2, String(even.width));

  // Keys.
  await docs.getByRole('tab', { name: 'Page 2' }).click();
  await page.keyboard.press('Control+2');
  check('Ctrl+2 focuses the second group', await groups.nth(1).evaluate((g) => g.contains(document.activeElement)));
  await page.keyboard.press('Control+1');
  check('Ctrl+1 goes back to the first, where focus was', await docs.getByRole('tab', { name: 'Page 2' }).evaluate((t) => document.activeElement === t));
  await code.getByRole('button', { name: 'Open', exact: true }).click();
  await docs.getByRole('tab', { name: 'Page 4' }).click();
  await page.keyboard.press('Control+PageDown');
  check('Ctrl+PageDown goes round to the first tab', JSON.stringify(await selected(groups.nth(0))) === '["Page 2"]');
  await page.keyboard.press('ArrowRight');
  check('Right moves along the strip and activates', JSON.stringify(await selected(groups.nth(0))) === '["Page 4"]' && (await docs.getByRole('tab', { name: 'Page 4' }).evaluate((t) => document.activeElement === t)));
  await page.keyboard.press('Control+\\');
  check('Ctrl+\\ splits the group, the active document going along', (await groups.count()) === 3 && JSON.stringify(await names(groups.nth(1))) === '["Page 4"]');
  await docs.getByRole('tab', { name: 'Page 4' }).focus();
  await page.keyboard.press('Delete');
  check('Delete closes the focused tab; its empty group closes', (await groups.count()) === 2 && (await docs.getByRole('tab', { name: 'Page 4' }).count()) === 0);
  check('…and focus stays in the manager', await docs.evaluate((m) => m.contains(document.activeElement)));

  // Maximize and restore.
  await code.getByRole('button', { name: 'Maximize group' }).first().click();
  const hidden = await groups.evaluateAll((all) => all.map((g) => g.hidden));
  check('Maximize hides the other groups', hidden.filter(Boolean).length === 1 && (await box(docs)).width - (await box(groups.locator('visible=true').first())).width < 3);
  await code.getByRole('button', { name: 'Restore groups' }).first().click();
  check('Restore shows them again', (await groups.evaluateAll((all) => all.filter((g) => g.hidden).length)) === 0);

  // Dragging a splitter.
  const overview = page.locator('section[aria-labelledby="overview"] .mx-tabdocs');
  const ovSash = overview.getByRole('separator');
  const ovGroup = overview.locator('.mx-tabdocs__group').first();
  await ovSash.scrollIntoViewIfNeeded();
  const before = await box(ovGroup);
  const s = await box(ovSash);
  await page.mouse.move(s.left + s.width / 2, s.top + 100);
  await page.mouse.down();
  await page.mouse.move(s.left + s.width / 2 - 60, s.top + 100, { steps: 4 });
  await page.mouse.up();
  const after = await box(ovGroup);
  check('dragging the splitter resizes the groups', Math.abs(before.width - after.width - 60) <= 2, `${before.width} → ${after.width}`);
  check('a grid in a tab fills its panel', (await box(overview.locator('.mx-data-grid'))).height > 300);
  const strip = overview.locator('[role="tablist"]').first();
  const fits = await strip.evaluate((list) => {
    const room = list.getBoundingClientRect();
    const tab = list.querySelector('[aria-selected="true"]').getBoundingClientRect();
    return { overflow: list.scrollWidth > list.clientWidth, inSight: tab.left >= room.left - 1 && tab.right <= room.right + 1 };
  });
  check('tabs that do not fit scroll, the active one in sight', fits.overflow && fits.inSight, JSON.stringify(fits));
  await overview.getByRole('tab', { name: 'Orders' }).hover();
  const tip = page.getByRole('tooltip');
  await tip.waitFor({ timeout: 3000 }).catch(() => {});
  check('a tab with no tooltip and no description shows none', (await tip.count()) === 0);
  await overview.getByRole('tab', { name: /Ada Lovelace/ }).hover();
  await tip.waitFor({ timeout: 3000 });
  check('…the title and the description', (await tip.textContent()) === 'Ada Lovelace — Customers', await tip.textContent());
  await page.mouse.move(0, 0);

  // Unsaved changes.
  const unsaved = page.locator('section[aria-labelledby="unsaved"]');
  const grace = unsaved.getByRole('tab', { name: /Grace Hopper/ });
  await grace.click();
  await unsaved.getByRole('textbox', { name: 'City' }).fill('Boston');
  check('an edit marks the tab dirty', (await grace.getAttribute('data-dirty')) !== null && (await grace.textContent()).includes('unsaved changes'));
  await grace.hover();
  await grace.locator('.mx-tabdocs__close').click();
  const ask = page.getByRole('alertdialog');
  await ask.waitFor();
  await ask.getByRole('button', { name: 'Cancel' }).click();
  check('closing it asks; Cancel keeps it', (await unsaved.getByRole('tab', { name: /Grace Hopper/ }).count()) === 1);
  await grace.focus();
  await page.keyboard.press('Delete');
  await ask.waitFor();
  await ask.getByRole('button', { name: 'OK' }).click();
  await ask.waitFor({ state: 'detached' });
  check('…OK closes it', (await unsaved.getByRole('tab', { name: /Grace Hopper/ }).count()) === 0);

  // Save and restore.
  const saving = page.locator('section[aria-labelledby="layout"]');
  const saved = saving.locator('.mx-tabdocs');
  const layoutOf = () => saved.locator('.mx-tabdocs__group').evaluateAll((all) => all.map((g) => [...g.querySelectorAll('.mx-tabdocs__title')].map((t) => t.textContent).join('+')).join(' | '));
  const first = await layoutOf();
  check('the saved layout is JSON', JSON.parse(await saving.locator('.td-json').textContent()).version === 1);
  await saved.getByRole('tab', { name: 'Notes' }).locator('.mx-tabdocs__close').click();
  await saved.getByRole('tab', { name: 'To do' }).click();
  await saved.getByRole('button', { name: 'Split right' }).first().click();
  check('the layout changed', (await layoutOf()) !== first, await layoutOf());
  await saving.getByRole('button', { name: 'Restore layout' }).click();
  check('Restore layout brings back the saved one', (await layoutOf()) === first, `${first} vs ${await layoutOf()}`);
  check('…with the grid made again by its type', (await saved.locator('.mx-data-grid').count()) === 1);

  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    await page.waitForTimeout(200);
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
    check(`axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
  }
  await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
}
