/** Real-browser checks of the checkbox page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'checkbox', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const ways = page.locator('section[aria-labelledby="ways"]');
  const remember = ways.getByRole('checkbox', { name: 'Remember me' });
  // The page draws its sections after `load`.
  await remember.first().waitFor();
  check('it is a native checkbox named by its caption', (await remember.count()) === 1 && (await remember.isChecked()));
  await ways.getByText('Remember me', { exact: true }).click();
  check('a click on the caption toggles it and writes back through x-model', !(await remember.isChecked()) && (await ways.locator('.mx-field__message').first().textContent()) === 'You sign in every time.');
  check('a mouse click shows no focus ring', !(await remember.evaluate((el) => el.matches(':focus-visible'))));
  await page.keyboard.press('Space');
  check('Space toggles it', await remember.isChecked());
  await ways.getByRole('button', { name: 'Add a checkbox from code' }).click();
  check('a checkbox created with new is added and focused', await page.getByRole('checkbox', { name: 'Option 1' }).evaluate((el) => document.activeElement === el));
  await page.keyboard.press('Space');
  check('…and reports its changes', (await page.locator('.cb-result').textContent()) === 'Option 1: true');

  const states = page.locator('section[aria-labelledby="states"]');
  const mixed = states.getByRole('checkbox', { name: 'Indeterminate' });
  check('null is drawn as indeterminate', await mixed.evaluate((el) => el.indeterminate && el.closest('.mx-field').dataset.state === 'mixed'));
  const three = states.getByRole('checkbox', { name: 'Three states' });
  const seen = [];
  for (let i = 0; i < 3; i++) {
    await three.click();
    seen.push(await page.locator('.cb-three').textContent());
  }
  check('threeState cycles unchecked → checked → indeterminate → unchecked', seen.join('|') === 'value: true|value: null|value: false', seen.join('|'));
  const all = states.getByRole('checkbox', { name: 'All toppings' });
  const toppings = ['Cheese', 'Olives', 'Peppers'].map((name) => states.getByRole('checkbox', { name }));
  check('a box over a list is indeterminate while some are checked', await all.evaluate((el) => el.indeterminate));
  await all.click();
  check('a click on it checks them all', (await Promise.all(toppings.map((t) => t.isChecked()))).every(Boolean) && (await all.isChecked()));
  await all.click();
  check('…and again unchecks them all', (await Promise.all(toppings.map((t) => t.isChecked()))).every((on) => !on));
  await toppings[1].click();
  check('one checked makes it indeterminate again', await all.evaluate((el) => el.indeterminate));

  const tick = states.locator('.mx-check-box__check').nth(1);
  check('the check mark shows on a checked box', (await tick.evaluate((el) => getComputedStyle(el).opacity)) === '1');
  const fill = await states.getByRole('checkbox', { name: 'Checked', exact: true }).evaluate((el) => getComputedStyle(el).backgroundColor);
  const empty = await states.getByRole('checkbox', { name: 'Unchecked', exact: true }).evaluate((el) => getComputedStyle(el).backgroundColor);
  check('a checked box is filled with the accent', fill !== empty, `${fill} vs ${empty}`);

  const validation = page.locator('section[aria-labelledby="validation"]');
  await validation.getByRole('button', { name: 'Sign up' }).click();
  await page.waitForTimeout(100);
  const terms = validation.getByRole('checkbox', { name: 'I accept the terms' });
  check('Sign up checks the group and focuses the first box left unchecked', (await terms.evaluate((el) => document.activeElement === el)) && (await page.locator('.cb-save').textContent()) === '2 box(es) to check.');
  check('…which says why', (await validation.locator('.mx-field__message').first().textContent()) === 'This field is required.' && (await terms.getAttribute('aria-invalid')) === 'true');
  const badEdge = await terms.evaluate((el) => getComputedStyle(el).borderTopColor);
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with errors shown', violations.length === 0, violations.join(', '));
  await page.keyboard.down('Alt');
  await page.keyboard.press('t');
  await page.keyboard.up('Alt');
  check('the &terms access key toggles its box', await terms.isChecked());
  await page.waitForTimeout(50);
  const okEdge = await terms.evaluate((el) => getComputedStyle(el).borderTopColor);
  check('the error goes once it is checked', (await validation.locator('.mx-field__message').first().textContent()) === '' && badEdge !== okEdge);

  const ro = page.locator('section[aria-labelledby="states-ro"]');
  await ro.getByRole('button', { name: 'Toggle' }).click();
  const readOnly = ro.getByRole('checkbox', { name: 'Read-only' });
  await readOnly.click();
  await page.keyboard.press('Space');
  check('a read-only box does not change, but takes focus', (await readOnly.isChecked()) && (await readOnly.evaluate((el) => document.activeElement === el && el.getAttribute('aria-readonly') === 'true')));
  check('disabled, it is a disabled native checkbox', await ro.getByRole('checkbox', { name: 'Disabled', exact: true }).isDisabled());

  const caption = page.locator('section[aria-labelledby="caption"]');
  const hidden = caption.getByRole('checkbox', { name: 'Show hidden files' });
  await hidden.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  check('focus by the keyboard shows the ring', await hidden.evaluate((el) => el.matches(':focus-visible') && getComputedStyle(el).outlineStyle !== 'none'));
  const [labelEnd, boxEnd] = [await box(caption.locator('.mx-field__label').first()), await box(hidden)];
  check('the caption sits after the box', labelEnd.left >= boxEnd.right);
  await caption.getByRole('button', { name: 'start', exact: true }).click();
  const [labelStart, boxStart] = [await box(caption.locator('.mx-field__label').first()), await box(hidden)];
  check('…or before it with labelPosition="start"', labelStart.right <= boxStart.left);
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  const [labelRtl, boxRtl] = [await box(caption.locator('.mx-field__label').first()), await box(hidden)];
  check('right to left, start is on the right', labelRtl.left >= boxRtl.right);
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));
}
