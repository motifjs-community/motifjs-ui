/** Real-browser checks of the toast page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'toast', { waitUntil: 'load' });
  const region = page.getByRole('region', { name: 'Notifications', exact: true });
  const corner = page.locator('.mx-toaster__stack[data-position="bottom-end"] .mx-toast');

  const ways = page.locator('section[aria-labelledby="ways"]');
  const showButton = ways.getByRole('button', { name: 'Show a toast' });
  await showButton.click();
  await page.waitForTimeout(400);
  check('a toast shows in a Notifications region at the end of the page', (await region.count()) === 1 && (await corner.count()) === 1 && (await region.evaluate((el) => el.parentElement?.parentElement === document.body && !el.parentElement.nextElementSibling)));
  check('it does not take focus', await showButton.evaluate((el) => document.activeElement === el));
  const [toastBox, view] = [await box(corner), await page.evaluate(() => ({ w: document.documentElement.clientWidth, h: document.documentElement.clientHeight }))];
  check('bottom-end sits in the bottom right corner', view.w - toastBox.right < 40 && view.h - toastBox.bottom < 40 && view.w - toastBox.right > 4, JSON.stringify(toastBox));
  check('it is read out politely', (await region.locator('[role="status"]').textContent()) === 'Saved. Your changes are saved.');
  check('its close button is named', (await corner.getByRole('button', { name: 'Close' }).count()) === 1);
  const look = await corner.evaluate((el) => {
    const s = getComputedStyle(el);
    return { radius: parseFloat(s.borderTopLeftRadius), shadow: s.boxShadow !== 'none', opacity: s.opacity };
  });
  check('it is a card with a shadow, fully shown after sliding in', look.radius > 0 && look.shadow && look.opacity === '1', JSON.stringify(look));
  await corner.getByRole('button', { name: 'Close' }).click();
  await page.waitForTimeout(400);
  check('the close button closes it', (await corner.count()) === 0);

  const tones = page.locator('section[aria-labelledby="tones"]');
  await tones.getByRole('button', { name: 'danger' }).click();
  await page.waitForTimeout(200);
  check('danger is read out at once', (await region.locator('[role="alert"]').textContent()) === 'The server did not answer.');
  const tint = await corner.locator('.mx-toast__icon > *').first().evaluate((el) => getComputedStyle(el).color);
  const textColor = await corner.locator('.mx-toast__text').evaluate((el) => getComputedStyle(el).color);
  check('its glyph has the tone color', tint !== textColor, `${tint} vs ${textColor}`);
  await page.evaluate(() => document.querySelectorAll('.mx-toast__close').forEach((b) => b.click()));
  await page.waitForTimeout(400);

  const action = page.locator('section[aria-labelledby="action"]');
  const inbox = action.locator('.toast-mails');
  const before = await inbox.textContent();
  await action.getByRole('button', { name: 'Archive the first' }).click();
  check('archiving takes the mail away', (await inbox.textContent()) !== before);
  await corner.getByRole('button', { name: 'Undo' }).click();
  await page.waitForTimeout(400);
  check('Undo brings it back and closes the toast', (await inbox.textContent()) === before && (await corner.count()) === 0);

  const duration = page.locator('section[aria-labelledby="duration"]');
  await duration.getByRole('button', { name: 'Upload a file' }).click();
  await page.waitForTimeout(1000);
  const progress = await corner.locator('.mx-toast__text').textContent();
  check('a live text follows the progress', /^Uploading… \d+%$/.test(progress) && (await corner.getByRole('button', { name: 'Close' }).count()) === 0, progress);
  await page.waitForTimeout(2600);
  check('update turns it into a success with a close button', (await corner.getAttribute('data-tone')) === 'success' && (await corner.locator('.mx-toast__text').textContent()) === 'Uploaded.' && (await corner.getByRole('button', { name: 'Close' }).count()) === 1);
  await duration.getByRole('button', { name: 'Close all' }).click();
  await page.waitForTimeout(400);

  const positions = page.locator('section[aria-labelledby="positions"]');
  await positions.getByRole('button', { name: 'top', exact: true }).click();
  await positions.getByRole('button', { name: 'top', exact: true }).click();
  await page.waitForTimeout(400);
  const top = page.locator('.mx-toaster__stack[data-position="top"] .mx-toast');
  const topBox = await box(top.first());
  check('top is centered at the top edge', Math.abs(topBox.left + topBox.width / 2 - view.w / 2) < 2 && topBox.top < 40, JSON.stringify(topBox));
  check('the newest is nearest the edge', (await top.count()) === 2 && (await box(top.nth(1))).top > topBox.top);
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await positions.getByRole('button', { name: 'bottom-end', exact: true }).click();
  await page.waitForTimeout(400);
  const rtlBox = await box(corner);
  check('bottom-end is on the left in a right-to-left page', rtlBox.left < 40, JSON.stringify(rtlBox));
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with toasts shown', violations.length === 0, violations.join(', '));

  const origin = positions.getByRole('button', { name: 'bottom-end', exact: true });
  await origin.focus();
  await page.keyboard.press('F8');
  const newest = await page.evaluate(() => document.activeElement?.closest('.mx-toast')?.textContent);
  check('F8 moves focus to the newest toast', newest === 'At bottom-end.', newest);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('Escape closes it; with no other toast there focus goes back where it came from', (await corner.count()) === 0 && (await origin.evaluate((el) => document.activeElement === el)));
  await page.keyboard.press('F8');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => document.activeElement?.closest('.mx-toast')?.querySelector('.mx-toast__text')?.textContent);
  check('Escape on a close button closes its toast and focus goes to the next one', (await page.locator('.mx-toaster__stack[data-position="top"] .mx-toast').count()) === 1 && after === 'At top.', after);
  await page.keyboard.press('F8');
  check('F8 in a toast goes back to where focus was', await origin.evaluate((el) => document.activeElement === el));
  await page.evaluate(() => document.querySelectorAll('.mx-toast__close').forEach((b) => b.click()));
  await page.waitForTimeout(400);

  const own = page.locator('section[aria-labelledby="toaster"]');
  await own.getByRole('button', { name: 'max 1' }).click();
  await own.getByRole('button', { name: 'Add five' }).click();
  await page.waitForTimeout(300);
  const ownToasts = page.getByRole('region', { name: 'Demo notifications' }).locator('.mx-toast');
  check('a toaster of its own shows at most max', (await ownToasts.count()) === 1);
  await ownToasts.first().hover();
  await page.waitForTimeout(3500);
  const held = await ownToasts.allTextContents();
  check('its timer stops while the pointer is on it', held.length === 1 && held[0].startsWith('photo-1.jpg'), held.join(' | '));
  await page.mouse.move(5, 890);
  await page.waitForTimeout(3700);
  check('…then it goes and the next one comes in', (await ownToasts.count()) === 1 && (await ownToasts.first().textContent()).startsWith('photo-2.jpg'));
  await own.getByRole('button', { name: 'max 3' }).click();
  await page.waitForTimeout(300);
  check('a larger max lets the waiting ones in', (await ownToasts.count()) === 3);
}
