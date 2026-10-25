/** Real-browser checks of the tabs page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'tabs', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));

  const ways = page.locator('section[aria-labelledby="ways"]');
  const settings = ways.getByRole('tablist', { name: 'Settings' });
  const general = settings.getByRole('tab', { name: 'General' });
  await general.click();
  await page.keyboard.press('ArrowRight');
  check('an arrow key selects the next tab and writes x-model', (await page.locator('.tabs-page').textContent()) === 'value: "advanced"' && (await settings.getByRole('tab', { name: 'Advanced' }).getAttribute('aria-selected')) === 'true');
  await page.keyboard.press('End');
  check('End goes to the last tab', await settings.getByRole('tab', { name: 'About' }).evaluate((el) => document.activeElement === el));
  await page.keyboard.press('Home');
  await page.keyboard.press('Tab');
  const name = ways.getByLabel('Name', { exact: true });
  check('Tab goes from the strip into the panel', await name.evaluate((el) => document.activeElement === el));
  await page.keyboard.type('Ada');
  await page.keyboard.down('Alt');
  await page.keyboard.press('a');
  await page.keyboard.up('Alt');
  await page.keyboard.down('Alt');
  await page.keyboard.press('g');
  await page.keyboard.up('Alt');
  check('access keys select tabs, and the panel keeps what was typed', (await name.inputValue()) === 'Ada' && (await general.getAttribute('aria-selected')) === 'true');

  await ways.getByRole('button', { name: 'Add a report from code' }).click();
  const reports = ways.getByRole('tablist', { name: 'Reports' });
  check('a tab added from code is selected', (await reports.getByRole('tab', { name: 'Report 1' }).getAttribute('aria-selected')) === 'true' && (await page.locator('.tabs-log').textContent()) === 'Selected “Report 1” from code.');

  const closable = page.locator('section[aria-labelledby="closable"]');
  const docs = closable.getByRole('tablist', { name: 'Documents' });
  await docs.getByRole('tab', { name: 'Notes' }).locator('.mx-tabs__close').click();
  check('the close button closes its tab', (await docs.getByRole('tab').count()) === 3);
  await docs.getByRole('tab', { name: 'Draft' }).click();
  await page.keyboard.press('Delete');
  check('onClose can keep a tab open', (await docs.getByRole('tab', { name: 'Draft' }).count()) === 1);
  await closable.getByRole('button', { name: 'Draft is protected' }).click();
  await docs.getByRole('tab', { name: 'Draft' }).focus();
  await page.keyboard.press('Delete');
  const focusedTab = await page.evaluate(() => document.activeElement?.getAttribute('role'));
  check('Delete closes the focused tab and focus stays in the strip', (await docs.getByRole('tab', { name: 'Draft' }).count()) === 0 && focusedTab === 'tab');

  const overflow = page.locator('section[aria-labelledby="overflow"]');
  const months = overflow.getByRole('tablist', { name: 'Months' });
  const forward = overflow.locator('.mx-tabs__scroll[data-direction="forward"]');
  check('scroll buttons show when the tabs do not fit', await forward.isVisible());
  const before = await months.evaluate((el) => el.scrollLeft);
  await forward.click();
  await page.waitForTimeout(500);
  check('the forward button scrolls the strip', (await months.evaluate((el) => el.scrollLeft)) > before);
  await months.getByRole('tab', { name: 'January' }).click();
  await page.keyboard.press('End');
  await page.waitForTimeout(100);
  const [strip, last] = [await box(months), await box(months.getByRole('tab', { name: 'December' }))];
  check('the selected tab scrolls into view', last.right <= strip.right + 1 && last.left >= strip.left - 1, `${last.left}-${last.right} in ${strip.left}-${strip.right}`);
  await overflow.getByRole('button', { name: 'Scroll buttons' }).click();
  check('scrollButtons turns the buttons off', !(await forward.isVisible()));

  const placement = page.locator('section[aria-labelledby="placement"]');
  await placement.getByRole('button', { name: 'start', exact: true }).click();
  const vertical = placement.getByRole('tablist', { name: 'Placement' });
  const [list, panel] = [await box(vertical), await box(placement.locator('[role="tabpanel"]:not([hidden])'))];
  check('start placement stacks the tabs beside the panel', (await vertical.getAttribute('aria-orientation')) === 'vertical' && list.right <= panel.left + 1);
  await vertical.getByRole('tab', { name: 'Profile' }).click();
  await page.keyboard.press('ArrowDown');
  check('Down moves along a vertical strip', (await vertical.getByRole('tab', { name: 'Security' }).getAttribute('aria-selected')) === 'true');

  const manual = page.locator('.tabs-manual');
  await manual.getByRole('tab', { name: 'One' }).click();
  await page.keyboard.press('ArrowRight');
  const movedOnly = (await manual.getByRole('tab', { name: 'Two' }).getAttribute('aria-selected')) === 'false';
  await page.keyboard.press('Enter');
  check('manual activation: arrows move focus, Enter selects', movedOnly && (await manual.getByRole('tab', { name: 'Two' }).getAttribute('aria-selected')) === 'true');

  const content = page.locator('section[aria-labelledby="content"]');
  const archive = content.getByRole('tab', { name: 'Archive' });
  await content.getByRole('tab', { name: /Inbox/ }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  check('arrow keys skip a disabled tab', (await archive.getAttribute('aria-disabled')) === 'true' && (await archive.getAttribute('aria-selected')) === 'false');

  const lazy = page.locator('section[aria-labelledby="lazy"]');
  const builds = () => page.locator('.tabs-builds').textContent();
  check('panels are not built before they are shown', (await builds()) === 'Panels built: 0');
  await lazy.getByRole('tab', { name: 'Kept' }).click();
  await lazy.getByLabel('Type, switch tabs, come back').fill('kept');
  await lazy.getByRole('tab', { name: 'Made each time' }).click();
  await lazy.getByLabel('This one starts empty each time').fill('gone');
  await lazy.getByRole('tab', { name: 'Kept' }).click();
  await lazy.getByRole('tab', { name: 'Made each time' }).click();
  check('a kept panel keeps its input; keepAlive off makes it again', (await builds()) === 'Panels built: 3' && (await lazy.getByLabel('This one starts empty each time').inputValue()) === '');
  await lazy.getByRole('tab', { name: 'Kept' }).click();
  check('…and the kept one still has its text', (await lazy.getByLabel('Type, switch tabs, come back').inputValue()) === 'kept');

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with closable, vertical and overflowing tabs', violations.length === 0, violations.join(', '));
}
