/** Real-browser checks of the AppMenu pages. */
export default async function ({ page, base, check }) {
    const open = async (button, menu) => {
        await page.getByRole('button', { name: button, exact: true }).first().click();
        await page.waitForTimeout(400);
        return page.locator(`.mx-app-menu.${menu}`);
    };
    const close = async () => {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
    };

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(base + 'appmenu', { waitUntil: 'load' });
    let menu = await open('File', 'am-file');
    const panel = menu.locator('.mx-app-menu__panel');
    const item = key => menu.locator(`.mx-app-menu__item[data-key="${key}"]`);
    let box = await panel.boundingBox();
    check('on a wide window the menu covers half of it, from the start edge', box.x < 1 && Math.abs(box.width - 640) < 2, `${box.x} ${box.width}`);
    check('the panel is a modal dialog with a named list', (await panel.getAttribute('role')) === 'dialog' && (await menu.locator('nav.mx-app-menu__nav').getAttribute('aria-label')) === 'File');
    check('focus goes to the item shown', await item('home').evaluate(el => el === document.activeElement));
    check('the first page is shown beside the list', (await item('home').getAttribute('aria-current')) === 'page' && (await menu.getByRole('heading', { name: 'Good morning' }).isVisible()));
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    check('Arrow Down and Enter show the next page', (await item('new').getAttribute('aria-current')) === 'page');
    await page.keyboard.press('s');
    await page.waitForTimeout(400);
    check('an access key runs its command and closes the menu', (await page.locator('.am-file-told').textContent()) === 'Last command: save' && !(await panel.isVisible()));

    // A narrow window: the menu takes the whole window, the list and the page take turns.
    await page.setViewportSize({ width: 420, height: 800 });
    menu = await open('File', 'am-file');
    box = await menu.locator('.mx-app-menu__panel').boundingBox();
    check('on a narrow window the menu covers the whole window', Math.abs(box.width - 420) < 2 && (await menu.getAttribute('data-full')) !== null);
    check('the list is shown alone', (await menu.getAttribute('data-stacked')) !== null && (await menu.getAttribute('data-view')) === 'list');
    const closeBox = await menu.locator('.mx-app-menu__close').boundingBox();
    await item('open').click();
    await page.waitForTimeout(500);
    check('choosing a page shows it in place of the list', (await menu.getAttribute('data-view')) === 'page' && (await menu.getByRole('heading', { name: 'Open' }).isVisible()));
    const backBox = await menu.locator('.mx-app-menu__back').boundingBox();
    check('the back button stands where the close button stood', Math.abs(backBox.x - closeBox.x) <= 0.5 && Math.abs(backBox.y - closeBox.y) <= 0.5, `${backBox.x},${backBox.y} ${closeBox.x},${closeBox.y}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    check('Escape returns to the list', (await menu.getAttribute('data-view')) === 'list' && (await menu.locator('.mx-app-menu__panel').isVisible()));

    // Right to left: the panel comes from the right, the arrows point to it.
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    await page.waitForTimeout(200);
    await item('open').click();
    await page.waitForTimeout(500);
    const scale = await menu.locator('.mx-app-menu__back .mx-glyph').evaluate(el => getComputedStyle(el).scale);
    check('in right-to-left pages the back arrow points to the right', scale.startsWith('-1'), scale);
    await close();
    await close();
    await page.evaluate(() => document.documentElement.removeAttribute('dir'));
    await page.setViewportSize({ width: 1280, height: 800 });

    // Slots and search.
    await page.goto(base + 'appmenu/search', { waitUntil: 'load' });
    menu = await open('Settings', 'am-slots');
    const top = await menu.locator('.mx-app-menu__header-slot').boundingBox();
    const first = await menu.locator('.mx-app-menu__item').first().boundingBox();
    const bottom = await menu.locator('.mx-app-menu__footer-slot').boundingBox();
    const nav = await menu.locator('.mx-app-menu__nav').boundingBox();
    check('the header stands above the items, the footer at the bottom', top.y + top.height <= first.y && bottom.y + bottom.height > nav.y + nav.height - 40, `${top.y} ${first.y} ${bottom.y + bottom.height} ${nav.y + nav.height}`);
    const search = menu.locator('.mx-app-menu__search input');
    await search.fill('acc');
    await page.waitForTimeout(200);
    const shown = await menu.locator('.mx-app-menu__item:visible').allTextContents();
    check('typing leaves the items that hold the text', shown.length === 1 && shown[0].includes('Accessibility'), shown.join(','));
    check('the app hears what was typed', (await page.locator('.am-slots-told').textContent()) === 'Searching for “acc”');
    await search.fill('zzz');
    await page.waitForTimeout(200);
    check('it says so when nothing matches', (await menu.locator('.mx-app-menu__no-match').isVisible()) && (await menu.locator('.mx-app-menu__item:visible').count()) === 0);
    await menu.locator('.mx-app-menu__search .mx-field__clear').click();
    await page.waitForTimeout(200);
    check('the clear button ends the search', (await page.locator('.am-slots-told').textContent()) === 'Not searching' && (await menu.locator('.mx-app-menu__item:visible').count()) === 9);
    await search.fill('adv');
    await page.waitForTimeout(150);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    check('Enter in the search shows the first item left', (await menu.locator('.mx-app-menu__item[data-key="advanced"]').getAttribute('aria-current')) === 'page');
    await search.focus();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    check('Escape clears the search first', (await search.inputValue()) === '' && (await menu.locator('.mx-app-menu__panel').isVisible()));
    await close();

    // Changes by key.
    await page.goto(base + 'appmenu/programmatic', { waitUntil: 'load' });
    const press = name => page.getByRole('button', { name, exact: true }).click();
    await press('Add Print');
    await press('New message on Account');
    await press('Move Save first');
    await press('Remove Open');
    menu = await open('Open the menu', 'am-programmatic');
    const keys = await menu.locator('.mx-app-menu__item').evaluateAll(els => els.map(el => el.getAttribute('data-key')));
    check('items are added, moved and removed by key', keys.join(',') === 'save,home,print,account', keys.join(','));
    check('a changed item shows its new badge', (await menu.locator('.mx-app-menu__item[data-key="account"] .mx-app-menu__badge').textContent()).trim() === '1');
    check('each change reports a new list', (await page.locator('.am-programmatic-told').textContent()) === '4 changes');
    await close();
}
