/** Real-browser checks of the switch page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'switch', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const ways = page.locator('section[aria-labelledby="ways"]');
  const wifi = ways.getByRole('switch', { name: 'Wi-Fi' });
  // The page draws its sections after `load`.
  await wifi.first().waitFor();
  check('it is a switch named by its caption, on', (await wifi.count()) === 1 && (await wifi.isChecked()));
  const thumb = ways.locator('.mx-switch__thumb').first();
  const onAt = (await box(thumb)).left;
  await wifi.click();
  await page.waitForTimeout(400);
  const offAt = (await box(thumb)).left;
  check('a click flips it and writes back through x-model', !(await wifi.isChecked()) && (await ways.locator('.mx-field__message').first().textContent()) === 'Not connected.');
  check('the thumb slides to the start', offAt < onAt, `${onAt} → ${offAt}`);
  const track = await box(wifi);
  const thumbBox = await box(thumb);
  check('the thumb sits inside the track', thumbBox.left > track.left && thumbBox.right < track.right && thumbBox.top > track.top && thumbBox.bottom < track.bottom);
  await page.keyboard.press('Enter');
  check('Enter flips it', await wifi.isChecked());
  await page.keyboard.press('Space');
  check('Space flips it', !(await wifi.isChecked()));
  await ways.getByText('Wi-Fi', { exact: true }).click();
  check('a click on the caption flips it', await wifi.isChecked());
  await ways.getByRole('button', { name: 'Add a switch programmatically' }).click();
  await page.keyboard.press('Space');
  check('a switch created with new is added, focused and reports changes', (await page.locator('.sw-result').textContent()) === 'Feature 1: on');

  const texts = page.locator('section[aria-labelledby="texts"]');
  const sync = texts.getByRole('switch', { name: 'Sync' });
  const syncField = texts.locator('.sw-sync');
  const off = syncField.locator('.mx-switch__off');
  const [inTrack, offInside] = [await box(sync), await box(off)];
  check('inside, the text is drawn in the track', offInside.left > inTrack.left && offInside.right < inTrack.right);
  check('the text is hidden from screen readers', (await syncField.locator('.mx-switch__text').getAttribute('aria-hidden')) === 'true');
  await texts.getByRole('button', { name: 'beside', exact: true }).click();
  const [besideTrack, offBeside] = [await box(sync), await box(off)];
  check('beside, it follows the track', offBeside.left >= besideTrack.right);
  await sync.click();
  check('the on text takes the place of the off text', (await syncField.locator('.mx-switch__on').isVisible()) && !(await off.isVisible()));

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));

  const states = page.locator('section[aria-labelledby="states"]');
  await states.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(100);
  const agree = states.getByRole('switch', { name: 'I agree to the terms' });
  check('required: it must be on, and gets focus', (await agree.evaluate((el) => document.activeElement === el)) && (await states.locator('.mx-field__message').first().textContent()) === 'This field is required.');
  await page.keyboard.down('Alt');
  await page.keyboard.press('a');
  await page.keyboard.up('Alt');
  await page.waitForTimeout(50);
  check('the &agree access key flips it and the error goes', (await agree.isChecked()) && (await states.locator('.mx-field__message').first().textContent()) === '');
  await states.getByRole('button', { name: 'Toggle' }).click();
  const readOnly = states.getByRole('switch', { name: 'Read-only' });
  await readOnly.click();
  await page.keyboard.press('Enter');
  check('read-only, it does not flip', (await readOnly.isChecked()) && (await readOnly.getAttribute('aria-readonly')) === 'true');
  check('disabled, it is a disabled native checkbox', await states.getByRole('switch', { name: 'Disabled on' }).isDisabled());

  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await page.waitForTimeout(400);
  const caption = page.locator('section[aria-labelledby="caption"]');
  const updates = caption.getByRole('switch', { name: 'Automatic updates' });
  const [rtlTrack, rtlThumb] = [await box(updates), await box(caption.locator('.mx-switch__thumb').first())];
  check('right to left, an on thumb sits at the left end', rtlThumb.left - rtlTrack.left < rtlTrack.right - rtlThumb.right);
  const rtlLabel = await box(caption.locator('.mx-field__label').first());
  check('…and a caption at the start is on the right', rtlLabel.left >= rtlTrack.right);
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));
}
