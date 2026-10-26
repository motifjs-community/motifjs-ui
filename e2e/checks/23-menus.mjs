/** Real-browser checks of the MenuBar and ContextMenu page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'menus', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const bar = page.getByRole('menubar', { name: 'Main' });
  const top = (name) => bar.getByRole('menuitem', { name, exact: true });
  const focused = () => page.evaluate(() => document.activeElement?.querySelector('[class$="__label"]')?.textContent ?? document.activeElement?.textContent);
  const openMenus = () => page.locator('.mx-popup:popover-open').count();
  const log = page.locator('.mb-log');

  await top('Edit').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  check('the menu bar is one Tab stop, back on the item used last', (await focused()) === 'Edit');
  await page.keyboard.press('ArrowLeft');
  check('Left and Right move along the bar', (await focused()) === 'File');

  await page.keyboard.press('Alt+v');
  check('Alt + an access key opens that menu on its first item', (await top('View').getAttribute('aria-expanded')) === 'true' && (await focused()) === 'Word wrap');
  await page.keyboard.press('ArrowLeft');
  check('Left in an open menu opens the one before it', (await top('Edit').getAttribute('aria-expanded')) === 'true' && (await focused()) === 'Undo' && (await openMenus()) === 1);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowRight');
  const theme = page.getByRole('menuitem', { name: 'Theme' });
  const [parent, sub] = [await box(theme), await box(page.locator('.mx-popup:popover-open').last())];
  check('Right opens a submenu beside its item, focus inside', (await focused()) === 'Light' && sub.left >= parent.right - 1 && (await openMenus()) === 2);
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with a menu and its submenu open', violations.length === 0, violations.join(', '));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  check('a radio item of a submenu is chosen and the menus close', (await page.locator('.mb-view').textContent()).includes('theme dark') && (await openMenus()) === 0);
  check('…and focus goes back to the bar', (await focused()) === 'View');
  await page.keyboard.press('ArrowDown');
  const radios = await page.getByRole('menuitemradio').evaluateAll((els) => els.map((e) => `${e.textContent}:${e.getAttribute('aria-checked')}`));
  check('zoom items are radios, one checked', radios.join() === '100%:true,125%:false,150%:false', radios.join());
  const wrap = page.getByRole('menuitemcheckbox', { name: 'Word wrap' });
  check('a check item says it is checked', (await wrap.getAttribute('aria-checked')) === 'true');
  await page.keyboard.press('Escape');
  check('Escape closes the menu back to its top item', (await openMenus()) === 0 && (await focused()) === 'View');

  await top('File').click();
  check('a click opens a menu', (await openMenus()) === 1 && (await top('File').getAttribute('aria-expanded')) === 'true');
  const shortcut = await page.getByRole('menuitem', { name: /^New/ }).locator('.mx-menu__shortcut').textContent();
  check('shortcuts show at the end of their items', shortcut === 'Ctrl+N');
  await top('Edit').hover();
  check('pointing at another top item opens its menu instead', (await top('Edit').getAttribute('aria-expanded')) === 'true' && (await top('File').getAttribute('aria-expanded')) === 'false');
  await top('File').hover();
  await page.getByRole('menuitem', { name: 'Open recent' }).hover();
  await page.waitForTimeout(450);
  check('resting on an item with a submenu opens it', (await openMenus()) === 2);
  await page.getByRole('menuitem', { name: 'notes.md' }).click();
  check('a click in the submenu runs it and closes everything', (await log.textContent()) === 'Open notes.md' && (await openMenus()) === 0);

  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  await top('File').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowLeft');
  const recent = await box(page.getByRole('menuitem', { name: 'Open recent' }));
  const rtlSub = await box(page.locator('.mx-popup:popover-open').last());
  check('right to left, Left opens a submenu on the left', (await openMenus()) === 2 && rtlSub.right <= recent.left + 1, `${rtlSub.right} vs ${recent.left}`);
  await page.keyboard.press('ArrowRight');
  check('…and Right closes it', (await openMenus()) === 1 && (await focused()) === 'Open recent');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));

  const context = page.locator('section[aria-labelledby="context"]');
  const rows = context.locator('li');
  const row = rows.nth(1);
  await context.scrollIntoViewIfNeeded();
  // The page may scroll smoothly: let it end before measuring the row.
  await page.waitForTimeout(600);
  const at = await box(row);
  await row.click({ button: 'right', position: { x: 30, y: 8 } });
  const menu = page.locator('.mx-popup:popover-open');
  const place = await box(menu);
  check('a right-click opens the menu at the pointer', Math.abs(place.left - (at.left + 30)) < 3 && place.top >= at.top + 8 && place.top < at.top + 20, `${place.left},${place.top} vs ${at.left + 30},${at.top + 8}`);
  const rename = page.getByRole('menuitem', { name: 'Rename' });
  check('onOpening builds the items for the row (a locked file cannot be renamed)', (await rename.getAttribute('aria-disabled')) === 'true');
  const rowTop = (await box(row)).top;
  await page.mouse.wheel(0, 40);
  await page.waitForTimeout(150);
  const moved = (await box(row)).top - rowTop;
  const followed = (await box(menu)).top - place.top;
  check('scrolling takes the menu along with its row', (await openMenus()) === 1 && moved < -10 && Math.abs(followed - moved) < 2, `row ${moved}, menu ${followed}`);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  check('…and closes it once the row is out of sight', (await openMenus()) === 0);

  await rows.first().focus();
  await page.keyboard.press('Shift+F10');
  check('Shift+F10 opens it at the focused row, on the first item', (await openMenus()) === 1 && (await focused()) === 'Open');
  await page.keyboard.press('s');
  check('choosing an item acts on that row', (await rows.first().textContent()).startsWith('★') === false);
  check('…and focus goes back to the row', await rows.first().evaluate((el) => document.activeElement === el));
  await page.keyboard.press('ContextMenu');
  check('the Menu key opens it too', (await openMenus()) === 1);
  await page.keyboard.press('Escape');
  check('Escape closes it, focus back on the row', (await openMenus()) === 0 && (await rows.first().evaluate((el) => document.activeElement === el)));
  await context.locator('ul').click({ button: 'right', position: { x: 4, y: 4 } });
  check('outside a row the menu is canceled', (await openMenus()) === 0);

  const zone = context.locator('.cm-zone');
  await zone.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Say where' }).click();
  check('attachContextMenu builds its items from the opening', (await zone.textContent()).includes('with the pointer'));
}
