/** Real-browser checks of the tree view page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'treeview', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const item = (tree, name) => tree.getByRole('treeitem', { name, exact: true });
  const focused = (loc) => loc.evaluate((el) => document.activeElement === el);

  const ways = page.locator('.tv-ways');
  const tree = ways.getByRole('tree', { name: 'Project files' });
  check('a tree named by its label, with one Tab stop', (await tree.count()) === 1 && (await ways.locator('[role="treeitem"][tabindex="0"]').count()) === 1);
  check('the row in value is selected', (await item(ways, 'TreeView.ts').getAttribute('aria-selected')) === 'true');
  await item(ways, 'docs').locator(':scope > .mx-tree-view__row > .mx-tree-view__text').click();
  check('a press selects and writes x-model', (await page.locator('.tv-value').textContent()) === 'value: "docs"');
  await page.keyboard.press('ArrowRight');
  check('Right opens the row', (await item(ways, 'docs').getAttribute('aria-expanded')) === 'true' && (await item(ways, 'guide.md').isVisible()));
  await page.keyboard.press('ArrowRight');
  check('Right again goes to its first child', await focused(item(ways, 'guide.md')));
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  check('Left goes to the parent, then closes it', (await focused(item(ways, 'docs'))) && (await item(ways, 'docs').getAttribute('aria-expanded')) === 'false');
  await page.keyboard.press('Home');
  check('Home goes to the first row', await focused(item(ways, 'src')));
  await page.keyboard.press('p');
  check('a letter jumps to the next row with it', await focused(item(ways, 'package.json')));
  const textOf = (name) => item(ways, name).locator(':scope > .mx-tree-view__row > .mx-tree-view__text');
  const [srcRow, appRow] = [await box(textOf('src')), await box(textOf('main.ts'))];
  check('a child row is indented', appRow.left - srcRow.left > 10, `${appRow.left - srcRow.left}px`);
  check('the focus ring shows on the row for the keyboard', await item(ways, 'package.json').locator(':scope > .mx-tree-view__row').evaluate((el) => getComputedStyle(el).outlineStyle === 'solid'));
  await page.getByRole('button', { name: 'Add a product from code' }).click();
  await page.waitForTimeout(100);
  check('items changed in place are drawn again on refresh()', (await page.getByRole('treeitem', { name: 'Product 1' }).count()) === 1);

  const lazy = page.locator('.tv-lazy');
  await item(lazy, 'My disk').locator(':scope > .mx-tree-view__row > .mx-tree-view__expander').click();
  check('a row loading its children is busy', (await item(lazy, 'My disk').getAttribute('aria-busy')) === 'true');
  await item(lazy, 'Documents').waitFor();
  check('the children arrive', (await lazy.getByRole('treeitem').count()) === 5 && (await item(lazy, 'My disk').getAttribute('aria-busy')) === null);
  await item(lazy, 'Shared').dblclick();
  await lazy.locator('.mx-tree-view__retry').waitFor();
  check('a failed load offers a retry', (await item(lazy, 'Shared').getAttribute('aria-expanded')) === 'false' && (await lazy.locator('.mx-tree-view__error').textContent()).includes('Could not load.'));
  await lazy.locator('.mx-tree-view__retry').click();
  await item(lazy, 'team.xlsx').waitFor();
  check('the retry loads it', (await item(lazy, 'Shared').getAttribute('aria-expanded')) === 'true');

  const select = page.locator('.tv-select');
  await item(select, 'Ankara').click();
  await item(select, 'İzmir').click({ modifiers: ['Shift'] });
  await item(select, 'Germany').click({ modifiers: ['ControlOrMeta'] });
  check('Shift and Ctrl presses select several', (await page.locator('.tv-picked').textContent()) === 'value: ["ankara","istanbul","izmir","de"]');
  check('the tree says it is multi-select', (await select.getByRole('tree').getAttribute('aria-multiselectable')) === 'true');

  const checks = page.locator('.tv-checks');
  check('a parent with some rows checked is mixed', (await item(checks, 'Users').getAttribute('aria-checked')) === 'mixed');
  await item(checks, 'Users').locator(':scope > .mx-tree-view__row > .mx-tree-view__check').click();
  check('checking a parent checks its children', (await item(checks, 'Users').getAttribute('aria-checked')) === 'true' && (await page.locator('.tv-checked').textContent()).includes('"users","users.view","users.edit","users.delete"'));
  await item(checks, 'Roles').focus();
  await page.keyboard.press('Space');
  check('Space toggles the check box', (await item(checks, 'Administration').getAttribute('aria-checked')) === 'true');

  const search = page.locator('.tv-search');
  await search.getByRole('searchbox').fill('to');
  await page.waitForTimeout(100);
  const shown = await search.locator('.mx-tree-view__text').allTextContents();
  check('the search shows matches with their parents', shown.join('|') === 'Asia|Japan|Tokyo|Americas|Canada|Toronto', shown.join('|'));
  await page.keyboard.press('ArrowDown');
  check('Down in the search box goes into the tree', await focused(item(search, 'Asia')));

  await page.getByRole('button', { name: 'Expand all' }).nth(1).click();
  const large = page.locator('.tv-large');
  const drawn = await large.getByRole('treeitem').count();
  check('a long tree draws only the rows in view', drawn > 5 && drawn < 80, `${drawn} rows drawn`);
  check('every row knows its place', (await large.getByRole('treeitem').first().getAttribute('aria-setsize')) === '50');
  await page.getByRole('button', { name: 'Go to Person 37.150' }).click();
  check('focusNode scrolls a far row into view and focuses it', await focused(item(large, 'Person 37.150')));
  await page.keyboard.press('ArrowDown');
  check('the keys go on from there', await focused(item(large, 'Person 37.151')));

  await page.addScriptTag({ content: axeSource });
  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    await page.waitForTimeout(300);
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('main') ?? document)).violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`));
    check(`axe clean with rows open, checked, busy and filtered (${theme})`, violations.length === 0, violations.join(', '));
  }
  await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));

  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  await item(ways, 'docs').focus();
  await page.keyboard.press('ArrowLeft');
  const rtlOpen = (await item(ways, 'docs').getAttribute('aria-expanded')) === 'true';
  await page.keyboard.press('ArrowRight');
  check('right to left, Left opens and Right closes', rtlOpen && (await item(ways, 'docs').getAttribute('aria-expanded')) === 'false');
  const [parentText, childText] = [await box(textOf('src')), await box(textOf('main.ts'))];
  check('right to left, children are indented from the right', parentText.right - childText.right > 10, `${parentText.right - childText.right}px`);
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));
}
