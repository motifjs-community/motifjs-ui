/** Real-browser checks of the DateBox and Calendar pages. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'datebox', { waitUntil: 'load' });
  const locales = page.locator('section[aria-labelledby="locale"]');
  const tr = locales.getByLabel('Türkçe');
  await tr.click();
  check('the mask follows the locale', (await tr.inputValue()) === '__.__.____');
  await page.keyboard.type('25102026');
  check('typed digits make a date', (await tr.inputValue()) === '25.10.2026');
  await page.waitForTimeout(50);
  check('…shown in every locale’s order', (await locales.getByLabel('English (US)').inputValue()) === '10/25/2026' && (await locales.getByLabel('日本語').inputValue()) === '2026/10/25');

  const ways = page.locator('section[aria-labelledby="ways"]');
  const delivery = ways.getByLabel('Delivery', { exact: true });
  const toggle = ways.getByRole('button', { name: 'Choose date' });
  await toggle.click();
  const dialog = page.getByRole('dialog', { name: 'Choose date' });
  check('the button opens the calendar in a dialog', (await dialog.count()) === 1 && (await toggle.getAttribute('aria-expanded')) === 'true');
  const focusedDay = await page.evaluate(() => document.activeElement?.getAttribute('aria-selected'));
  check('…focus on the chosen day', focusedDay === 'true');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  check('Enter chooses a day, closes, focus back on the field', (await dialog.count()) === 0 && (await delivery.evaluate((el) => document.activeElement === el)), `${await dialog.count()} ${await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 120))}`);
  await page.keyboard.press('Alt+ArrowDown');
  check('Alt+Down opens it from the field', (await dialog.count()) === 1);
  await page.addScriptTag({ content: axeSource });
  const open = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with the calendar open', open.length === 0, open.join(', '));
  await page.keyboard.press('Escape');
  check('Escape closes it', (await dialog.count()) === 0);

  const types = page.locator('section[aria-labelledby="types"]');
  await types.getByLabel('Alarm').click();
  await page.keyboard.type('0730');
  check('a time is typed too', (await types.getByLabel('Alarm').inputValue()) === '07:30');
  await types.getByRole('button', { name: 'Choose time' }).click();
  await page.getByRole('option', { name: '18:30' }).click();
  check('…or picked from the times', (await types.getByLabel('Alarm').inputValue()) === '18:30');

  const limits = page.locator('section[aria-labelledby="limits"]');
  await limits.getByRole('button', { name: 'Check' }).click();
  await page.waitForTimeout(100);
  check('a required date left empty fails', (await page.locator('.db-check').textContent()).startsWith('Pick'));

  await page.goto(base + 'calendar', { waitUntil: 'load' });
  const calendar = page.locator('section[aria-labelledby="ways"] .mx-calendar');
  await calendar.locator('[tabindex="0"]').focus();
  const before = await calendar.locator('.mx-calendar__title').textContent();
  await page.keyboard.press('PageDown');
  const after = await calendar.locator('.mx-calendar__title').textContent();
  check('Page Down shows the next month', before !== after, `${before} → ${after}`);
  await page.keyboard.press('Enter');
  check('Enter chooses the focused day', (await page.locator('.cal-day').textContent()) !== '—');
  await calendar.locator('.mx-calendar__title').click();
  check('the title zooms out to the months', (await calendar.getAttribute('data-view')) === 'year');
}
