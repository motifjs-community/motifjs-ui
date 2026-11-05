/** Real-browser checks of the layout page: Stack, Grid, Panel, GroupBox, DockPanel, SplitContainer. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'layout', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const near = (a, b, d = 2) => Math.abs(a - b) <= d;

  // From JSX and programmatically.
  const ways = page.locator('section[aria-labelledby="ways"]');
  for (let i = 0; i < 3; i++) await ways.getByRole('button', { name: 'Add a button' }).click();
  const third = ways.getByRole('button', { name: 'Button 3' });
  const [one, grown] = [await box(ways.getByRole('button', { name: 'Button 1' })), await box(third)];
  check('buttons added programmatically join the stack; one with grow takes the free space', grown.width > one.width * 2, `${one.width} vs ${grown.width}`);
  const coded = page.locator('.layout-coded');
  const [from, subject] = [await box(coded.locator('.mx-field').nth(0)), await box(coded.locator('.mx-field').nth(2))];
  check('a Grid built with new places its children (columnSpan from the child props)', subject.width > from.width * 1.8 && subject.top > from.top);

  // Stack.
  const stackCard = page.locator('section[aria-labelledby="stack"]');
  const stack = page.locator('.layout-stack-demo');
  const tiles = stack.locator('.mx-panel');
  let [a, b] = [await box(tiles.nth(0)), await box(tiles.nth(1))];
  check('a horizontal Stack sets its children side by side', b.left > a.right - 1 && near(a.top + a.height / 2, b.top + b.height / 2, 3));
  await stackCard.getByRole('button', { name: 'vertical', exact: true }).click();
  [a, b] = [await box(tiles.nth(0)), await box(tiles.nth(1))];
  check('…and one under the other when vertical', b.top >= a.bottom - 1 && near(a.left + a.width / 2, b.left + b.width / 2));
  await stackCard.getByRole('button', { name: 'horizontal', exact: true }).click();
  await stackCard.getByRole('button', { name: 'reverse', exact: true }).click();
  [a, b] = [await box(tiles.nth(0)), await box(tiles.nth(1))];
  check('reverse lays them out from the other end', a.left > b.right - 1);
  await stackCard.getByRole('button', { name: 'reverse', exact: true }).click();

  // Spacing.
  const spacing = page.locator('section[aria-labelledby="spacing"]');
  const gapOf = async () => {
    const t = page.locator('.layout-gap-demo .mx-panel');
    return (await box(t.nth(1))).left - (await box(t.nth(0))).right;
  };
  const small = await gapOf();
  await spacing.getByRole('button', { name: 'xl', exact: true }).click();
  const large = await gapOf();
  check('a gap step comes from the layout tokens', near(small, 12, 1) && near(large, 32, 1), `${small} → ${large}`);

  // Grid.
  const gridCard = page.locator('section[aria-labelledby="grid"]');
  const form = page.locator('.layout-form');
  const field = (label) => form.locator('.mx-field').filter({ has: page.getByText(label, { exact: true }) });
  let [first, last, street] = [await box(field('First name')), await box(field('Last name')), await box(field('Street'))];
  check('a Grid form: two fields per row, Street across both', near(first.top, last.top) && last.left > first.right && near(street.width, last.right - first.left, 2));
  await gridCard.getByRole('button', { name: '3 columns' }).click();
  const city = await box(field('City'));
  [first, last] = [await box(field('First name')), await box(field('Last name'))];
  check('changing columns reflows the form', near(first.top, last.top) && city.top > first.top && near(street.width, (await box(field('Street'))).width) === false);
  const tracks = page.locator('.layout-tracks .mx-panel');
  const [fixedTrack, oneFr, twoFr] = [await box(tracks.nth(0)), await box(tracks.nth(1)), await box(tracks.nth(2))];
  check("'120 * 2*' gives 120px, 1fr and 2fr", near(fixedTrack.width, 120, 1) && near(twoFr.width, oneFr.width * 2, 2), `${fixedTrack.width} ${oneFr.width} ${twoFr.width}`);

  // Panel.
  const scroll = page.locator('.layout-scroll');
  check('a scrolling Panel is a named region and a Tab stop', (await scroll.getAttribute('role')) === 'region' && (await scroll.getAttribute('tabindex')) === '0');
  await scroll.focus();
  await page.keyboard.press('PageDown');
  await page.waitForTimeout(200);
  check('…that the keys scroll', (await scroll.evaluate((el) => el.scrollTop)) > 0);

  // GroupBox.
  const groupCard = page.locator('section[aria-labelledby="groupbox"]');
  await page.keyboard.down('Alt');
  await page.keyboard.press('a');
  await page.keyboard.up('Alt');
  const streetInput = groupCard.getByLabel('Street');
  check('the GroupBox access key focuses the first control inside', await streetInput.evaluate((el) => document.activeElement === el));
  check('the group is named by its legend', (await groupCard.getByRole('group', { name: 'Address' }).count()) === 1);
  const toggle = groupCard.getByRole('button', { name: 'More options' });
  check('a collapsible box starts closed', (await toggle.getAttribute('aria-expanded')) === 'false' && !(await groupCard.getByLabel('Coupon').isVisible()));
  await toggle.click();
  check('its title button opens it', (await toggle.getAttribute('aria-expanded')) === 'true' && (await groupCard.getByLabel('Coupon').isVisible()));
  await groupCard.getByRole('button', { name: 'Enabled' }).click();
  check('a disabled GroupBox disables the fields inside', (await streetInput.isDisabled()) && (await groupCard.locator('fieldset').first().evaluate((el) => el.disabled)));
  await groupCard.getByRole('button', { name: 'Enabled' }).click();

  // DockPanel.
  const dockCard = page.locator('section[aria-labelledby="dock"]');
  const shell = page.locator('.layout-shell');
  const part = (cls) => box(shell.locator(cls));
  let [frame, header, side, status, content, help] = [await box(shell), await part('> .mx-stack[data-mx-dock="top"]'), await part('.layout-side'), await part('.layout-status'), await part('.layout-content'), await part('.layout-help')];
  check('the header is docked on top across the whole width', near(header.top, frame.top, 2) && near(header.width, frame.width, 3));
  check('the sidebar is docked at the start, under the header and down to the bottom', near(side.left, frame.left, 2) && near(side.top, header.bottom, 1) && near(side.bottom, frame.bottom, 2));
  check('the status bar, docked after it, spans what the sidebar left', near(status.bottom, frame.bottom, 2) && near(status.left, side.right, 1) && near(status.right, frame.right, 2));
  check('the content fills what is left', near(content.left, side.right, 1) && near(content.right, frame.right, 2) && near(content.top, header.bottom, 1) && near(content.bottom, status.top, 1));
  check('a float child sits at its anchors', near(frame.right - help.right, 17, 2) && near(frame.bottom - help.bottom, 49, 2), `${frame.right - help.right}, ${frame.bottom - help.bottom}`);
  await dockCard.getByRole('button', { name: 'Sidebar: start' }).click();
  [side, content] = [await part('.layout-side'), await part('.layout-content')];
  check('a getter dock moves the sidebar to the end', near(side.right, frame.right, 2) && near(content.right, side.left, 1));
  await dockCard.getByRole('button', { name: 'Notes panel programmatically' }).click();
  const notes = await part('.layout-notes');
  [side, content] = [await part('.layout-side'), await part('.layout-content')];
  check('a panel added programmatically docks too', near(notes.right, side.left, 1) && near(content.right, notes.left, 1));
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  [frame, side] = [await box(shell), await part('.layout-side')];
  check('start and end follow the reading direction', near(side.left, frame.left, 2));
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));
  await dockCard.getByRole('button', { name: 'Sidebar: end' }).click();

  // SplitContainer.
  const split = page.locator('.layout-split');
  const outerSplitter = split.locator('> .mx-split-container__splitter');
  const firstPane = split.locator('> [data-pane="first"]');
  check('the splitter is a focusable separator with a value', (await outerSplitter.getAttribute('role')) === 'separator' && (await outerSplitter.getAttribute('tabindex')) === '0' && (await outerSplitter.getAttribute('aria-valuenow')) !== null);
  await split.scrollIntoViewIfNeeded();
  let width = (await box(firstPane)).width;
  check('position gives the first pane its size', near(width, 180, 1), String(width));
  const s = await box(outerSplitter);
  await page.mouse.move(s.left + s.width / 2, s.top + s.height / 2);
  await page.mouse.down();
  await page.mouse.move(s.left + s.width / 2 + 60, s.top + s.height / 2, { steps: 5 });
  await page.mouse.up();
  width = (await box(firstPane)).width;
  check('dragging the splitter resizes the panes', near(width, 240, 2), String(width));
  check('…writes back through x-model and reports the move', (await page.locator('.layout-split-out').textContent()) === 'position: 240' && (await page.locator('.layout-split-log').textContent()) === 'moved by you');
  await outerSplitter.focus();
  await page.keyboard.press('ArrowRight');
  check('ArrowRight moves it by the step', near((await box(firstPane)).width, 250, 1));
  await page.keyboard.press('Home');
  check('Home: the first pane at its minimum size', near((await box(firstPane)).width, 120, 1));
  await page.keyboard.press('End');
  const secondWidth = (await box(split.locator('> [data-pane="second"]'))).width;
  check('End: the second pane at its minimum size', near(secondWidth, 200, 1), String(secondWidth));
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  check('Enter hides the first pane', near((await box(firstPane)).width, 0, 1) && (await outerSplitter.getAttribute('aria-valuenow')) === '0' && (await firstPane.evaluate((el) => el.inert)));
  await page.keyboard.press('Enter');
  check('…and Enter brings it back where it was', near((await box(firstPane)).width, 120, 1));
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await outerSplitter.focus();
  await page.keyboard.press('ArrowLeft');
  check('right to left, ArrowLeft makes the first pane (on the right) larger', near((await box(firstPane)).width, 130, 1));
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));
  const inner = split.locator('.mx-split-container[data-orientation="vertical"]');
  const innerSplitter = inner.locator('> .mx-split-container__splitter');
  const editor = inner.locator('> [data-pane="first"]');
  const before = (await box(editor)).height;
  await innerSplitter.focus();
  await page.keyboard.press('ArrowUp');
  check('a nested vertical split moves with Up and Down', near((await box(editor)).height, before - 10, 1) && (await innerSplitter.getAttribute('aria-orientation')) === 'horizontal');

  // Localization.
  const i18n = page.locator('section[aria-labelledby="i18n"]');
  await i18n.getByRole('button', { name: 'Language: English' }).click();
  // The pack of the language is loaded first.
  await page.waitForFunction((el) => el.getAttribute('aria-label') === 'Yeniden boyutlandır', await outerSplitter.elementHandle(), { timeout: 3000 }).catch(() => {});
  check('the splitter name follows uiLocale', (await outerSplitter.getAttribute('aria-label')) === 'Yeniden boyutlandır');
  await i18n.getByRole('button', { name: 'Dil: Türkçe' }).click();

  // Axe with a pane hidden, a box open and a docked panel added.
  await outerSplitter.focus();
  await page.keyboard.press('Enter');
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with a pane hidden and a docked panel added', violations.length === 0, violations.join(', '));
  await page.keyboard.press('Enter');
}
