/** Real-browser checks of the control page. */
export default async function ({ page, base, check }) {
  await page.goto(base + 'control', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Add a button programmatically' }).click();
  const added = page.getByRole('button', { name: 'Button 1', exact: true });
  check('a control created with new is added and shown', (await added.count()) === 1);
  await added.click();
  check('its text set programmatically updates in place', (await page.getByRole('button', { name: 'Button 1 ✓' }).count()) === 1);

  const nameBox = page.locator('input[name=panel-name]');
  await nameBox.focus();
  await page.getByRole('button', { name: 'Toggle panel enabled' }).evaluate((b) => {
    // Toggle without moving focus first: what an app does programmatically.
    b.click();
  });
  check('a disabled panel disables the native input inside', await nameBox.isDisabled());
  check('…and the control inside it', await page.getByRole('button', { name: 'Inner button' }).isDisabled());
  check('…and takes the link out of the Tab order', (await page.locator('.ctl-panel a').getAttribute('tabindex')) === '-1');
  const focusAfter = await page.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.textContent ?? ''));
  check('focus moved on instead of falling to <body>', !focusAfter.startsWith('BODY'), focusAfter);
  await page.getByRole('button', { name: 'Toggle panel enabled' }).click();
  check('enabling restores the input', !(await nameBox.isDisabled()));
  check('enabling restores the link', !(await page.locator('.ctl-panel a').getAttribute('tabindex')));
}
