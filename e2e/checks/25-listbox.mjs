/** Real-browser checks of the listbox page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'listbox', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));

  const ways = page.locator('section[aria-labelledby="ways"]');
  const city = ways.getByRole('listbox', { name: 'City' });
  await city.getByRole('option', { name: 'Bursa' }).click();
  check('a click chooses and writes back through x-model', (await page.locator('.lb-city').textContent()) === 'city: Bursa' && (await city.evaluate((el) => document.activeElement === el)));
  await page.keyboard.press('ArrowDown');
  const activeId = await city.getAttribute('aria-activedescendant');
  check('the arrow keys move and choose in a single list', (await page.locator('.lb-city').textContent()) === 'city: İstanbul' && activeId === (await city.getByRole('option', { name: 'İstanbul' }).getAttribute('id')));
  await page.keyboard.press('k');
  check('typing a letter goes to the item starting with it', (await page.locator('.lb-city').textContent()) === 'city: Konya');
  await ways.getByRole('button', { name: 'Add a list from code' }).click();
  check('a list created with new is added and focused', await page.getByRole('listbox', { name: 'Size 1' }).evaluate((el) => document.activeElement === el));

  const multiple = page.locator('section[aria-labelledby="multiple"]');
  const cities = multiple.getByRole('listbox', { name: 'Cities' });
  const picked = page.locator('.lb-picked');
  check('a multiple list says so', (await cities.getAttribute('aria-multiselectable')) === 'true');
  const all = cities.getByRole('option', { name: 'Select all' });
  check('"Select all" shows a dash while some are chosen', (await all.getAttribute('data-mixed')) !== null);
  await all.click();
  check('"Select all" chooses every item', (await picked.textContent()) === 'value: ["Bursa","Konya","Ankara","Antalya","İstanbul","İzmir","Trabzon"]', await picked.textContent());
  await page.keyboard.press('Control+a');
  check('Control + A lets go of all of them', (await picked.textContent()) === 'value: []');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Shift+ArrowDown');
  check('Shift + Down chooses as it moves', (await picked.textContent()) === 'value: ["Antalya","Bursa"]', await picked.textContent());
  await cities.getByRole('option', { name: 'Trabzon' }).click({ modifiers: ['Shift'] });
  check('Shift + click chooses the items between', (await picked.textContent()) === 'value: ["Antalya","Bursa","İstanbul","İzmir","Konya","Trabzon"]', await picked.textContent());
  const filled = await cities.locator('.mx-list__item[data-selected]:not([data-select-all]) .mx-list__check').first().evaluate((el) => getComputedStyle(el).backgroundColor);
  await cities.getByRole('option', { name: 'Trabzon' }).click();
  const empty = await cities.getByRole('option', { name: 'Trabzon' }).locator('.mx-list__check').evaluate((el) => getComputedStyle(el).backgroundColor);
  check('a chosen item has a filled check box', filled !== empty, `${filled} vs ${empty}`);
  await multiple.getByRole('switch', { name: 'Search' }).click();
  const search = multiple.getByRole('searchbox', { name: 'Search' });
  await search.fill('an');
  await page.waitForTimeout(50);
  const shown = await cities.getByRole('option').allTextContents();
  check('the search box filters the list', JSON.stringify(shown) === JSON.stringify(['Select all', 'Ankara', 'Antalya', 'İstanbul']), shown.join(', '));
  await search.press('ArrowDown');
  check('Down in the search box goes to the list', await cities.evaluate((el) => document.activeElement === el));
  await multiple.getByRole('switch', { name: 'Multiple' }).click();
  check('turning multiple off makes a single list', (await cities.getAttribute('aria-multiselectable')) === null);

  const dataCard = page.locator('section[aria-labelledby="data"]');
  const orders = dataCard.getByRole('listbox', { name: 'Orders' });
  await orders.getByRole('option', { name: 'Order #00001' }).waitFor();
  const drawn = await orders.getByRole('option').count();
  check('a list of 5,000 rows from a data source draws only the rows in view', drawn > 5 && drawn < 80, String(drawn));
  const size = await box(orders);
  check('height in rows sets the list height', size.height > 200 && size.height < 500, String(size.height));
  await orders.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await orders.getByRole('option', { name: 'Order #05000' }).waitFor({ timeout: 5000 });
  check('scrolling to the end loads the last rows', true);
  await dataCard.getByRole('searchbox', { name: 'Search' }).fill('#0499');
  await orders.getByRole('option', { name: 'Order #04985' }).waitFor({ state: 'detached', timeout: 5000 });
  const found = (await orders.getByRole('option').allTextContents()).filter((t) => t.startsWith('Order'));
  check('the search goes to the data source', found.length === 10, found.join(', '));
  await orders.getByRole('option', { name: 'Select all' }).click();
  await page.waitForFunction(() => document.querySelector('.lb-orders')?.textContent === '12 chosen', null, { timeout: 5000 });
  check('"Select all" over a data source chooses every match', true);

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with lists in use', violations.length === 0, violations.join(', '));

  const validation = page.locator('section[aria-labelledby="validation"]');
  await validation.getByRole('button', { name: 'Check' }).click();
  await page.waitForTimeout(100);
  const sizes = validation.getByRole('listbox', { name: 'Sizes' });
  check('a required list without a choice fails', (await sizes.getAttribute('aria-invalid')) === 'true' && (await page.locator('.lb-check').textContent()) === 'Pick a size.');
  const readOnly = validation.getByRole('listbox', { name: 'Read-only' });
  await readOnly.focus();
  await page.keyboard.press('ArrowDown');
  check('a read-only list moves but does not choose', (await readOnly.getAttribute('aria-readonly')) === 'true' && (await readOnly.locator('[aria-selected="true"]').textContent()) === 'Bursa');
}
