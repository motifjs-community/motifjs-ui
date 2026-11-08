/** Real-browser checks of the RibbonMenu pages. */
export default async function ({ page, base, check }) {
    await page.goto(base + 'ribbonmenu', { waitUntil: 'load' });
    const rb = page.locator('.rb-editor');
    await rb.waitFor();
    await rb.scrollIntoViewIfNeeded();
    const tab = key => rb.locator(`.mx-ribbon-menu__tab[data-key="${key}"]`);
    const body = rb.locator('.mx-ribbon-menu__body');
    check('the tabs are a tablist, the first tab shown', (await rb.locator('.mx-ribbon-menu__tabs').getAttribute('role')) === 'tablist' && (await tab('home').getAttribute('aria-selected')) === 'true');

    // The menu keeps its height from tab to tab, in every design language and both layouts.
    const heights = [];
    for (const language of ['tactile', 'lounge', 'material', 'fluent', 'lilac']) {
        await page.evaluate(l => document.documentElement.setAttribute('data-design-language', l), language);
        await page.waitForTimeout(200);
        const seen = new Set();
        for (const key of ['home', 'insert', 'view']) {
            await tab(key).click();
            await page.waitForTimeout(80);
            seen.add(Math.round((await body.boundingBox()).height));
        }
        heights.push(`${language}:${[...seen].join('/')}`);
    }
    check('the commands keep their height from tab to tab in every language', heights.every(h => !h.includes('/')), heights.join(' '));
    await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));
    await tab('home').click();

    // The layout button stands at the end of the commands; the simplified layout is one row.
    const switcher = rb.locator('.mx-ribbon-menu__body > .mx-ribbon-menu__switch');
    const bodyBox = await body.boundingBox();
    const switchBox = await switcher.boundingBox();
    check('the layout button stands at the end of the commands', switchBox.x + switchBox.width <= bodyBox.x + bodyBox.width + 0.5 && switchBox.x + switchBox.width > bodyBox.x + bodyBox.width - 24);
    await switcher.click();
    await page.waitForTimeout(200);
    check('the layout button shows the simplified layout', (await rb.getAttribute('data-layout')) === 'simple' && (await rb.locator('.mx-ribbon-menu__group-label').first().isHidden()));
    await switcher.click();
    await page.waitForTimeout(200);

    // Key hints: Alt shows a letter on each tab, H the letters of Home's commands, Escape steps back.
    await tab('home').focus();
    await page.keyboard.down('Alt');
    await page.keyboard.up('Alt');
    await page.waitForTimeout(150);
    const hints = () => rb.locator('.mx-ribbon-menu__hint:not([hidden])').allTextContents();
    const onTabs = await hints();
    check('Alt shows the letters of the tabs, the File button and the quick commands', ['F', 'H', 'I', 'V', '1', '2'].every(k => onTabs.includes(k)), onTabs.join(' '));
    await page.keyboard.press('h');
    await page.waitForTimeout(200);
    const onCommands = await hints();
    check('a tab’s letter shows the letters of its commands, unique', onCommands.length > 8 && new Set(onCommands).size === onCommands.length && onCommands.includes('P'), onCommands.join(' '));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    check('Escape goes back to the letters of the tabs', (await hints()).includes('H'));
    await page.keyboard.press('Escape');
    check('Escape again ends the hints', (await hints()).length === 0);

    // The context menu adds a command to the quick commands and hides another.
    const quick = () => rb.locator('.mx-ribbon-menu__quick:not([hidden]) > .mx-button').evaluateAll(els => els.map(b => b.getAttribute('title')));
    const before = await quick();
    const named = (where, name) => where.locator('.mx-ribbon-menu__body').getByRole('button', { name, exact: true });
    await named(rb, 'Cut').click({ button: 'right' });
    await page.waitForTimeout(200);
    const item = text => page.locator('.mx-popup:popover-open .mx-menu__item').filter({ hasText: text }).first();
    await item('Add to the quick commands').click();
    await page.waitForTimeout(200);
    check('a command added from the context menu stands in the quick commands', (await quick()).length === before.length + 1, (await quick()).join(','));
    await named(rb, 'Copy').click({ button: 'right' });
    await page.waitForTimeout(200);
    await item('Hide “Copy”').click();
    await page.waitForTimeout(200);
    check('a command hidden from the context menu is gone', (await named(rb, 'Copy').count()) === 0);

    // Only the tabs: a double-click hides the commands, a tab opens them over the page, a click elsewhere closes them.
    await tab('home').dblclick();
    await page.waitForTimeout(200);
    check('a double-click on a tab shows only the tabs', (await rb.getAttribute('data-display')) === 'tabs' && (await body.isHidden()));
    await tab('insert').click();
    await page.waitForTimeout(200);
    const over = await body.evaluate(el => getComputedStyle(el).position);
    check('a tab opens its commands over the page', (await rb.getAttribute('data-floating')) === '' && over === 'absolute');
    await page.mouse.click(5, 880);
    await page.waitForTimeout(200);
    check('a click elsewhere closes them', (await rb.getAttribute('data-floating')) === null && (await body.isHidden()));
    await tab('home').dblclick();
    await page.waitForTimeout(200);

    // Narrow, but not compact: groups fold into one button that opens the group as it is.
    let width = 900;
    while (width > 500 && !(await rb.locator('.mx-ribbon-menu__group[data-folded]').count())) {
        width -= 20;
        await rb.evaluate((el, w) => (el.style.inlineSize = `${w}px`), width);
        await page.waitForTimeout(150);
    }
    check('in little room groups fold into one button', (await rb.locator('.mx-ribbon-menu__group[data-folded]').count()) >= 1, `${width}px`);
    const fold = rb.locator('.mx-ribbon-menu__group[data-folded] > .mx-ribbon-menu__fold').first();
    await fold.click();
    await page.waitForTimeout(250);
    check('the button of a folded group opens the group as it is', (await page.locator('.mx-popup:popover-open .mx-ribbon-menu__group-label').count()) === 1 && (await fold.getAttribute('aria-expanded')) === 'true');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    check('Escape puts the group back', (await fold.getAttribute('aria-expanded')) === 'false' && (await page.locator('.mx-popup:popover-open .mx-ribbon-menu__group-label').count()) === 0);

    // Compact: a tab picker and one row; what still does not fit scrolls with the buttons at its ends.
    await page.goto(base + 'ribbonmenu/layouts', { waitUntil: 'load' });
    const room = page.locator('.rb-room');
    await room.waitFor();
    await room.scrollIntoViewIfNeeded();
    await room.evaluate(el => (el.style.inlineSize = '300px'));
    await page.waitForTimeout(300);
    check('narrower than its compact size, a tab picker stands for the tabs and the commands are one row', (await room.getAttribute('data-compact')) === '' && (await room.locator('.mx-ribbon-menu__picker').isVisible()) && (await room.locator('.mx-ribbon-menu__tabs').isHidden()) && (await room.getAttribute('data-layout')) === 'simple');
    check('in a compact menu groups that do not fit wait in the “more” menu', (await room.locator('.mx-ribbon-menu__overflow:visible').count()) === 1);
    // Without giving way, what does not fit scrolls.
    await page.getByText('Give way', { exact: true }).click();
    await page.waitForTimeout(300);
    const forward = room.locator('.mx-ribbon-menu__scroll--forward');
    check('what still does not fit scrolls, with a button at the end', await forward.isVisible());
    await forward.click();
    await page.waitForTimeout(500);
    const scrolled = await room.locator('.mx-ribbon-menu__panel:not([hidden])').evaluate(el => el.scrollLeft);
    check('the scroll button moves the commands', scrolled > 0 && (await room.locator('.mx-ribbon-menu__scroll--back').isVisible()), String(scrolled));

    // A gallery marks the choice the app keeps.
    await page.goto(base + 'ribbonmenu/commands', { waitUntil: 'load' });
    const types = page.locator('.rb-types');
    await types.waitFor();
    await types.scrollIntoViewIfNeeded();
    const tiles = types.locator('.mx-ribbon-menu__gallery-row > .mx-ribbon-menu__tile');
    await tiles.nth(2).click();
    await page.waitForTimeout(150);
    check('a choice of the gallery is marked chosen and reported', (await tiles.nth(2).getAttribute('aria-pressed')) === 'true' && (await page.locator('.rb-types-told').textContent()) === 'Last command: color: Leaf');

    // What the user changes is saved and given back.
    await page.goto(base + 'ribbonmenu/customization', { waitUntil: 'load' });
    const custom = page.locator('.rb-customize');
    await custom.waitFor();
    await custom.scrollIntoViewIfNeeded();
    await named(custom, 'Cut').click({ button: 'right' });
    await page.waitForTimeout(200);
    const earlier = item('Move earlier');
    check('a command cannot move past a fixed one', (await earlier.getAttribute('aria-disabled')) === 'true');
    await item('Move later').click();
    await page.waitForTimeout(200);
    const saved = await page.evaluate(() => localStorage.getItem('docs.ribbon.customization'));
    check('a change is reported for saving', !!saved && saved.includes('order'), saved ?? '');
    await page.reload({ waitUntil: 'load' });
    await page.locator('.rb-customize').waitFor();
    await page.waitForTimeout(300);
    const order = await page.locator('.rb-customize .mx-ribbon-menu__group').first().locator('.mx-ribbon-menu__commands > .mx-ribbon-menu__command').evaluateAll(els => els.map(b => b.querySelector('.mx-button__text')?.textContent || b.getAttribute('title')));
    check('the saved changes are given back when the page opens again', order[1] === 'Copy' && order[2] === 'Cut', order.join(','));
    await page.evaluate(() => localStorage.removeItem('docs.ribbon.customization'));

    // Changes by path: the menu redraws only what changed.
    await page.goto(base + 'ribbonmenu/programmatic', { waitUntil: 'load' });
    const prog = page.locator('.rb-programmatic');
    await prog.waitFor();
    await prog.scrollIntoViewIfNeeded();
    const paste = await prog.locator('.mx-ribbon-menu__command[data-ribbon-size]').first().elementHandle();
    await page.getByRole('button', { name: 'Add a command', exact: true }).click();
    await page.getByRole('button', { name: 'Add a tab', exact: true }).click();
    await page.getByRole('button', { name: 'Remove Insert', exact: true }).click();
    await page.waitForTimeout(300);
    const tabTexts = await prog.locator('.mx-ribbon-menu__tab:visible').allTextContents();
    const groups = await prog.locator('.mx-ribbon-menu__panel:not([hidden]) .mx-ribbon-menu__group-label').allTextContents();
    check('a tab and a command are added and a group removed by path', tabTexts.includes('Review') && !groups.includes('Insert') && (await prog.getByRole('button', { name: 'Extra 1' }).count()) === 1, `${tabTexts.join(',')} | ${groups.join(',')}`);
    check('a command that stays keeps its button', await paste.evaluate(el => el.isConnected));
    check('each change is reported', (await page.locator('.rb-programmatic-told').textContent()).startsWith('3 changes'));
}
