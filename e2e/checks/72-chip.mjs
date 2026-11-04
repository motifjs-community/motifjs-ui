/** Real-browser checks of the chip page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'chip', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const vegan = ways.locator('.mx-chip').first();
  await vegan.waitFor();
  // The page's own text follows on the next frame.
  const said = async (text) => {
    await page.waitForFunction((t) => document.querySelector('section[aria-labelledby="ways"]').textContent.includes(t), text, { timeout: 2000 }).catch(() => {});
    return ways.textContent();
  };
  await vegan.click();
  check('a selectable chip turns on and its state follows', (await vegan.getAttribute('aria-pressed')) === 'true' && (await said('Vegan only')).includes('Vegan only'));
  await vegan.focus();
  await page.keyboard.press('Space');
  check('Space turns it off again', (await vegan.getAttribute('aria-pressed')) === 'false' && (await said('Everything')).includes('Everything'));

  // The avatar and the remove button sit as far in from the edge as from the top.
  const looks = page.locator('section[aria-labelledby="looks"]');
  const room = await looks.locator('.mx-chip:has(.mx-chip__avatar)').first().evaluate((chip) => {
    const c = chip.getBoundingClientRect();
    const a = chip.querySelector('.mx-chip__avatar').getBoundingClientRect();
    const r = chip.querySelector('.mx-chip__remove').getBoundingClientRect();
    return Math.max(Math.abs(a.left - c.left - (a.top - c.top)), Math.abs(c.right - r.right - (r.top - c.top)));
  });
  check('avatar and remove button are concentric with the chip', room <= 0.5, String(room));

  // A group that selects several: a listbox, the value shown, arrow keys move.
  const groups = page.locator('section[aria-labelledby="groups"]');
  const diet = groups.getByRole('listbox', { name: 'Diet' });
  check('a group that selects several is a multiselectable listbox', (await diet.getAttribute('aria-multiselectable')) === 'true');
  await diet.getByRole('option', { name: 'Gluten free' }).click();
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="groups"]').textContent.includes('Diet: Vegan, Gluten free'), null, { timeout: 2000 }).catch(() => {});
  check('pressing a chip adds its value, back through x-model', (await groups.textContent()).includes('Diet: Vegan, Gluten free'));
  const first = diet.getByRole('option', { name: 'Vegan' });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  check('the arrow keys move between the chips', (await page.evaluate(() => document.activeElement?.textContent)) === 'Vegetarian');
  const stops = await diet.locator('.mx-chip').evaluateAll((els) => els.filter((el) => el.getAttribute('tabindex') === '0').length);
  check('the group is one Tab stop', stops === 1, String(stops));
  const size = groups.getByRole('listbox', { name: 'Size' });
  await size.getByRole('option', { name: 'Large' }).click();
  check('a single choice moves to the chip pressed', (await groups.textContent()).includes('Size: Large') && (await size.getByRole('option', { selected: true }).count()) === 1);

  // Removing: the list loses the person and the group follows it.
  const removing = page.locator('section[aria-labelledby="removing"]');
  const before = await removing.locator('.mx-chip').count();
  await removing.getByRole('button', { name: 'Remove Ada Lovelace' }).click();
  const chip = removing.locator('.mx-chip').first();
  await chip.focus();
  await page.keyboard.press('Delete');
  check('the remove button and Delete remove a chip', (await removing.locator('.mx-chip').count()) === before - 2);

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
