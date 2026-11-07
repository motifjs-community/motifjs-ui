/** Real-browser checks of the card page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'card', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const card = ways.getByRole('group', { name: 'Ada Lovelace' });
  await card.waitFor();
  await card.getByRole('button', { name: 'Follow' }).click();
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="ways"] .mx-card__subtitle')?.textContent === 'Following', null, { timeout: 2000 }).catch(() => {});
  check('a card names itself by its title and follows its functions', (await card.locator('.mx-card__subtitle').textContent()) === 'Following');

  // Each look differs from the others.
  const looks = await page.locator('section[aria-labelledby="variants"] .mx-card').evaluateAll((els) =>
    els.map((el) => {
      const s = getComputedStyle(el);
      return `${s.backgroundColor}|${s.boxShadow}|${s.borderTopColor}`;
    }),
  );
  check('the three looks are drawn differently', new Set(looks).size === 3, looks.join(' / '));

  // The padding is the same on every side, and a picture runs to the edges.
  const media = page.locator('section[aria-labelledby="media"] .mx-card').first();
  const fit = await media.evaluate((el) => {
    const c = el.getBoundingClientRect();
    const m = el.querySelector('.mx-card__media').getBoundingClientRect();
    const frame = parseFloat(getComputedStyle(el).borderTopWidth);
    const body = el.querySelector('.mx-card__body');
    const s = getComputedStyle(body);
    return { edge: Math.max(Math.abs(m.left - c.left - frame), Math.abs(c.right - m.right - frame), Math.abs(m.top - c.top - frame)), pads: new Set([s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft]).size };
  });
  check('a picture runs to the edges and the padding is even', fit.edge < 0.5 && fit.pads === 1, JSON.stringify(fit));
  const side = page.locator('section[aria-labelledby="media"] .mx-card[data-orientation="horizontal"]');
  const [c, m] = [await side.boundingBox(), await side.locator('.mx-card__media').boundingBox()];
  check('standing at the start, the picture is as tall as the card', Math.abs(m.height - (c.height - 2)) < 1, JSON.stringify({ c, m }));

  // Clickable: Enter presses it.
  const clickable = page.locator('section[aria-labelledby="clickable"]');
  const lisbon = clickable.getByRole('group', { name: 'Lisbon' });
  await lisbon.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="clickable"]').textContent.includes('Chosen: Lisbon'), null, { timeout: 2000 }).catch(() => {});
  check('Enter presses a clickable card', (await clickable.textContent()).includes('Chosen: Lisbon'));

  // Selectable: a press on the card picks it, its check box follows.
  const links = page.locator('section[aria-labelledby="links"]');
  const kyoto = links.getByRole('group', { name: 'Kyoto' });
  await kyoto.locator('.mx-card__subtitle').click();
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="links"]').textContent.includes('Picked: Kyoto'), null, { timeout: 2000 }).catch(() => {});
  check('a press on a selectable card picks it', (await links.textContent()).includes('Picked: Kyoto') && (await kyoto.locator('input[type="checkbox"]').isChecked()));

  // A link card: a press anywhere on it follows its link; its own button does not.
  await links.getByRole('button', { name: 'Later' }).click();
  check('the button of a link card stays a button', new URL(page.url()).pathname.endsWith('/card'));
  const subtitle = links.getByRole('group', { name: 'Keyboard' }).locator('.mx-card__subtitle');
  await subtitle.scrollIntoViewIfNeeded();
  const spot = await subtitle.boundingBox();
  await page.mouse.click(spot.x + spot.width / 2, spot.y + spot.height / 2);
  await page.waitForFunction(() => location.pathname.endsWith('/keyboard'), null, { timeout: 3000 }).catch(() => {});
  check('a press anywhere on a link card follows the link', new URL(page.url()).pathname.endsWith('/keyboard'), page.url());
  await page.goto(base + 'card', { waitUntil: 'load' });
  await page.locator('section[aria-labelledby="links"] .mx-card').first().waitFor();

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
