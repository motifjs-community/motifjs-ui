/** Real-browser checks of the badge page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'badge', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const inbox = ways.locator('.mx-badge').first();
  await inbox.waitFor();
  check('a count shows, named by its label', (await inbox.textContent()) === '4' && (await inbox.getAttribute('aria-label')) === '4 unread');
  await ways.getByRole('button', { name: 'Add one' }).click();
  check('it follows a count given as a function', (await inbox.textContent()) === '5');
  await ways.getByRole('button', { name: 'Read all' }).click();
  check('at 0 it hides', !(await inbox.isVisible()));

  const counts = page.locator('section[aria-labelledby="counts"]');
  check('over max it shows max+', (await counts.locator('.mx-badge').first().textContent()) === '99+');
  const dot = counts.locator('.mx-badge[data-dot]');
  const dotBox = await dot.boundingBox();
  check('a dot is round and has no text', (await dot.textContent()) === '' && Math.abs(dotBox.width - dotBox.height) < 0.5);

  // On a corner: the middle of the badge sits on the corner of the button (start and end follow the direction).
  const corner = page.locator('section[aria-labelledby="corner"]');
  const button = corner.locator('.mx-button:has(> .mx-badge), .mx-button:has(.mx-badge)').first();
  const onIt = button.locator('.mx-badge');
  const [b, d] = [await button.boundingBox(), await onIt.boundingBox()];
  check('a badge on the top-end corner centres on it', Math.abs(d.x + d.width / 2 - (b.x + b.width)) < 1 && Math.abs(d.y + d.height / 2 - b.y) < 1, JSON.stringify({ b, d }));
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  const [rb, rd] = [await button.boundingBox(), await onIt.boundingBox()];
  check('in RTL it moves to the other corner', Math.abs(rd.x + rd.width / 2 - rb.x) < 1, JSON.stringify({ rb, rd }));
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));

  // Each language draws each tone: no two tones of a look share a colour.
  const tones = page.locator('section[aria-labelledby="tones"]');
  const solidColours = await tones.locator('.mx-badge[data-variant="solid"]').evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor));
  check('the solid tones differ from the standard one', new Set(solidColours.slice(1)).size >= 4 && !solidColours.slice(1, 2).includes(solidColours[0]), solidColours.join(' '));

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
