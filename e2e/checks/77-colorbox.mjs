/** Real-browser checks of the colour box page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'colorbox', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const input = ways.getByRole('textbox', { name: 'Accent' });
  await input.waitFor();
  await input.fill('#e03131');
  await input.press('Enter');
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="ways"]').textContent.includes('Value: #e03131'), null, { timeout: 2000 }).catch(() => {});
  check('a hex typed becomes the value, back through x-model', (await ways.textContent()).includes('Value: #e03131'));

  // The popup: the area's handle takes focus; a preset is taken at once.
  await input.press('Alt+ArrowDown');
  const dialog = page.getByRole('dialog', { name: 'Choose color' });
  await dialog.waitFor();
  check('Alt+Down opens the picker with focus on the area', (await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) === 'Saturation and brightness');
  await dialog.locator('.mx-color-picker__swatch').first().click();
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="ways"]').textContent.includes('Value: #3b5bdb'), null, { timeout: 2000 }).catch(() => {});
  check('a preset is taken at once', (await ways.textContent()).includes('Value: #3b5bdb'));
  await page.keyboard.press('Escape');

  // Dragging on the area moves the handle there, and the value with it.
  const picker = page.locator('section[aria-labelledby="picker"] .mx-color-picker');
  const area = picker.locator('.mx-color-picker__area');
  await area.scrollIntoViewIfNeeded();
  const box = await area.boundingBox();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1);
  await page.mouse.down();
  await page.mouse.move(box.x + 2, box.y + 2, { steps: 4 });
  await page.mouse.up();
  const thumb = await picker.locator('.mx-color-picker__area .mx-color-picker__thumb').boundingBox();
  check('the handle follows a drag, centred on its point', Math.abs(thumb.x + thumb.width / 2 - (box.x + 2)) < 1.5 && Math.abs(thumb.y + thumb.height / 2 - (box.y + 2)) < 1.5, JSON.stringify({ thumb, box }));
  await page.waitForFunction(() => /Value: #f[0-9a-f]{5}/.test(document.querySelector('section[aria-labelledby="picker"]').textContent), null, { timeout: 2000 }).catch(() => {});
  check('the value follows the drag (near white at the top left)', /Value: #f[0-9a-f]{5}/.test(await picker.locator('..').textContent()));

  // OK and Cancel.
  const buttons = page.locator('section[aria-labelledby="buttons"]');
  const overlay = buttons.getByRole('textbox', { name: 'Overlay' });
  await overlay.press('Alt+ArrowDown');
  const second = page.getByRole('dialog', { name: 'Choose color' });
  await page.keyboard.press('End');
  await second.getByRole('button', { name: 'Cancel' }).click();
  check('Cancel leaves the value', (await buttons.textContent()).includes('Value: #00000080'));

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
