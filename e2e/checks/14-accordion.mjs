/** Real-browser checks of the accordion page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'accordion', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));

  const ways = page.locator('.acc-ways');
  const shipping = ways.getByRole('button', { name: 'Shipping' });
  const payment = ways.getByRole('button', { name: 'Payment' });
  const address = ways.getByLabel('Address');
  check('the item given in value is open', (await shipping.getAttribute('aria-expanded')) === 'true' && (await address.isVisible()));
  check('a section is a region named by its header', (await ways.getByRole('region', { name: 'Shipping' }).count()) === 1);
  await address.fill('Ankara');
  await payment.click();
  await page.waitForTimeout(400);
  check('opening one closes the other and writes x-model', (await page.locator('.acc-value').textContent()) === 'value: ["payment"]' && (await shipping.getAttribute('aria-expanded')) === 'false');
  check('a closed section is out of reach', !(await address.isVisible()) && (await page.evaluate(() => {
    const el = document.querySelector('.acc-ways input');
    return !el.checkVisibility({ visibilityProperty: true });
  })));
  const [closedBox, headerBox] = [await box(ways.locator('.mx-accordion__region').first()), await box(shipping)];
  check('a closed section takes no room', closedBox.height < 1, `${closedBox.height}px under a ${headerBox.height}px header`);

  await payment.focus();
  await page.keyboard.press('ArrowDown');
  const review = ways.getByRole('button', { name: 'Review' });
  check('Down moves to the next header', await review.evaluate((el) => document.activeElement === el));
  await page.keyboard.press('Home');
  check('Home goes to the first header', await shipping.evaluate((el) => document.activeElement === el));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  check('Enter opens it and the content kept its text', (await shipping.getAttribute('aria-expanded')) === 'true' && (await address.inputValue()) === 'Ankara');
  await page.keyboard.down('Alt');
  await page.keyboard.press('r');
  await page.keyboard.up('Alt');
  await page.waitForTimeout(400);
  check('an access key opens its item', (await review.getAttribute('aria-expanded')) === 'true' && (await ways.locator('text=Ship to: Ankara').isVisible()));

  await page.getByRole('button', { name: 'Add a question from code' }).click();
  await page.waitForTimeout(400);
  check('an item added from code opens', (await page.getByRole('button', { name: 'Question 1' }).getAttribute('aria-expanded')) === 'true' && (await page.locator('.acc-log').textContent()) === 'Opened “Question 1” from code.');

  const multiple = page.locator('section[aria-labelledby="multiple"]');
  const acc = multiple.locator('.acc-multiple');
  await multiple.getByRole('button', { name: 'Multiple' }).click();
  await acc.getByRole('button', { name: 'Monday' }).click();
  await acc.getByRole('button', { name: 'Tuesday' }).click();
  check('with multiple, several stay open', (await acc.locator('[aria-expanded="true"]').count()) === 2);
  check('a disabled item cannot be pressed', await acc.getByRole('button', { name: 'Wednesday' }).isDisabled());
  await multiple.getByRole('button', { name: 'Multiple' }).click();
  await multiple.getByRole('button', { name: 'Collapsible' }).click();
  const open = acc.locator('[aria-expanded="true"]');
  const keptOpen = acc.getByRole('button', { name: 'Monday' });
  await keptOpen.click({ force: true }); // aria-disabled: Playwright would wait for it
  check('not collapsible: the open item stays open', (await open.count()) === 1 && (await keptOpen.getAttribute('aria-expanded')) === 'true' && (await keptOpen.getAttribute('aria-disabled')) === 'true');

  const lazy = page.locator('.acc-lazy');
  const builds = () => page.locator('.acc-builds').textContent();
  check('sections are not built before they open', (await builds()) === 'Sections built: 0');
  await lazy.getByRole('button', { name: 'Kept' }).click();
  await lazy.getByLabel('Type, close, open again').fill('kept');
  await lazy.getByRole('button', { name: 'Made each time' }).click();
  await lazy.getByLabel('Starts empty each time').fill('gone');
  await lazy.getByRole('button', { name: 'Made each time' }).click();
  await page.waitForTimeout(500);
  await lazy.getByRole('button', { name: 'Made each time' }).click();
  await lazy.getByRole('button', { name: 'Kept' }).click();
  await page.waitForTimeout(400);
  await lazy.getByRole('button', { name: 'Kept' }).click();
  await page.waitForTimeout(400);
  check('keepAlive off makes the content again; a kept one keeps it', (await builds()) === 'Sections built: 3' && (await lazy.getByLabel('Starts empty each time').inputValue()) === '' && (await lazy.getByLabel('Type, close, open again').inputValue()) === 'kept');

  const look = page.locator('section[aria-labelledby="look"]');
  await look.getByRole('button', { name: 'separated', exact: true }).click();
  const cards = look.locator('.acc-look').first().locator('.mx-accordion__item');
  const [one, two] = [await box(cards.nth(0)), await box(cards.nth(1))];
  check('separated items are cards with a gap between them', two.top - one.bottom > 2);
  check('headers are level 3 headings by default', (await look.locator('[role="heading"]').first().getAttribute('aria-level')) === '3');

  const motion = await page.evaluate(() => getComputedStyle(document.querySelector('.mx-accordion__region')).transitionDuration);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const still = await page.evaluate(() => getComputedStyle(document.querySelector('.mx-accordion__region')).transitionDuration);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  check('the height animates, and not under reduced motion', parseFloat(motion) > 0 && parseFloat(still) === 0, `${motion} → ${still}`);

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with open, closed and locked items', violations.length === 0, violations.join(', '));
}
