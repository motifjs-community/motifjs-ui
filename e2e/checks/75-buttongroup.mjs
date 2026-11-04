/** Real-browser checks of the button group page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'buttongroup', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const view = ways.getByRole('group', { name: 'View' });
  await view.waitFor();
  await view.getByRole('button', { name: 'Month' }).click();
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="ways"]').textContent.includes('View: Month'), null, { timeout: 2000 }).catch(() => {});
  check('a press chooses, back through x-model', (await ways.textContent()).includes('View: Month') && (await view.getByRole('button', { name: 'Month' }).getAttribute('aria-pressed')) === 'true');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="ways"]').textContent.includes('View: Week'), null, { timeout: 2000 }).catch(() => {});
  check('the arrow keys move and Enter chooses', (await ways.textContent()).includes('View: Week'));
  const stops = await view.locator('.mx-button__face').evaluateAll((els) => els.filter((el) => el.tabIndex >= 0).length);
  check('the group is one Tab stop', stops === 1, String(stops));

  // Touching buttons share one frame line, and only the outer corners are round.
  const shape = await view.locator('.mx-button__face').evaluateAll((els) => {
    const [a, b] = els.map((el) => el.getBoundingClientRect());
    const s = els.map((el) => getComputedStyle(el));
    const frame = parseFloat(s[0].borderRightWidth);
    return { overlap: a.right - b.left, frame, innerEnd: s[0].borderTopRightRadius, innerStart: s[1].borderTopLeftRadius };
  });
  check('touching buttons share one line, inner corners square', Math.abs(shape.overlap - shape.frame) < 0.5 && shape.innerEnd === '0px' && shape.innerStart === '0px', JSON.stringify(shape));

  const selections = page.locator('section[aria-labelledby="selections"]');
  await selections.getByRole('button', { name: 'Italic' }).click();
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="selections"]').textContent.includes('Marks: bold, italic'), null, { timeout: 2000 }).catch(() => {});
  check('several turn on together', (await selections.textContent()).includes('Marks: bold, italic'));
  await selections.getByRole('button', { name: 'Copy' }).click();
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="selections"]').textContent.includes('Pressed: Copy'), null, { timeout: 2000 }).catch(() => {});
  check('without selection a press is an action', (await selections.textContent()).includes('Pressed: Copy'));

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
