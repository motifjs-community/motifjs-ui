/** Real-browser checks of the ActionSheet page: choosing, a submenu in place, the keys, cancel, a ContextMenu opening its items in a sheet for a finger, axe. */
export default async function ({ page, base, check, axeSource }) {
  const section = (anchor) => page.locator(`section[aria-labelledby="${anchor}"]`);
  const axe = async (label) => {
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await page.waitForTimeout(150);
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
      check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  };
  const settle = () => page.waitForTimeout(450);
  const open = () => page.locator('.mx-action-sheet[data-open]');
  const names = () => open().locator('.mx-menu__item .mx-menu__label').allTextContents();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + 'actionsheet', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const choose = section('choose');
  await choose.scrollIntoViewIfNeeded();
  await choose.getByRole('button', { name: 'Actions…' }).click();
  await settle();
  const look = await page.evaluate(() => {
    const sheet = document.querySelector('.mx-action-sheet[data-open]');
    const items = [...sheet.querySelectorAll('.mx-menu__item')];
    const panel = sheet.querySelector('.mx-bottom-sheet__panel').getBoundingClientRect();
    return {
      dialog: sheet.querySelector('[role="dialog"]').getAttribute('aria-labelledby') !== null,
      menu: !!sheet.querySelector('[role="menu"]'),
      height: Math.round(Math.min(...items.map((i) => i.getBoundingClientRect().height))),
      bottom: Math.round(panel.bottom),
      focus: document.activeElement?.getAttribute('role'),
      message: sheet.querySelector('.mx-action-sheet__message').textContent,
    };
  });
  check('it comes up from the bottom as a dialog holding a menu, items at least 40 high', look.dialog && look.menu && look.bottom === 900 && look.height >= 40, JSON.stringify(look));
  check('…with its message, focus on the list (opened by the pointer)', look.message.includes('09:41') && look.focus === 'menu', JSON.stringify(look));
  check('the items are the menu items', JSON.stringify(await names()) === JSON.stringify(['Share…', 'Rename…', 'Move to', 'Delete']), JSON.stringify(await names()));
  await axe('an action sheet open');
  await open().locator('.mx-menu__item', { hasText: 'Move to' }).click();
  await settle();
  check('a submenu opens in place, with a way back first', JSON.stringify(await names()) === JSON.stringify(['Back', 'Reports', 'Archive', 'Shared with me']), JSON.stringify(await names()));
  check('…focus on its first item', await page.evaluate(() => document.activeElement?.textContent === 'Back'));
  await page.keyboard.press('Enter');
  await settle();
  check('Back goes back to the menu', (await names())[2] === 'Move to');
  await page.keyboard.press('ArrowDown');
  check('the arrow keys move between items', await page.evaluate(() => document.activeElement?.textContent?.startsWith('Rename')));
  await page.keyboard.press('d');
  await settle();
  check("an item's & key chooses it, closes the sheet and resolves choose()", (await open().count()) === 0 && (await choose.locator('output').textContent()) === 'Chosen: Delete', await choose.locator('output').textContent());
  await choose.getByRole('button', { name: 'Actions…' }).click();
  await settle();
  await open().getByRole('button', { name: 'Cancel' }).click();
  await settle();
  check('Cancel closes it with no choice', (await choose.locator('output').textContent()) === 'Closed without a choice.');
  check('…focus back on its button', await page.evaluate(() => document.activeElement?.textContent === 'Actions…'));

  // In JSX: radio items, its own cancel text.
  const jsx = section('jsx');
  await jsx.scrollIntoViewIfNeeded();
  await jsx.getByRole('button', { name: /Sort by/ }).click();
  await settle();
  const radios = await open().locator('[role="menuitemradio"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-checked')));
  check('radio items show which one is chosen', JSON.stringify(radios) === JSON.stringify(['true', 'false', 'false']), JSON.stringify(radios));
  check('cancelText names the cancel button', (await open().locator('.mx-action-sheet__cancel button').textContent()) === 'Keep as it is');
  await open().locator('.mx-menu__item', { hasText: 'Name' }).click();
  await settle();
  check('choosing runs the item and onItemClick', (await jsx.getByRole('button', { name: /Sort by/ }).textContent()).includes('name') && (await jsx.locator('output').textContent()) === 'Sorted by name.');

  // A ContextMenu: the mouse gets a menu, a finger (auto) the sheet, 'sheet' always the sheet.
  const ctx = section('context-menu');
  await ctx.scrollIntoViewIfNeeded();
  const row = ctx.locator('li', { hasText: 'Invoice 1043' });
  await row.click({ button: 'right' });
  await settle();
  check('auto: a right-click opens the menu at the pointer', (await page.locator('.mx-popup:popover-open .mx-menu').count()) === 1 && (await open().count()) === 0);
  await page.keyboard.press('Escape');
  await settle();
  // A phone's long press sends a contextmenu that is a PointerEvent of a finger (desktop Chrome sends none for
  // touch); the real long press is checked on a phone.
  await row.evaluate((el) => {
    const box = el.getBoundingClientRect();
    el.dispatchEvent(new PointerEvent('contextmenu', { bubbles: true, cancelable: true, pointerType: 'touch', clientX: box.x + 40, clientY: box.y + 10 }));
  });
  await settle();
  const byFinger = (await open().count()) === 1 && JSON.stringify(await names()) === JSON.stringify(['Open Invoice 1043', 'Copy number', 'Delete']);
  check('auto: a long press of a finger opens the items in an action sheet', byFinger, JSON.stringify(await names()));
  if (byFinger) {
    await open().locator('.mx-menu__item', { hasText: 'Copy number' }).click();
    await settle();
    check('…and choosing there runs the item', (await ctx.locator('output').textContent()) === 'Copied Invoice 1043');
  }
  await ctx.getByText('Sheet', { exact: true }).click();
  await row.click({ button: 'right' });
  await settle();
  check("'sheet': even a right-click opens the sheet", (await open().count()) === 1);
  await axe('a context menu as a sheet');
  await page.keyboard.press('Escape');
  await settle();
  await row.focus();
  await page.keyboard.press('Shift+F10');
  await settle();
  check('the Menu key opens it too, focus on the first item', (await open().count()) === 1 && (await page.evaluate(() => document.activeElement?.textContent?.startsWith('Open'))));
  await page.keyboard.press('Escape');
  await settle();
  check('Escape closes it and focus goes back to the row', (await open().count()) === 0 && (await page.evaluate(() => document.activeElement?.textContent?.includes('Invoice 1043'))));
}
