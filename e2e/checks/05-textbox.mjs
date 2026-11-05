/** Real-browser checks of the textbox page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'textbox', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const ways = page.locator('section[aria-labelledby="ways"]');
  const nameField = ways.getByLabel('Name', { exact: true });
  await nameField.fill('Grace');
  check('typing writes back through x-model', (await ways.locator('.mx-field__message').first().textContent()) === 'Hello, Grace.');
  await ways.getByRole('button', { name: 'Clear' }).click();
  check('the clear button empties it and keeps focus in it', (await nameField.inputValue()) === '' && (await nameField.evaluate((el) => document.activeElement === el)));
  await page.keyboard.type('Ada');
  await page.keyboard.press('Escape');
  check('Escape empties it too', (await nameField.inputValue()) === '');
  await ways.getByRole('button', { name: 'Add a field programmatically' }).click();
  check('a field created with new is added and focused', await page.getByLabel('Field 1', { exact: true }).evaluate((el) => document.activeElement === el));

  const passwordCard = page.locator('section[aria-labelledby="password"]');
  const password = passwordCard.getByLabel('Password', { exact: true });
  await password.fill('s3cret');
  const reveal = passwordCard.getByRole('button', { name: 'Show password' });
  await reveal.click();
  check('the password button shows the password', (await password.getAttribute('type')) === 'text' && (await reveal.getAttribute('aria-pressed')) === 'true');
  await passwordCard.getByLabel('Note').fill('hello');
  check('the counter counts', (await passwordCard.locator('.mx-field__counter').textContent()) === '5/40');

  const maskCard = page.locator('section[aria-labelledby="mask"]');
  const phone = maskCard.getByLabel('Phone');
  await phone.click();
  await page.keyboard.type('532a1234567');
  check('a mask shapes what is typed, right after the click', (await phone.inputValue()) === '(532) 123 45 67' && (await page.locator('.tb-phone').textContent()) === 'value: "5321234567"');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  check('Backspace skips the fixed characters', (await phone.inputValue()) === '(532) 123 45 __');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.type('9');
  check('typing in the middle moves the rest along', (await phone.inputValue()) === '(953) 212 34 5_');
  const plate = maskCard.getByLabel('Plate');
  await plate.click();
  await page.keyboard.type('34abc12');
  check('mask characters of your own change case', (await plate.inputValue()) === '34 ABC 12_');

  const validation = page.locator('section[aria-labelledby="validation"]');
  const email = validation.getByLabel('Email');
  await email.click();
  await page.keyboard.type('ada@');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  check('a changed field is checked when it is left', (await validation.locator('.mx-field__message').first().textContent()) === 'Enter a valid email address.' && (await email.getAttribute('aria-invalid')) === 'true');
  const edge = await validation.locator('.mx-field__frame').first().evaluate((el) => getComputedStyle(el).borderBottomColor);
  const restEdge = await validation.locator('.mx-field__frame').nth(2).evaluate((el) => getComputedStyle(el).borderBottomColor);
  check('…and its box turns to the error color', edge !== restEdge, `${edge} vs ${restEdge}`);
  await email.fill('ada@motif.dev');
  await page.waitForTimeout(50);
  check('the error goes as soon as the value passes', (await validation.locator('.mx-field__message').first().textContent()) === '');
  await validation.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForTimeout(900);
  check('Save checks the group and focuses the first failed field', (await page.locator('.tb-save').textContent()) === '1 field(s) to fix.' && (await validation.getByLabel('User name').evaluate((el) => document.activeElement === el)));
  await page.keyboard.type('ada');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(900);
  check('an async rule shows the server answer', (await validation.locator('.mx-field__message').nth(1).textContent()) === '“ada” is taken.');
  await page.addScriptTag({ content: axeSource });
  const fieldViolations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with errors shown', fieldViolations.length === 0, fieldViolations.join(', '));

  const labelCard = page.locator('section[aria-labelledby="label"]');
  await labelCard.getByRole('button', { name: 'floating', exact: true }).click();
  const floating = labelCard.locator('.mx-field');
  const restSize = await floating.locator('label').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  await labelCard.getByLabel('Email').focus();
  await page.waitForTimeout(250);
  const upSize = await floating.locator('label').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  check('a floating label moves up and shrinks on focus', upSize < restSize, `${restSize} → ${upSize}`);
  await labelCard.getByRole('button', { name: 'side', exact: true }).click();
  const [sideLabel, sideBox] = [await box(floating.locator('label')), await box(floating.locator('.mx-field__box'))];
  check('a side label sits next to the box', sideLabel.right <= sideBox.left && Math.abs(sideLabel.top + sideLabel.height / 2 - (sideBox.top + sideBox.height / 2)) < 4);

  await page.keyboard.down('Alt');
  await page.keyboard.press('n');
  await page.keyboard.up('Alt');
  check('the &Name access key focuses its field', await nameField.evaluate((el) => document.activeElement === el));
}
