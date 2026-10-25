/** Real-browser checks of the numberbox page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'numberbox', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));

  const ways = page.locator('section[aria-labelledby="ways"]');
  const quantity = ways.getByRole('spinbutton', { name: 'Quantity' });
  await quantity.click();
  await page.keyboard.press('ArrowUp');
  check('ArrowUp steps and writes back', (await page.locator('.nb-quantity').textContent()) === 'value: 4' && (await quantity.getAttribute('aria-valuenow')) === '4');
  await page.keyboard.press('End');
  check('End goes to max', (await quantity.inputValue()) === '99');
  await page.keyboard.press('Control+a');
  await page.keyboard.type('12');
  check('typing a whole number writes back at once', (await page.locator('.nb-quantity').textContent()) === 'value: 12');
  await page.keyboard.type('a');
  check('letters are kept out', (await quantity.inputValue()) === '12');

  const steps = page.locator('section[aria-labelledby="steps"]');
  const rate = steps.getByRole('spinbutton', { name: 'Rate' });
  await rate.click();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  check('0.1 + 0.1 + 0.1 is 0.3', (await page.locator('.nb-rate').textContent()) === 'value: 0.3' && (await rate.inputValue()) === '0.3');
  await page.mouse.move(...(await center(rate, box)));
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(50);
  check('the wheel steps while focused', (await page.locator('.nb-rate').textContent()) === 'value: 0.4');

  const spin = page.locator('section[aria-labelledby="spin"]');
  const seats = spin.getByRole('spinbutton', { name: 'Seats' });
  const up = spin.getByRole('button', { name: 'Increase' });
  await up.click();
  check('a spin button steps and focuses the field', (await seats.inputValue()) === '3' && (await seats.evaluate((el) => document.activeElement === el)));
  await up.hover();
  await page.mouse.down();
  await page.waitForTimeout(900);
  await page.mouse.up();
  check('holding it repeats up to max', (await seats.inputValue()) === '9' && (await up.isDisabled()));
  const [upBox, fieldBox] = [await box(up), await box(spin.locator('.mx-field__box'))];
  check('stacked spin buttons sit inside the box', upBox.top >= fieldBox.top && upBox.bottom <= fieldBox.bottom && upBox.right <= fieldBox.right);
  await spin.getByRole('button', { name: 'inline', exact: true }).click();
  const [minus, plus] = [await box(spin.getByRole('button', { name: 'Decrease' })), await box(spin.getByRole('button', { name: 'Increase' }))];
  check('inline spin buttons sit side by side', Math.abs(minus.top - plus.top) < 1 && minus.right <= plus.left);

  const format = page.locator('section[aria-labelledby="format"]');
  const price = format.getByRole('spinbutton', { name: 'Price' });
  check('a TRY price shows formatted in tr-TR', (await price.inputValue()) === '₺1.234,50', await price.inputValue());
  await price.click();
  check('…and turns into the plain number on focus', (await price.inputValue()) === '1234,5');
  await page.keyboard.press('Control+a');
  await page.keyboard.type('2.500,75');
  await page.keyboard.press('Tab');
  check('typed Turkish text is read', (await page.locator('.nb-price').textContent()) === 'value: 2500.75' && (await price.inputValue()) === '₺2.500,75');
  const share = format.getByRole('spinbutton', { name: 'Share' });
  check('a percent shows formatted', (await share.getAttribute('aria-valuetext')) === '12.5%');
  await share.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('40');
  await page.keyboard.press('Tab');
  check('…and is edited as shown', (await page.locator('.nb-share').textContent()) === 'value: 0.4' && (await share.inputValue()) === '40%');

  const range = page.locator('section[aria-labelledby="range"]');
  const score = range.getByRole('spinbutton', { name: 'Score' });
  await score.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('250');
  await page.keyboard.press('Tab');
  check('an entered value is clamped to max', (await score.inputValue()) === '100');
  const age = range.getByRole('spinbutton', { name: 'Age' });
  await age.click();
  await page.keyboard.type('12');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  check('with clamp off the range check reports it', (await range.locator('.mx-field__message').nth(1).textContent()) === 'Enter a value from 18 to 120.' && (await age.getAttribute('aria-invalid')) === 'true');

  const decimals = page.locator('section[aria-labelledby="decimals"]');
  const weight = decimals.getByRole('spinbutton', { name: 'Weight' });
  await weight.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('80.26');
  await page.keyboard.press('Tab');
  check('decimals rounds what is entered', (await page.locator('.nb-weight').textContent()) === 'value: 80.3');
  const guests = decimals.getByRole('spinbutton', { name: 'Guests' });
  await guests.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Tab');
  check('allowEmpty off puts min back', (await guests.inputValue()) === '1');

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with an error shown', violations.length === 0, violations.join(', '));
}

async function center(locator, box) {
  const b = await box(locator);
  return [b.left + b.width / 2, b.top + b.height / 2];
}
