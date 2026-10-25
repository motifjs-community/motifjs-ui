/** Real-browser checks of the toolbar page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'toolbar', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const ways = page.locator('section[aria-labelledby="ways"]');
  const editor = ways.getByRole('toolbar', { name: 'Format' });
  const focusedName = () => page.evaluate(() => document.activeElement?.getAttribute('title') || document.activeElement?.textContent?.trim());

  await editor.getByRole('button', { name: 'Redo' }).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  check('Tab comes back to the control used last', (await focusedName()) === 'Redo');
  const tabStops = await editor.evaluate((el) => [...el.querySelectorAll('button')].filter((b) => b.tabIndex === 0 && b.checkVisibility()).length);
  check('the toolbar is one Tab stop', tabStops === 1, String(tabStops));
  await page.keyboard.press('ArrowRight');
  check('Right moves to the next control, past the separator', (await focusedName()) === 'Bold');
  await page.keyboard.press('End');
  check('End goes to the last control', (await focusedName()) === 'Publish');
  await page.keyboard.press('ArrowRight');
  check('…and Right wraps to the first', (await focusedName()) === 'Undo');
  await page.keyboard.press('Tab');
  check('Tab leaves the toolbar', !(await editor.evaluate((el) => el.contains(document.activeElement))));

  const preview = ways.locator('p').last();
  const weight = () => preview.evaluate((el) => getComputedStyle(el).fontWeight);
  const bold = editor.getByRole('button', { name: 'Bold' });
  const before = await weight();
  await bold.click();
  check('a toggle item follows the state its click changes', (await bold.getAttribute('aria-pressed')) === 'false' && (await weight()) !== before);
  await editor.getByRole('button', { name: 'Center' }).click();
  const pressed = await editor.evaluate((el) => ['Align left', 'Center', 'Align right'].map((n) => el.querySelector(`[title="${n}"]`).getAttribute('aria-pressed')));
  check('one button of the alignment group is pressed', pressed.join() === 'false,true,false', pressed.join());
  check('…and the text is centered', (await preview.evaluate((el) => getComputedStyle(el).textAlign)) === 'center');

  const insert = editor.getByRole('button', { name: 'Insert' });
  await insert.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowRight');
  const sub = await page.evaluate(() => {
    const item = document.activeElement;
    const parent = [...document.querySelectorAll('.mx-menu__item')].find((i) => i.getAttribute('aria-expanded') === 'true');
    return { text: item?.textContent, parent: parent?.textContent, side: item?.closest('.mx-popup')?.dataset.side, right: parent?.getBoundingClientRect().right, left: item?.closest('.mx-popup')?.getBoundingClientRect().left };
  });
  check('Right opens a submenu at the side of its item', sub.text === '2 × 2' && sub.parent?.startsWith('Table') && sub.side === 'end' && sub.left >= sub.right - 1, JSON.stringify(sub));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  check('choosing in the submenu runs the item and closes the menus', (await page.locator('.tb-log').textContent()) === 'Insert a 3 × 3 table' && (await page.locator('.mx-popup:popover-open').count()) === 0);
  check('…and focus is back on the menu button', (await focusedName()) === 'Insert');

  const overflow = page.locator('section[aria-labelledby="overflow"]');
  const narrow = overflow.getByRole('toolbar');
  await overflow.getByRole('button', { name: '45%' }).click();
  await page.waitForTimeout(150);
  const more = narrow.getByRole('button', { name: 'More options' });
  const fit = await narrow.evaluate((el) => {
    const room = el.getBoundingClientRect();
    const shown = [...el.children].filter((c) => c.checkVisibility());
    return { inside: shown.every((c) => c.getBoundingClientRect().right <= room.right + 0.5), scroll: el.scrollWidth <= el.clientWidth, hidden: el.querySelectorAll(':scope > [data-overflowed]').length };
  });
  check('a narrow toolbar keeps what fits and moves the rest out', fit.inside && fit.scroll && fit.hidden > 0, JSON.stringify(fit));
  check('…into a “more” button at its end', await more.isVisible());
  check('…while an item marked never stays in the bar', await narrow.getByRole('button', { name: 'Publish' }).isVisible());
  await more.click();
  const moved = await page.evaluate(() => [...document.querySelectorAll('.mx-popup:popover-open .mx-menu__item')].map((i) => [i.querySelector('.mx-menu__label').textContent, i.getAttribute('role'), i.getAttribute('aria-checked')]));
  const center = moved.find(([name]) => name === 'Center');
  check('the “more” menu names icon-only items and shows toggles as checks', !!center && center[1] === 'menuitemcheckbox' && center[2] === 'true', JSON.stringify(moved));
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with the “more” menu open', violations.length === 0, violations.join(', '));
  await page.getByRole('menuitemcheckbox', { name: 'Align right' }).click();
  check('an item chosen in the “more” menu acts like the button', (await preview.evaluate((el) => getComputedStyle(el).textAlign)) === 'right');
  await overflow.getByRole('button', { name: '100%' }).click();
  await page.waitForTimeout(150);
  check('given room again, the items come back and the “more” button goes', !(await more.isVisible()) && (await narrow.evaluate((el) => el.querySelectorAll(':scope > [data-overflowed]').length)) === 0);
  await overflow.getByRole('button', { name: '45%' }).click();
  await overflow.getByRole('button', { name: 'wrap', exact: true }).click();
  await page.waitForTimeout(150);
  const wrapped = await box(narrow);
  check('wrap puts the items on more rows instead', wrapped.height > 60 && !(await more.isVisible()), String(wrapped.height));

  const look = page.locator('section[aria-labelledby="look"]');
  const find = look.getByRole('toolbar', { name: 'Find' });
  await find.getByRole('button', { name: 'Previous' }).focus();
  await page.keyboard.press('ArrowRight');
  const input = find.getByRole('textbox');
  await page.keyboard.type('abc');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Home');
  check('a text field keeps the arrows and Home for its text', await input.evaluate((el) => document.activeElement === el && el.selectionStart === 0));
  await look.getByRole('button', { name: 'Vertical' }).click();
  const tools = look.getByRole('toolbar', { name: 'Tools' });
  await tools.getByRole('button', { name: 'Undo' }).focus();
  await page.keyboard.press('ArrowDown');
  const [first, second] = [await box(tools.getByRole('button', { name: 'Undo' })), await box(tools.getByRole('button', { name: 'Redo' }))];
  check('a vertical toolbar is a column moved with Down', (await focusedName()) === 'Redo' && second.top > first.top && Math.abs(second.left - first.left) < 1);
}
