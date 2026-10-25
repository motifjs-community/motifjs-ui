/** Real-browser checks of the DropDown page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'dropdown', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const city = ways.getByRole('combobox', { name: 'City' });
  await city.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await city.click();
  const list = page.locator('.mx-popup:popover-open [role="listbox"]');
  check('a press opens the list in the top layer', (await list.count()) === 1 && (await city.getAttribute('aria-expanded')) === 'true');
  const [field, popup] = [await box(city.locator('xpath=..')), await box(page.locator('.mx-popup:popover-open'))];
  check('…below the field and as wide as it', popup.top >= field.bottom && Math.abs(popup.width - field.width) < 2, JSON.stringify([field.bottom, popup.top, field.width, popup.width]));
  check('…on the chosen option', (await page.locator('.mx-popup:popover-open [role="option"][data-active]').textContent()) === 'İzmir');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  check('Enter chooses the highlighted option and closes', (await page.locator('.dd-city').textContent()) === 'city: Konya' && (await list.count()) === 0);
  check('…focus back on the field', await city.evaluate((el) => document.activeElement === el));
  await page.keyboard.press('a');
  check('a letter opens the list on an option starting with it', (await page.locator('.mx-popup:popover-open [role="option"][data-active]').textContent()) === 'Ankara');
  await page.keyboard.press('Escape');
  check('Escape closes without choosing', (await list.count()) === 0 && (await page.locator('.dd-city').textContent()) === 'city: Konya');

  const objects = page.locator('section[aria-labelledby="objects"]');
  const country = objects.getByRole('combobox', { name: 'Country' });
  await country.click();
  check('groups show under their headers', (await page.locator('.mx-popup:popover-open .mx-list__header').allTextContents()).join() === 'Europe,Asia,Americas');
  check('an option that cannot be chosen is marked', (await page.getByRole('option', { name: /Norway/ }).getAttribute('aria-disabled')) === 'true');
  await page.getByRole('option', { name: /Japan/ }).click();
  check('a click chooses, through valueField', (await page.locator('.dd-country').textContent()) === 'code: JP' && (await country.textContent()).includes('Japan'));

  const search = page.locator('section[aria-labelledby="search"]');
  const order = search.getByRole('combobox', { name: 'Order' });
  await order.click();
  const searchBox = page.locator('.mx-popup:popover-open .mx-drop-down__search input');
  check('a search box takes focus', await searchBox.evaluate((el) => document.activeElement === el));
  check('a long list draws only the rows in view', (await page.locator('.mx-popup:popover-open [role="option"]').count()) < 80);
  check('…scrolled to the chosen one', (await page.locator('.mx-popup:popover-open [role="option"][data-active]').textContent()) === 'Order #01200');
  await page.keyboard.type('04711');
  check('typing in it searches', (await page.locator('.mx-popup:popover-open [role="option"]').allTextContents()).join() === 'Order #04711');
  await page.addScriptTag({ content: axeSource });
  const open = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with a searchable list open', open.length === 0, open.join(', '));
  await page.keyboard.press('Enter');
  check('Enter in the search box chooses', (await page.locator('.dd-order').textContent()) === 'order: 4711');

  const live = page.locator('section[aria-labelledby="live"]');
  await live.getByRole('button', { name: 'Add “Published”' }).click();
  await live.getByRole('combobox', { name: 'Status' }).click();
  check('items added to a reactive array reach the list', (await page.locator('.mx-popup:popover-open [role="option"]').allTextContents()).join() === 'Draft,Review,Published');
  await page.keyboard.press('Escape');

  const states2 = page.locator('section[aria-labelledby="validation"]');
  await states2.getByRole('combobox', { name: 'Priority' }).focus();
  await page.keyboard.press('Escape');
  await states2.getByRole('button', { name: 'Check' }).click();
  await page.waitForTimeout(100);
  check('a required drop-down left empty fails, focus on it', (await page.locator('.dd-check').textContent()) === 'Pick a priority.' && (await states2.getByRole('combobox', { name: 'Priority' }).evaluate((el) => document.activeElement === el)));
  await states2.getByRole('combobox', { name: 'Read-only' }).click();
  check('a read-only drop-down does not open', (await page.locator('.mx-popup:popover-open').count()) === 0);
}
