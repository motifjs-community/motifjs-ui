/** Real-browser checks of the TabDocumentManager's Tabs and Menus and keys pages. */
export default async function ({ page, base, check, axeSource, box }) {
  const names = (scope) => scope.locator('[role="tab"] .mx-tabdocs__title').allTextContents();
  const selected = (scope) => scope.locator('[role="tab"][aria-selected="true"] .mx-tabdocs__title').allTextContents();
  const popup = page.locator('.mx-popup:popover-open');
  // An item's name ends with its key, when it has one.
  const menuItem = (name) => popup.getByRole('menuitem', { name: new RegExp(`^${name}( |$)`) });
  const choose = (name) => menuItem(name).click();
  const axe = async (label) => {
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await page.waitForTimeout(200);
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
      check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  };

  await page.goto(base + 'tabdocs/tabs', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));

  // Preview tabs.
  const preview = page.locator('section[aria-labelledby="preview"]');
  const pDocs = preview.locator('.mx-tabdocs');
  const files = preview.getByRole('listbox', { name: 'Files' });
  await files.getByRole('option', { name: 'src/index.ts' }).click();
  await files.getByRole('option', { name: 'src/app.ts' }).click();
  check('a preview takes the place of the one before', JSON.stringify(await names(pDocs)) === '["app.ts"]', (await names(pDocs)).join(', '));
  const appTab = pDocs.getByRole('tab', { name: /app\.ts/ });
  check('…shown in italics', (await appTab.locator('.mx-tabdocs__title').evaluate((t) => getComputedStyle(t).fontStyle)) === 'italic');
  await appTab.dblclick();
  check('a double click keeps it', (await appTab.getAttribute('data-preview')) === null && (await appTab.locator('.mx-tabdocs__title').evaluate((t) => getComputedStyle(t).fontStyle)) === 'normal');
  await files.getByRole('option', { name: 'src/router.ts' }).click();
  await files.getByRole('option', { name: 'README.md' }).click();
  check('…then the next previews open beside it, one at a time', JSON.stringify(await names(pDocs)) === '["app.ts","README.md"]', (await names(pDocs)).join(', '));
  await preview.getByRole('button', { name: 'Keep open' }).click();
  check('Keep open keeps the preview and the event says so', (await preview.locator('.td-state').textContent()).includes('kept: README.md, app.ts'), await preview.locator('.td-state').textContent());

  // Pinning, compact and on a row of their own.
  const pinning = page.locator('section[aria-labelledby="pinning"]');
  const pin = pinning.locator('.mx-tabdocs');
  const pinned = pin.locator('.mx-tabdocs__pinned [role="tab"]');
  check('pinned tabs come first, with a pin mark and no close button', (await pinned.count()) === 2 && (await pinned.first().locator('.mx-tabdocs__pin').isVisible()) && !(await pinned.first().locator('.mx-tabdocs__close').isVisible()));
  await pinning.getByRole('radio', { name: 'Compact' }).check();
  await page.waitForTimeout(100);
  const compact = await box(pinned.first());
  const label = await pinned.first().locator('.mx-tabdocs__title').evaluate((t) => t.getBoundingClientRect().width);
  check('compact pinned tabs show only their icon, the title kept for screen readers', compact.width < 48 && label <= 1 && (await pinned.first().getAttribute('aria-selected')) !== null, `${compact.width} / ${label}`);
  check('…and keep their name', /README\.md/.test(await pinned.first().textContent()));
  await pinning.getByRole('switch', { name: 'Row of their own' }).check();
  await pin.and(page.locator('[data-pinned-row]')).waitFor();
  await page.waitForTimeout(100);
  const [pinRow, rest] = await pin.evaluate((m) => ['.mx-tabdocs__pinned', '.mx-tabdocs__row'].map((s) => m.querySelector(s).getBoundingClientRect().toJSON()));
  check('a row of their own sits above the others', pinRow.bottom <= rest.top + 1 && rest.width > pinRow.width / 2, `${pinRow.bottom} / ${rest.top}`);
  await pinning.getByRole('radio', { name: 'Normal' }).check();
  await pinning.getByRole('switch', { name: 'Row of their own' }).uncheck();
  await pin.getByRole('tab', { name: /vite\.config\.ts/ }).click();
  await page.keyboard.press('Control+k');
  await page.keyboard.press('Shift+Enter');
  check('Ctrl+K Shift+Enter pins the active tab, after the others pinned', JSON.stringify((await names(pin)).slice(0, 3)) === '["README.md","package.json","vite.config.ts"]', (await names(pin)).join(', '));
  await pin.getByRole('tab', { name: /package\.json/ }).locator('.mx-tabdocs__pin').click();
  check('the pin mark unpins: the tab becomes the first of the others', JSON.stringify((await names(pin)).slice(0, 3)) === '["README.md","vite.config.ts","package.json"]', (await names(pin)).join(', '));
  await pinning.getByRole('button', { name: 'Close all' }).click();
  check('close all leaves the pinned tabs', JSON.stringify(await names(pin)) === '["README.md","vite.config.ts"]', (await names(pin)).join(', '));

  // Sizes, overflow and wrapping.
  const sizing = page.locator('section[aria-labelledby="sizing"]');
  const sDocs = sizing.locator('.mx-tabdocs');
  const row = sDocs.locator('.mx-tabdocs__row');
  check('tabs that do not fit scroll, with scroll buttons', (await row.evaluate((r) => r.scrollWidth > r.clientWidth)) && (await sDocs.locator('.mx-tabdocs__scroll').first().isVisible()));
  const before = await row.evaluate((r) => r.scrollLeft);
  await sDocs.locator('.mx-tabdocs__scroll[data-direction="back"]').click();
  await page.waitForTimeout(400);
  check('the back button scrolls the strip', (await row.evaluate((r) => r.scrollLeft)) < before);
  await sizing.getByRole('radio', { name: 'Fixed' }).check();
  await page.waitForTimeout(100);
  const widths = await sDocs.locator('[role="tab"]').evaluateAll((tabs) => tabs.map((t) => Math.round(t.getBoundingClientRect().width)));
  check('fixed: every tab the same width', new Set(widths).size === 1, widths.join(','));
  await sizing.getByRole('radio', { name: 'Fit' }).check();
  await sizing.getByRole('switch', { name: 'More rows' }).check();
  await page.waitForTimeout(100);
  const tops = await sDocs.locator('[role="tab"]').evaluateAll((tabs) => [...new Set(tabs.map((t) => Math.round(t.getBoundingClientRect().top)))]);
  check('wrapping puts the tabs on more rows, none hidden', tops.length >= 2 && (await row.evaluate((r) => r.scrollWidth <= r.clientWidth + 1)), tops.join(','));
  check('…and the scroll buttons go', !(await sDocs.locator('.mx-tabdocs__scroll').first().isVisible()));

  // Badges, tones, descriptions.
  const look = page.locator('section[aria-labelledby="look"]');
  const lDocs = look.locator('.mx-tabdocs');
  check('a description shows only for equal titles', (await lDocs.locator('.mx-tabdocs__description').allTextContents()).join() === 'src,src/orders');
  check('a tone colours the badge', (await lDocs.getByRole('tab', { name: /Build/ }).getAttribute('data-tone')) === 'danger');

  // The same document in two groups.
  const dup = page.locator('section[aria-labelledby="duplicates"]');
  const dDocs = dup.locator('.mx-tabdocs');
  check('a copy opens in the second group', (await dDocs.locator('.mx-tabdocs__group').count()) === 2 && (await dup.locator('.td-state').textContent()).startsWith('2 tab(s) for 1 document'));
  const cities = dDocs.getByRole('textbox', { name: 'City' });
  await cities.first().fill('Paris');
  check('each copy has a form of its own over the same data', (await cities.nth(1).inputValue()) === 'Paris');
  check('…and both tabs show the unsaved changes', (await dDocs.locator('[role="tab"][data-dirty]').count()) === 2);
  await dup.getByRole('button', { name: 'Save' }).click();
  await dup.getByRole('switch', { name: 'Allow two copies' }).uncheck();
  await dup.getByRole('button', { name: 'Split the active group' }).click();
  check('without copies, splitting moves the document: no third copy', (await dDocs.locator('[role="tab"]').count()) === 2, await dup.locator('.td-state').textContent());

  await axe('Tabs');

  // Menus and keys.
  await page.goto(base + 'tabdocs/menus', { waitUntil: 'load' });
  const menus = page.locator('section[aria-labelledby="context-menus"]');
  const mDocs = menus.locator('.mx-tabdocs');
  await mDocs.getByRole('tab', { name: /app\.ts/ }).click({ button: 'right' });
  await popup.waitFor();
  check('a tab has a context menu, with the app\'s own item last', (await popup.getByRole('menuitem').last().textContent()).includes('Show the path'));
  await choose('Close others');
  check('Close others closes the others', JSON.stringify(await names(mDocs)) === '["app.ts"]', (await names(mDocs)).join(', '));
  await mDocs.getByRole('tab', { name: /app\.ts/ }).focus();
  await page.keyboard.press('Shift+F10');
  await popup.waitFor();
  check('Shift+F10 opens it from the keyboard, on the first item', (await popup.getByRole('menuitem').first().evaluate((i) => i === document.activeElement)));
  await page.keyboard.press('Escape');
  // The empty end of the strip.
  const emptyStrip = async () => ({ position: { x: (await box(mDocs.locator('.mx-tabdocs__row').first())).width - 8, y: 10 } });
  await mDocs.locator('.mx-tabdocs__row').first().dblclick(await emptyStrip());
  check('a double click on the empty strip makes a new document', JSON.stringify(await names(mDocs)) === '["app.ts","Untitled-1"]', (await names(mDocs)).join(', '));
  await mDocs.locator('.mx-tabdocs__row').first().click({ button: 'right', ...(await emptyStrip()) });
  await popup.waitFor();
  check('the strip has its own menu', (await popup.getByRole('menuitem').first().textContent()).includes('New document'));
  await choose('Split right');
  check('…whose commands work', (await mDocs.locator('.mx-tabdocs__group').count()) === 2);
  await menus.getByRole('switch', { name: 'Copy the title' }).uncheck();
  await mDocs.getByRole('tab', { name: /app\.ts/ }).click({ button: 'right' });
  await popup.waitFor();
  check('menuItems leaves a built-in item out', (await menuItem('Copy the title').count()) === 0 && (await menuItem('Pin').count()) === 1);
  await page.keyboard.press('Escape');

  // The open documents list.
  const open = page.locator('section[aria-labelledby="open-list"]');
  const oDocs = open.locator('.mx-tabdocs');
  await oDocs.locator('.mx-tabdocs__group').first().getByRole('button', { name: 'Open documents' }).click();
  await popup.waitFor();
  const list = popup.getByRole('listbox', { name: 'Open documents' });
  check('the "…" button lists the group\'s documents', (await list.getByRole('option').count()) === 5);
  check('…with what tells them apart and their unsaved changes', (await list.getByRole('option', { name: /app\.ts.*unsaved changes/ }).count()) === 1);
  await page.keyboard.type('route');
  await page.waitForTimeout(100);
  check('typing searches it', (await list.getByRole('option').count()) === 1);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  check('Enter opens the document and closes the list', JSON.stringify(await selected(oDocs.locator('.mx-tabdocs__group').first())) === '["router.ts"]' && (await popup.count()) === 0);
  check('the active document\'s own button shows', (await oDocs.locator('.mx-tabdocs__group').first().getByRole('button', { name: 'Format' }).count()) === 1);
  await oDocs.locator('.mx-tabdocs__group').first().getByRole('button', { name: 'Run group 1' }).click();
  check('the app\'s button runs', (await open.locator('.td-state').textContent()).startsWith('runs: 1'));

  // Recently used, back, reopen.
  const recent = page.locator('section[aria-labelledby="recent"]');
  const rDocs = recent.locator('.mx-tabdocs');
  const left = rDocs.locator('.mx-tabdocs__group').first();
  await left.getByRole('tab', { name: /index\.ts/ }).first().click();
  await left.getByRole('tab', { name: /router\.ts/ }).click();
  await left.getByRole('tab', { name: /orders\.ts/ }).click();
  await page.keyboard.down('Control');
  await page.keyboard.press('e');
  await popup.waitFor();
  const rList = popup.getByRole('listbox', { name: 'Recently used documents' });
  const highlighted = () => rList.evaluate((l) => document.getElementById(l.getAttribute('aria-activedescendant'))?.textContent ?? '');
  check('Ctrl+E opens the recent list on the document used before', (await highlighted()).startsWith('router.ts') && (await rList.evaluate((l) => l === document.activeElement)), await highlighted());
  await page.keyboard.press('e');
  check('…E again walks on', (await highlighted()).startsWith('index.ts'), await highlighted());
  await page.keyboard.up('Control');
  await page.waitForTimeout(100);
  check('letting go of Ctrl opens it', JSON.stringify(await selected(left)) === '["index.ts"]' && (await popup.count()) === 0);
  await page.keyboard.press('Alt+ArrowLeft');
  check('Alt+Left goes back', JSON.stringify(await selected(left)) === '["orders.ts"]', (await selected(left)).join());
  await left.getByRole('tab', { name: /orders\.ts/ }).focus();
  await page.keyboard.press('Delete');
  check('a closed document…', (await left.getByRole('tab', { name: /orders\.ts/ }).count()) === 0);
  await page.keyboard.press('Control+Alt+Shift+T');
  check('…comes back with Ctrl+Alt+Shift+T, where it was', (await left.getByRole('tab', { name: /orders\.ts/ }).count()) === 1 && JSON.stringify(await selected(left)) === '["orders.ts"]');

  // Locked groups.
  const locked = page.locator('section[aria-labelledby="locked"]');
  const kDocs = locked.locator('.mx-tabdocs');
  await locked.getByRole('button', { name: 'Open a note' }).click();
  check('a document opened without a group skips the locked one', (await kDocs.getByRole('group', { name: 'Group 1, locked' }).count()) === 1 && JSON.stringify(await names(kDocs.locator('.mx-tabdocs__group').nth(1))) === '["Note 1"]');
  await locked.getByRole('button', { name: 'Lock group 2' }).click();
  await locked.getByRole('button', { name: 'Open a note' }).click();
  check('when every group is locked a new one opens', (await kDocs.locator('.mx-tabdocs__group').count()) === 3);
  await kDocs.getByRole('button', { name: 'Unlock group' }).first().click();
  check('the lock mark unlocks', (await kDocs.getByRole('group', { name: 'Group 1, locked' }).count()) === 0);

  await axe('Menus and keys');
}
