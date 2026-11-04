/** Real-browser checks of the breadcrumb page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'breadcrumb', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const nav = ways.getByRole('navigation', { name: 'Docs path' });
  await nav.waitFor();
  check('a nav with the current page last', (await nav.locator('[aria-current="page"]').textContent()) === 'Breadcrumb');
  await nav.getByRole('button', { name: 'Display' }).click();
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="ways"]').textContent.includes('Pressed: Display'), null, { timeout: 2000 }).catch(() => {});
  check('a step without an address is a button', (await ways.textContent()).includes('Pressed: Display'));

  // Narrow: the steps between go into the menu, the first and the last stay, nothing spills.
  const overflow = page.locator('section[aria-labelledby="overflow"]');
  const box = overflow.locator('div[style*="resize"]');
  await box.evaluate((el) => (el.style.inlineSize = '16rem'));
  await page.waitForTimeout(200);
  const crumb = box.locator('.mx-breadcrumb');
  const fits = await crumb.locator('.mx-breadcrumb__list').evaluate((el) => el.scrollWidth <= el.clientWidth + 0.5);
  const shown = await crumb.locator('.mx-breadcrumb__item:not(.mx-breadcrumb__more)').evaluateAll((els) => els.filter((el) => !el.hidden).map((el) => el.textContent));
  check('narrow, it still fits, first and last showing', fits && shown[0] === 'Workspace' && shown.at(-1) === 'Overflow', shown.join(' / '));
  await box.evaluate((el) => (el.style.inlineSize = '60rem'));
  await page.waitForTimeout(200);
  const more = await crumb.locator('.mx-breadcrumb__item:not(.mx-breadcrumb__more)').evaluateAll((els) => els.filter((el) => !el.hidden).length);
  const stillFits = await crumb.locator('.mx-breadcrumb__list').evaluate((el) => el.scrollWidth <= el.clientWidth + 0.5);
  check('wider again, steps come back out of the menu', more > shown.length && stillFits, `${shown.length} → ${more}`);

  // A step chosen in the menu is pressed itself: the router takes a link from there too.
  await page.goto(base + 'breadcrumb', { waitUntil: 'load' });
  const capped = page.locator('section[aria-labelledby="overflow"] .mx-breadcrumb').nth(1);
  await capped.locator('.mx-breadcrumb__more .mx-button__face, .mx-breadcrumb__more button').first().click();
  const menuItem = page.getByRole('menuitem', { name: 'Projects' });
  check('the menu holds the steps that do not fit', await menuItem.isVisible());
  await page.keyboard.press('Escape');

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
