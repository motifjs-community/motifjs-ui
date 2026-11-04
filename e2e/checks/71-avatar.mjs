/** Real-browser checks of the avatar page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'avatar', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const person = ways.locator('.mx-avatar').first();
  await person.waitFor();
  check('initials and presence show, said with the name', (await person.textContent()) === 'AL' && (await person.getAttribute('aria-label')) === 'Ada Lovelace, Online');
  await ways.getByRole('button', { name: 'Next person' }).click();
  await ways.getByRole('button', { name: 'Next presence' }).click();
  check('it follows a name and a presence given as functions', (await person.textContent()) === 'AT' && (await person.getAttribute('aria-label')) === 'Alan Turing, Away');

  const content = page.locator('section[aria-labelledby="content"] .mx-avatar');
  const picture = content.nth(0).locator('.mx-avatar__image');
  await page.waitForFunction(() => !document.querySelector('section[aria-labelledby="content"] .mx-avatar__image[data-pending]'));
  check('a picture that loads covers the avatar', (await picture.isVisible()) && !(await content.nth(0).locator('.mx-avatar__initials').isVisible()));
  check('a picture that cannot load leaves the initials', (await content.nth(2).locator('.mx-avatar__initials').textContent()) === 'AT' && !(await content.nth(2).locator('.mx-avatar__image').isVisible()));
  check('without a name the person icon shows', await content.nth(4).locator('.mx-avatar__icon').isVisible());

  // The initials' letters sit in the middle of the avatar.
  const off = await content.nth(1).evaluate((el) => {
    const letters = el.querySelector('.mx-avatar__initials');
    const a = el.getBoundingClientRect();
    const t = letters.getBoundingClientRect();
    return Math.max(Math.abs(t.top + t.height / 2 - (a.top + a.height / 2)), Math.abs(t.left + t.width / 2 - (a.left + a.width / 2)));
  });
  check('the initials are centred', off <= 0.5, String(off));

  // The presence dot sits on the lower end corner; in RTL on the other one.
  const sizes = page.locator('section[aria-labelledby="sizes"] .mx-avatar').nth(2);
  const dot = sizes.locator('.mx-avatar__status');
  const [a, d] = [await sizes.boundingBox(), await dot.boundingBox()];
  check('the presence dot sits on the lower end corner', Math.abs(d.x + d.width - (a.x + a.width)) < 0.5 && Math.abs(d.y + d.height - (a.y + a.height)) < 0.5, JSON.stringify({ a, d }));
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  const [ra, rd] = [await sizes.boundingBox(), await dot.boundingBox()];
  check('in RTL it moves to the other corner', Math.abs(rd.x - ra.x) < 0.5, JSON.stringify({ ra, rd }));
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));

  // Groups: max shows that many and counts the rest; total counts those not given too.
  const groups = page.locator('section[aria-labelledby="groups"] .mx-avatar-group');
  const shown = (group) => group.locator(':scope > .mx-avatar').evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== 'none').map((el) => el.textContent));
  check('max 3 of 5 shows three and +2', JSON.stringify(await shown(groups.nth(0))) === JSON.stringify(['AL', 'AT', 'GH', '+2']));
  check('a total of 42 with 3 given counts +39', (await shown(groups.nth(2))).at(-1) === '+39');
  const [first, second] = [await groups.nth(0).locator('.mx-avatar').nth(0).boundingBox(), await groups.nth(0).locator('.mx-avatar').nth(1).boundingBox()];
  check('stacked avatars go under each other', second.x < first.x + first.width);

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
