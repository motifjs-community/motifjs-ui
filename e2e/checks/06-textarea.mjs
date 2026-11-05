/** Real-browser checks of the textarea page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'textarea', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));

  const ways = page.locator('section[aria-labelledby="ways"]');
  const comment = ways.getByLabel('Comment', { exact: true });
  await comment.fill('Hello\nworld');
  check('typing writes back through x-model', (await ways.locator('.mx-field__message').first().textContent()) === '11 characters');
  await ways.getByRole('button', { name: 'Add a note programmatically' }).click();
  check('a textarea created with new is added and focused', await page.getByLabel('Note 1', { exact: true }).evaluate((el) => document.activeElement === el));

  const grow = page.locator('section[aria-labelledby="grow"]');
  const story = grow.getByLabel('Story');
  const rest = (await box(story)).height;
  await story.click();
  await page.keyboard.type('one');
  for (const word of ['two', 'three', 'four']) {
    await page.keyboard.press('Enter');
    await page.keyboard.type(word);
  }
  const grown = (await box(story)).height;
  check('autoGrow grows with the lines', grown > rest * 1.5, `${rest} → ${grown}`);
  for (const word of ['five', 'six', 'seven', 'eight', 'nine']) {
    await page.keyboard.press('Enter');
    await page.keyboard.type(word);
  }
  const capped = (await box(story)).height;
  const scrolls = await story.evaluate((el) => el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY === 'auto');
  check('…up to maxRows, then it scrolls', capped < grown * 1.8 && scrolls, `${grown} → ${capped}`);
  await story.fill('');
  check('…and shrinks back to minRows', Math.abs((await box(story)).height - rest) < 2);

  const resize = page.locator('section[aria-labelledby="resize"]');
  const notesBox = resize.locator('.mx-field__box');
  check('the box carries a vertical resize grip', (await notesBox.evaluate((el) => getComputedStyle(el).resize)) === 'vertical');
  await resize.getByRole('button', { name: 'none', exact: true }).click();
  check('resize none takes it away', (await notesBox.evaluate((el) => getComputedStyle(el).resize)) === 'none');

  const counter = page.locator('section[aria-labelledby="counter"]');
  await counter.getByLabel('Bio').fill('Short');
  check('the counter counts', (await counter.locator('.mx-field__counter').textContent()) === '5/160');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  check('minLength is checked when the field is left', (await counter.locator('.mx-field__message').textContent()) === 'Enter at least 10 characters.');

  const enter = page.locator('section[aria-labelledby="enter"]');
  const msg = enter.getByLabel('Message');
  await msg.click();
  await page.keyboard.type('first');
  await page.keyboard.press('Enter');
  await page.keyboard.type('second');
  check('Enter starts a new line', (await msg.inputValue()) === 'first\nsecond');
  await page.keyboard.press('Control+Enter');
  check('Ctrl+Enter fires onEnter', (await enter.locator('.ta-sent li').count()) === 1 && (await msg.inputValue()) === '');

  // The first line sits where a one-line field puts its text.
  const area = await box(story);
  const fieldBox = await box(grow.locator('.mx-field__box'));
  check('the textarea fills its box', area.width > fieldBox.width * 0.8);

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with an error shown', violations.length === 0, violations.join(', '));
}
