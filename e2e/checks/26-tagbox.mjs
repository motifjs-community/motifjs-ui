/** Real-browser checks of the tagbox page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'tagbox', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const open = () => page.locator('.mx-tag-box__popup:popover-open');

  const ways = page.locator('section[aria-labelledby="ways"]');
  const skills = ways.getByRole('combobox', { name: 'Skills' });
  const output = page.locator('.tg-skills');
  await skills.click();
  check('a press on the field opens the list', (await skills.getAttribute('aria-expanded')) === 'true');
  await page.keyboard.type('java');
  const options = await open().getByRole('option').allTextContents();
  check('typing searches the list', JSON.stringify(options) === JSON.stringify(['Java', 'JavaScript']), options.join(', '));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  check(
    'Enter adds the highlighted item and keeps the list open',
    (await output.textContent()) === 'skills: ["TypeScript","CSS","JavaScript"]' && (await skills.getAttribute('aria-expanded')) === 'true' && (await skills.inputValue()) === '',
    await output.textContent(),
  );
  await open().getByRole('option', { name: 'CSS' }).click();
  check('a click on a checked item takes it out', (await output.textContent()) === 'skills: ["TypeScript","JavaScript"]');
  await page.keyboard.press('Escape');
  check('Escape closes the list', (await skills.getAttribute('aria-expanded')) === 'false');
  await page.keyboard.press('Backspace');
  check('Backspace in the empty input removes the last tag', (await output.textContent()) === 'skills: ["TypeScript"]');
  await page.keyboard.press('ArrowLeft');
  const tag = ways.getByRole('listitem').first();
  check('Left goes to the last tag', await tag.evaluate((el) => document.activeElement === el));
  await page.keyboard.press('Delete');
  check('Delete removes the focused tag and focus goes back to the input', (await output.textContent()) === 'skills: []' && (await skills.evaluate((el) => document.activeElement === el)));
  await page.keyboard.type('rust');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await ways.getByRole('button', { name: 'Remove Rust' }).click();
  check('the remove button removes its tag', (await output.textContent()) === 'skills: []' && (await skills.evaluate((el) => document.activeElement === el)));

  const optionsCard = page.locator('section[aria-labelledby="options"]');
  const team = optionsCard.getByRole('combobox', { name: 'Team' });
  await optionsCard.getByRole('switch', { name: 'At most 3' }).click();
  await team.click();
  await open().getByRole('option', { name: /Margaret/ }).click();
  const limited = await open().locator('[role="option"][aria-disabled="true"]').count();
  check('at the limit the other items cannot be chosen', (await page.locator('.tg-team').textContent()) === 'ids: [1,3,6]' && limited >= 3, String(limited));
  check('the list is multi-select with groups', (await open().getByRole('listbox').getAttribute('aria-multiselectable')) === 'true' && (await open().getByRole('group').count()) === 3);
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with the list open and tags shown', violations.length === 0, violations.join(', '));
  await page.keyboard.press('Escape');

  const dataCard = page.locator('section[aria-labelledby="data"]');
  const customers = dataCard.getByRole('combobox', { name: 'Customers' });
  await dataCard.getByRole('listitem').filter({ hasText: 'Customer 4321' }).waitFor({ timeout: 5000 });
  check('the tag of a value on no loaded page is found by key', true);
  await customers.click();
  await customers.pressSequentially('0777');
  await open().getByRole('option', { name: 'Customer 0777' }).waitFor({ timeout: 5000 });
  await customers.press('Enter');
  await page.waitForFunction(() => document.querySelector('.tg-customers')?.textContent === '3 chosen: 12, 4321, 777', null, { timeout: 5000 });
  check('the search goes to the data source', true);
  await customers.press('Escape');
  await customers.press('ArrowDown');
  await open().getByRole('option', { name: 'Select all' }).click();
  await page.waitForFunction(() => document.querySelector('.tg-customers')?.textContent === '5000 chosen', null, { timeout: 5000 });
  const more = await dataCard.locator('.mx-tag-box__more').textContent();
  check('"Select all" over 5,000 rows, and "+N" for the tags not shown', more === '+4997', more);
  await customers.press('Escape');

  const custom = page.locator('section[aria-labelledby="custom"]');
  const labels = custom.getByRole('combobox', { name: 'Labels' });
  await labels.click();
  await page.keyboard.type('Urgent');
  await page.keyboard.press('Enter');
  check('typed text becomes a tag with acceptCustomValue', (await page.locator('.tg-labels').textContent()) === 'labels: ["bug","urgent"]', await page.locator('.tg-labels').textContent());
}
