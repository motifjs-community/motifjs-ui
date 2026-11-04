/** Real-browser checks of the ComboBox and Lookup pages. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'combobox', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const city = ways.getByRole('combobox', { name: 'City' });
  await city.click();
  await city.fill('');
  await page.keyboard.type('an');
  const options = page.locator('.mx-popup:popover-open [role="option"]');
  check('typing filters the list', (await options.allTextContents()).join() === 'Adana,Ankara,Antalya,Gaziantep,İstanbul');
  check('…with the first match highlighted', (await page.locator('.mx-popup:popover-open [role="option"][data-active]').textContent()) === 'Adana');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  check('Enter takes the highlighted item', (await page.locator('.cb-city').textContent()) === 'city: Ankara' && (await city.inputValue()) === 'Ankara');
  await page.keyboard.type('xyz');
  await page.keyboard.press('Tab');
  check('text that matches nothing goes back to the chosen item', (await city.inputValue()) === 'Ankara');

  const dataCard = page.locator('section[aria-labelledby="data"]');
  const product = dataCard.getByRole('combobox', { name: 'Product' });
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="data"] input')?.value === 'Grains item 2500');
  check('a value on no loaded page shows its text', (await product.inputValue()) === 'Grains item 2500');
  await product.click();
  await product.fill('seafood item 999');
  await page.waitForFunction(() => document.querySelectorAll('.mx-popup:popover-open [role="option"]:not([data-loading])').length > 0, null, { timeout: 5000 });
  const found = await page.locator('.mx-popup:popover-open [role="option"]').allTextContents();
  check('the search goes to the data source', found.length > 0 && found.every((t) => t.toLowerCase().includes('seafood item 999')), found.slice(0, 3).join());
  await page.addScriptTag({ content: axeSource });
  const open = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with a searched list open', open.length === 0, open.join(', '));
  await page.keyboard.press('Enter');
  check('…and Enter takes a row from it', (await page.locator('.cb-product').textContent()) !== 'product: 2500');

  const custom = page.locator('section[aria-labelledby="custom"]');
  await custom.getByRole('combobox', { name: 'Search' }).click();
  await page.keyboard.type('Gaz');
  await page.keyboard.press('Enter');
  check('Autocomplete takes the suggestion as text', (await page.locator('.cb-query').textContent()) === 'query: "Gaziantep"');

  await page.goto(base + 'lookup', { waitUntil: 'load' });
  const customer = page.getByRole('combobox', { name: 'Customer' });
  await page.waitForFunction(() => document.querySelector('.mx-lookup .mx-drop-down__text')?.textContent?.includes('42'));
  check('a lookup shows the row of its value', (await customer.textContent()).includes('42'));
  await customer.click();
  await page.waitForTimeout(400);
  check('…opens a list with column headers', (await page.locator('.mx-popup:popover-open .mx-lookup__header').innerText()).replace(/\s+/g, ' ').trim() === 'Company Contact City Phone');
  await page.keyboard.type('Paris');
  await page.waitForTimeout(700);
  const cities = await page.locator('.mx-popup:popover-open [role="option"] .mx-lookup__cell:nth-child(3)').allTextContents();
  check('…searches the data source', cities.length > 0 && cities.every((c) => c === 'Paris'), cities.slice(0, 3).join());
  await page.keyboard.press('Enter');
  check('…and Enter takes the row', (await page.locator('.lk-customer').textContent()) !== 'customer: C0042');

  // A value on no loaded page: the field waits, a given text shows at once, a key the server does not have is marked.
  await page.goto(base + 'lookup', { waitUntil: 'load' });
  const fieldState = (selector) =>
    page.evaluate((s) => {
      const field = document.querySelector(s);
      const text = field.querySelector('.mx-drop-down__text');
      const spinner = field.querySelector('.mx-drop-down__spinner');
      return {
        loading: field.hasAttribute('data-loading'),
        busy: field.querySelector('[role="combobox"]').getAttribute('aria-busy'),
        text: text.textContent,
        missing: text.hasAttribute('data-missing'),
        title: text.title,
        line: getComputedStyle(text).textDecorationLine,
        spinner: spinner ? getComputedStyle(spinner).display : 'none',
        chevron: getComputedStyle(field.querySelector('.mx-drop-down__chevron')).display,
      };
    }, selector);
  await page.waitForFunction(() => document.querySelector('.lk-waits')?.hasAttribute('data-loading'));
  const waiting = await fieldState('.lk-waits');
  check('a value on no loaded page waits: busy, a spinner in the arrow\'s place, never its key', waiting.busy === 'true' && waiting.spinner !== 'none' && waiting.chevron === 'none' && waiting.text === 'Loading…', JSON.stringify(waiting));
  const given = await fieldState('.lk-given');
  check('…a record\'s own name shows at once (valueText)', !given.loading && given.text === 'Alfreds Trading 1500', JSON.stringify(given));
  await page.waitForFunction(() => !document.querySelector('.lk-waits').hasAttribute('data-loading'), null, { timeout: 5000 });
  const answered = await fieldState('.lk-waits');
  check('…then shows its row', answered.text === 'Alfreds Trading 1500' && answered.busy === null && answered.chevron !== 'none', JSON.stringify(answered));
  await page.waitForFunction(() => document.querySelector('.lk-missing .mx-drop-down__text')?.hasAttribute('data-missing'), null, { timeout: 5000 });
  const missing = await fieldState('.lk-missing');
  check('a key the server does not have shows itself, marked, with the reason', missing.text === '9999' && missing.line === 'underline' && missing.title === 'Not found in the list', JSON.stringify(missing));
  await page.locator('.lk-another').click();
  check('…another key waits again', (await fieldState('.lk-waits')).loading);
  await page.addScriptTag({ content: axeSource });
  const busy = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean while a lookup waits', busy.length === 0, busy.join(', '));
}
