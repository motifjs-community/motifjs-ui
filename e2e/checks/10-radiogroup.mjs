/** Real-browser checks of the radio group page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'radiogroup', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const focused = (loc) => loc.evaluate((el) => document.activeElement === el);
  const ways = page.locator('section[aria-labelledby="ways"]');
  const sizes = ways.getByRole('radiogroup', { name: 'Size' });
  const radio = (name) => sizes.getByRole('radio', { name, exact: true });
  // The page draws its sections after `load`.
  await sizes.first().waitFor();
  check('a radiogroup named by its label, with native radios', (await sizes.count()) === 1 && (await sizes.getByRole('radio').count()) === 4 && (await radio('M').isChecked()));

  await page.locator('section[aria-labelledby="import"] pre').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  check('Tab enters the group on the chosen option', await focused(radio('M')));
  check('…with the focus ring, for the keyboard', await radio('M').evaluate((el) => el.matches(':focus-visible')));
  await page.keyboard.press('ArrowDown');
  check('↓ moves and chooses', (await focused(radio('L'))) && (await radio('L').isChecked()) && (await ways.locator('.mx-field__message').first().textContent()) === 'Chosen: L');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  check('…wrapping from the last to the first', (await focused(radio('S'))) && (await radio('S').isChecked()));
  await page.keyboard.press('ArrowUp');
  check('↑ wraps back', await radio('XL').isChecked());
  await page.keyboard.press('Tab');
  check('the next Tab leaves the group', await focused(ways.getByRole('button', { name: 'Add a group from code' })));
  await page.keyboard.press('Shift+Tab');
  check('Shift+Tab comes back to the chosen option', await focused(radio('XL')));
  await radio('M').click();
  check('a click chooses', (await radio('M').isChecked()) && !(await radio('M').evaluate((el) => el.matches(':focus-visible'))));
  await ways.getByRole('button', { name: 'Add a group from code' }).click();
  const wrap = page.getByRole('radiogroup', { name: 'Gift wrap' });
  check('a group created with new is added and focused', await focused(wrap.getByRole('radio', { name: 'None' })));
  await page.keyboard.press('ArrowRight');
  check('…and reports its changes', (await page.locator('.rg-result').textContent()) === 'Gift wrap: Paper');

  const data = page.locator('section[aria-labelledby="data"]');
  const plans = data.getByRole('radiogroup', { name: 'Plan' });
  await plans.getByRole('radio', { name: 'Pro — 12 €' }).focus();
  await data.getByRole('button', { name: 'Add a plan' }).click();
  await data.getByRole('button', { name: 'Raise prices' }).click();
  check('items changed in place show after refresh()', (await plans.getByRole('radio').count()) === 4 && (await plans.getByRole('radio', { name: 'Pro — 13 €' }).isChecked()));
  await plans.getByRole('radio', { name: 'Plan 4 — 61 €' }).click();
  check('itemValue gives the value', (await page.locator('.rg-plan').textContent()) === 'value: 4');

  const items = page.locator('section[aria-labelledby="items"]');
  const ship = items.getByRole('radiogroup', { name: 'Shipping' });
  const standard = ship.getByRole('radio', { name: 'Standard' });
  check('a disabled option is a disabled radio', await ship.getByRole('radio', { name: 'Express' }).isDisabled());
  check('a help line describes its option, outside its name', (await standard.evaluate((el) => document.getElementById(el.getAttribute('aria-describedby'))?.textContent)) === '3–5 working days');
  await standard.focus();
  await page.keyboard.press('ArrowDown');
  check('the arrows skip a disabled option', await ship.getByRole('radio', { name: 'Pick up in store' }).isChecked());
  await items.getByRole('button', { name: 'Open express' }).click();
  await ship.getByRole('radio', { name: 'Pick up in store' }).focus();
  await page.keyboard.press('ArrowUp');
  check('…until it is enabled again', (await ship.getByRole('radio', { name: 'Express' }).isChecked()) && (await items.getByText('Tomorrow').count()) === 1);

  const layout = page.locator('section[aria-labelledby="layout"]');
  const colors = layout.locator('.rg-colors');
  // Measured once the radios' short transitions have ended, and the next frame is drawn.
  const at = async (name) => {
    await colors.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => undefined))));
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => done())));
    return box(colors.getByRole('radio', { name, exact: true }));
  };
  // The three radios once their layout holds what is checked, measured again for up to 1.5 s: on a busy machine a
  // new layout may land a few frames after the press.
  const placed = async (ok) => {
    let three;
    for (let i = 0; i < 15; i++) {
      three = [await at('red'), await at('orange'), await at('yellow')];
      if (ok(...three)) break;
      await page.waitForTimeout(100);
    }
    return three;
  };
  const vertical = (red, orange, yellow) => Math.abs(red.left - orange.left) < 1 && orange.top > red.top && Math.abs(yellow.top - red.top) < 1 && yellow.left > red.left;
  const across = (red, orange, yellow) => Math.abs(orange.top - red.top) < 1 && orange.left > red.left && Math.abs(yellow.top - red.top) < 1;
  await layout.getByRole('button', { name: '4 columns' }).click();
  let [red, orange, yellow] = await placed(vertical);
  check('columns, vertical: down the first column, then the next', vertical(red, orange, yellow));
  await layout.getByRole('button', { name: 'horizontal' }).click();
  [red, orange, yellow] = await placed(across);
  check('columns, horizontal: across the rows', across(red, orange, yellow));
  await layout.getByRole('button', { name: 'no grid' }).click();
  [red, orange] = [await at('red'), await at('orange')];
  check('horizontal: side by side', Math.abs(orange.top - red.top) < 1 && orange.left > red.left);
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  [red, orange] = [await at('red'), await at('orange')];
  await colors.getByRole('radio', { name: 'teal' }).focus();
  await page.keyboard.press('ArrowLeft');
  check('right to left, the options run leftward and ← moves on', orange.left < red.left && (await colors.getByRole('radio', { name: 'blue' }).isChecked()));
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));

  const validation = page.locator('section[aria-labelledby="validation"]');
  await validation.getByRole('button', { name: 'Pay' }).click();
  await page.waitForTimeout(100);
  const payment = validation.getByRole('radiogroup', { name: 'Payment' });
  check('required: nothing chosen fails, the first option gets focus', (await focused(payment.getByRole('radio', { name: 'Card' }))) && (await payment.getAttribute('aria-invalid')) === 'true' && (await validation.locator('.mx-field__message').first().textContent()) === 'This field is required.');
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with an error shown', violations.length === 0, violations.join(', '));
  await page.keyboard.press('Space');
  await page.waitForTimeout(50);
  check('Space chooses, and the error goes', (await payment.getByRole('radio', { name: 'Card' }).isChecked()) && (await validation.locator('.mx-field__message').first().textContent()) === '');
  await page.keyboard.down('Alt');
  await page.keyboard.press('s');
  await page.keyboard.up('Alt');
  check('the &Size access key focuses its group on the chosen option', await focused(radio('M')));

  await validation.getByRole('button', { name: 'Toggle' }).click();
  const readOnly = validation.getByRole('radiogroup', { name: 'Read-only' });
  await readOnly.getByRole('radio', { name: 'Free' }).click();
  check('read-only: a click chooses nothing', await readOnly.getByRole('radio', { name: 'Pro' }).isChecked());
  await readOnly.getByRole('radio', { name: 'Pro' }).focus();
  await page.keyboard.press('ArrowUp');
  check('…the arrows only move', (await focused(readOnly.getByRole('radio', { name: 'Free' }))) && (await readOnly.getByRole('radio', { name: 'Pro' }).isChecked()));
  check('disabled: every radio is disabled', await validation.getByRole('radiogroup', { name: 'Disabled' }).getByRole('radio', { name: 'Free' }).isDisabled());
}
