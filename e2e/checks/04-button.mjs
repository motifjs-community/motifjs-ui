/** Real-browser checks of the button page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'button', { waitUntil: 'load' });
  // The density switch above left the page compact, where the edge is as thin as the border.
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const bg = (name) => page.getByRole('button', { name, exact: true }).evaluate((el) => getComputedStyle(el).backgroundColor);
  check('tones paint differently (standard vs accent solid)', (await bg('standard solid')) !== (await bg('accent solid')));
  const solidEdge = await page.getByRole('button', { name: 'standard solid', exact: true }).evaluate((el) => getComputedStyle(el).borderBottomWidth);
  check('a solid button has its bottom edge', parseFloat(solidEdge) >= 2, solidEdge);

  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  check('a toggle writes back through x-model', (await page.locator('output.bold-state').textContent()) === 'true');
  check('…and says it is pressed', (await page.getByRole('button', { name: 'Bold', exact: true }).getAttribute('aria-pressed')) === 'true');

  const send = page.getByRole('button', { name: 'Send', exact: true });
  const sendBefore = await box(send);
  await send.click();
  const sendBusy = await box(send);
  check('busy keeps the size and says so', Math.abs(sendBusy.width - sendBefore.width) < 0.5 && (await send.getAttribute('aria-busy')) === 'true', `${sendBefore.width} → ${sendBusy.width}`);
  check('…with a spinner turning', await send.locator('.mx-button__spinner').evaluate((el) => getComputedStyle(el).display === 'block' && getComputedStyle(el).animationName !== 'none'));

  await page.getByRole('button', { name: 'Toggle enabled', exact: true }).focus();
  await page.keyboard.press('Tab');
  const afterToggle = await page.evaluate(() => document.activeElement?.textContent);
  check('Tab skips a disabled button and reaches one that keeps focus', afterToggle === 'Focusable', afterToggle);
  check('…which reads as disabled', (await page.getByRole('button', { name: 'Focusable', exact: true }).getAttribute('aria-disabled')) === 'true');

  const file = page.getByRole('button', { name: 'File', exact: true });
  await file.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await page.evaluate(() => window.scrollBy(0, -160));
  await file.click();
  const menuPopup = page.locator('.mx-popup:popover-open');
  check('the menu opens in the top layer', (await menuPopup.count()) === 1);
  const [fileBox, popBox] = [await box(file), await box(menuPopup)];
  check(
    '…below the button, lined up with its start',
    popBox.top >= fileBox.bottom && popBox.top - fileBox.bottom < 10 && Math.abs(popBox.left - fileBox.left) < 2,
    JSON.stringify([fileBox.bottom, popBox.top, fileBox.left, popBox.left]),
  );
  check('…with focus on its first item', (await page.evaluate(() => document.activeElement?.textContent)) === 'New');
  await page.evaluate(() => window.scrollBy(0, 40));
  await page.waitForTimeout(100);
  const [fileScrolled, popScrolled] = [await box(file), await box(menuPopup)];
  check(
    'it follows the button when the page scrolls',
    fileScrolled.top !== fileBox.top && Math.abs(popScrolled.top - fileScrolled.bottom - (popBox.top - fileBox.bottom)) < 1,
    JSON.stringify([fileBox.bottom, popBox.top, fileScrolled.bottom, popScrolled.top]),
  );
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  check('arrow keys reach a disabled item', (await page.evaluate(() => document.activeElement?.textContent)) === 'Open recent');
  await page.keyboard.press('Escape');
  check('Escape closes it and gives focus back to the button', (await menuPopup.count()) === 0 && (await file.evaluate((el) => document.activeElement === el)));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('o');
  check('the & key of an item chooses it', (await page.locator('output.menu-log').textContent()) === 'Open…' && (await menuPopup.count()) === 0);
  await file.click();
  await page.mouse.click(5, 300);
  check('a press outside closes it', (await menuPopup.count()) === 0);

  // Near the bottom of the window there is no room: it opens above.
  await file.evaluate((el) => el.scrollIntoView({ block: 'end' }));
  await file.click();
  const [lowFile, lowPop] = [await box(file), await box(menuPopup)];
  check('with no room below it opens above', (await menuPopup.getAttribute('data-side')) === 'top' && lowPop.bottom <= lowFile.top, JSON.stringify([lowPop.bottom, lowFile.top]));
  await page.keyboard.press('Escape');

  const save = page.locator('.mx-button[data-mode="split"] .mx-button__main');
  await save.scrollIntoViewIfNeeded();
  await save.click();
  check('split: the button does its own action', (await page.locator('output.split-log').textContent()) === 'Save' && (await menuPopup.count()) === 0);
  const moreOptions = page.getByRole('button', { name: 'More options', exact: true });
  await moreOptions.click();
  check('split: the arrow opens the menu', (await menuPopup.count()) === 1);
  await page.getByRole('menuitem', { name: 'Save as…' }).click();
  check('split: a menu item runs its command, focus back on the arrow', (await page.locator('output.split-log').textContent()) === 'Save as…' && (await moreOptions.evaluate((el) => document.activeElement === el)));
  await save.focus();
  await page.keyboard.press('Alt+ArrowDown');
  check('split: Alt+Down on the button opens the menu', (await menuPopup.count()) === 1);
  await page.keyboard.press('Escape');

  const filter = page.getByRole('button', { name: 'Filter', exact: true });
  await filter.click();
  check(
    'a drop-down opens its content with focus on the first field',
    (await page.getByRole('dialog', { name: 'Filter' }).count()) === 1 && (await page.evaluate(() => document.activeElement?.getAttribute('name'))) === 'from',
  );
  await page.keyboard.press('Escape');
  check('…and Escape gives focus back', await filter.evaluate((el) => document.activeElement === el));

  await page.addScriptTag({ content: axeSource });
  await file.click();
  const menuViolations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with the menu open', menuViolations.length === 0, menuViolations.join(', '));
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Language: English' }).click();
  check('the arrow is named from uiLocale, live', (await page.getByRole('button', { name: 'Diğer seçenekler' }).count()) === 1);
}
