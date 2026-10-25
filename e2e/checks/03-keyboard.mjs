/** Real-browser checks of the keyboard page. */
export default async function ({ page, base, check }) {
  await page.goto(base + 'keyboard', { waitUntil: 'load' });
  const activeText = () => page.evaluate(() => document.activeElement?.textContent ?? document.activeElement?.tagName);
  await page.getByRole('button', { name: 'First', exact: true }).focus();
  await page.keyboard.press('Tab');
  const second = await activeText();
  await page.keyboard.press('Tab');
  const third = await activeText();
  check('Tab follows tabIndex (First → Second → Third)', second === 'Second' && third === 'Third', `${second}, ${third}`);
  check('the container reports its activeControl', (await page.locator('.active-name').textContent()) === 'Third');
  await page.keyboard.press('Shift+Tab');
  check('Shift+Tab goes back in tabIndex order', (await activeText()) === 'Second');
  await page.getByRole('button', { name: 'restoreFocus()' }).click();
  check('restoreFocus() returns to the last focused control', (await activeText()) === 'Second');

  await page.keyboard.down('Alt');
  const underline = await page.evaluate(() => getComputedStyle(document.querySelector('.mx-access-key')).textDecorationLine);
  await page.keyboard.press('s');
  await page.keyboard.up('Alt');
  check('access keys are underlined while Alt is held', underline.includes('underline'), underline);
  const underlineAfter = await page.evaluate(() => getComputedStyle(document.querySelector('.mx-access-key')).textDecorationLine);
  check('…and only then', !underlineAfter.includes('underline'), underlineAfter);
  check('Alt+S clicks the &Save button', (await page.locator('output.saves').textContent()) === '1');
  await page.keyboard.press('Alt');
  const latched = await page.evaluate(() => getComputedStyle(document.querySelector('.mx-access-key')).textDecorationLine);
  check('tapping Alt keeps the access keys shown', latched.includes('underline'), latched);
  await page.keyboard.press('Alt+o');
  await page.keyboard.press('Alt');
  await page.keyboard.press('Alt');
  await page.keyboard.press('Alt+o');
  check('access keys keep working after Alt taps', (await page.locator('output.opens').textContent()) === '2');
  check('the &Save button has its accessible name and Alt+S', (await page.getByRole('button', { name: 'Save', exact: true }).getAttribute('aria-keyshortcuts')) === 'Alt+S');

  await page.locator('body').click({ position: { x: 5, y: 300 } });
  await page.keyboard.press('Control+K');
  check('an app-wide shortcut (Mod+K) runs', (await page.locator('output.palette').textContent()) === '1');

  const remove2 = page.getByRole('button', { name: 'Remove row 2' });
  await remove2.focus();
  await page.keyboard.press('Enter');
  check('removing the focused row moves focus to the next one, not <body>', (await activeText()) === 'Remove row 3', await activeText());
}
