/** Real-browser checks of the MenuBar pages: customization, programmatic changes and merging, a browser window included. */
import { readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/** The design languages of the design system, as its package lists them. */
function designLanguages() {
    const dir = join(dirname(createRequire(import.meta.url).resolve('@motifx-community/design-system/package.json')), 'dist', 'json');
    return readdirSync(dir).filter(name => statSync(join(dir, name)).isDirectory());
}

export default async function ({ page, base, check, axeSource }) {
    const tops = bar => bar.locator(':scope > .mx-menubar__bar > .mx-menubar__item').evaluateAll(els => els.filter(el => el.offsetParent !== null).map(el => el.textContent.trim()));
    const barOf = (name, root = page) => root.locator('.mx-menubar').filter({ has: root.locator(`[role=menubar][aria-label="${name}"]`) });
    const openMenu = () => page.locator('.mx-popup:popover-open').last();
    const menuItems = () => openMenu().locator(':scope > .mx-menu > .mx-menu__item').evaluateAll(els => els.map(el => el.querySelector('.mx-menu__label').textContent));
    const pick = async text => {
        await openMenu().locator('.mx-menu__item').filter({ hasText: text }).first().click();
        await page.waitForTimeout(250);
    };

    // Customization: the right-click menu, hiding and moving, the saved object, the customizer window.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + 'menus/customization', { waitUntil: 'load' });
    const editor = barOf('Editor');
    await editor.scrollIntoViewIfNeeded();
    await editor.locator('.mx-menubar__item').filter({ hasText: 'View' }).click({ button: 'right' });
    await page.waitForTimeout(250);
    const custom = await menuItems();
    check('a right-click on an item offers to hide and move it, and the customizer', custom.includes('Hide “View”') && custom.includes('Move left') && custom.includes('Customize…'), custom.join(','));
    await pick('Hide “View”');
    check('hiding takes the item off the bar', (await tops(editor)).join(',') === 'File,Edit,Help', (await tops(editor)).join(','));
    check('…and the change is reported as one object', JSON.parse(await page.locator('.mb-custom-saved').textContent()).hidden?.includes('view'));
    await editor.locator('.mx-menubar__item').filter({ hasText: 'Edit' }).focus();
    await page.keyboard.press('Shift+F10');
    await page.waitForTimeout(250);
    await pick('Move left');
    check('Shift+F10 opens the same menu; Move left moves the item', (await tops(editor)).join(',') === 'Edit,File,Help', (await tops(editor)).join(','));
    await editor.locator('.mx-menubar__item').filter({ hasText: 'Help' }).click({ button: 'right' });
    await page.waitForTimeout(250);
    check('an item that is not customizable cannot be hidden', !(await menuItems()).some(t => t.startsWith('Hide')), (await menuItems()).join(','));
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Forget the changes' }).click();
    await page.waitForTimeout(200);
    check('forgetting the changes brings the bar back', (await tops(editor)).join(',') === 'File,Edit,View,Help');
    await page.getByRole('button', { name: 'Restore the saved changes' }).click();
    await page.waitForTimeout(200);
    check('the saved object restores them', (await tops(editor)).join(',') === 'Edit,File,Help', (await tops(editor)).join(','));

    await page.getByRole('button', { name: 'Customize…' }).click();
    await page.waitForTimeout(500);
    const win = page.locator('dialog').filter({ has: page.locator('.mx-customizer__pages') });
    const tabs = await win.locator('.mx-tabs__tab').allTextContents();
    check('the customizer has its pages', tabs.join(',') === 'Menus,Commands', tabs.join(','));
    // The toolbar of a page stands against the strip, across the panel.
    const flush = await win.evaluate(el => {
        const panel = el.querySelector('.mx-tabs__panel:not([hidden])').getBoundingClientRect();
        const bar = el.querySelector('.mx-tabs__panel:not([hidden]) > .mx-toolbar').getBoundingClientRect();
        return { left: bar.left - panel.left, right: panel.right - bar.right, top: bar.top - panel.top };
    });
    check('the page toolbar stands against the strip, across the panel', Math.abs(flush.left) <= 0.5 && Math.abs(flush.right) <= 0.5 && Math.abs(flush.top) <= 0.5, JSON.stringify(flush));
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('dialog[open]') ?? document)).violations.map(v => v.id));
    check('axe clean with the customizer open', violations.length === 0, violations.join(', '));
    await win.locator('.mx-tabs__tab').filter({ hasText: 'Commands' }).click();
    await page.waitForTimeout(200);
    const commands = await win.locator('.mx-tabs__panel:not([hidden]) .mx-list__item').allTextContents();
    check('the Commands page lists the commands given', commands.join(',') === 'Print,Share,Check spelling', commands.join(','));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    // Every design language: the toolbar of a page still stands against the strip.
    const off = [];
    for (const language of designLanguages()) {
        await page.evaluate(l => document.documentElement.setAttribute('data-design-language', l), language);
        await page.getByRole('button', { name: 'Customize…' }).click();
        await page.waitForTimeout(450);
        const d = await page.locator('dialog[open] .mx-customizer__pages').evaluate(el => {
            const panel = el.querySelector('.mx-tabs__panel:not([hidden])').getBoundingClientRect();
            const bar = el.querySelector('.mx-tabs__panel:not([hidden]) > .mx-toolbar').getBoundingClientRect();
            return Math.max(Math.abs(bar.left - panel.left), Math.abs(panel.right - bar.right), Math.abs(bar.top - panel.top));
        });
        if (d > 0.5) off.push(`${language}:${d}`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
    }
    check('in every design language the page toolbar stands against the strip', off.length === 0, off.join(' '));
    await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));
    await page.getByRole('button', { name: 'Forget the changes' }).click();

    // Commands of the app's own in the right-click menu, without customizable.
    const own = barOf('Own commands');
    await own.scrollIntoViewIfNeeded();
    await own.locator('.mx-menubar__item').filter({ hasText: 'Edit' }).click({ button: 'right' });
    await page.waitForTimeout(250);
    check('a bar that is not customizable shows only the app’s own commands', (await menuItems()).join(',') === 'Copy the path of Edit,Show all menus', (await menuItems()).join(','));
    await pick('Copy the path of Edit');
    check('…which run', (await page.locator('.mb-own-told').textContent()) === 'Path: edit');
    await own.locator('.mx-menubar__item').filter({ hasText: 'Help' }).click({ button: 'right' });
    await page.waitForTimeout(250);
    check('a canceled menu does not open', (await page.locator('.mx-popup:popover-open').count()) === 0);

    // Programmatic changes by path.
    await page.goto(base + 'menus/programmatic', { waitUntil: 'load' });
    const changes = barOf('Changes');
    await changes.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Move Help first' }).click();
    await page.getByRole('button', { name: 'Remove Edit' }).click();
    await page.waitForTimeout(200);
    check('items move and go away by path', (await tops(changes)).join(',') === 'Help,File' && (await page.locator('.mb-changes-told').textContent()) === '2 changes', (await tops(changes)).join(','));
    await page.getByRole('button', { name: 'Add Print to File' }).click();
    await changes.locator('.mx-menubar__item').filter({ hasText: 'File' }).click();
    await page.waitForTimeout(250);
    check('an item added by path is in its menu', (await menuItems()).join(',') === 'New,Save,Print', (await menuItems()).join(','));
    await page.keyboard.press('Escape');

    // Merging: tabs, the documents of a TabDocumentManager in a browser window of their own, a window by focus.
    await page.goto(base + 'menus/merging', { waitUntil: 'load' });
    const app = barOf('App');
    await app.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    check('the bar of the tab shown merges into the app’s bar', (await tops(app)).join(',') === 'File,Edit,Format,Window,Help', (await tops(app)).join(','));
    check('…and hides itself', !(await page.locator('.mb-merge-report').isVisible()));
    // A merged item has the shape of the app's own; right to left, the bar runs from the right.
    const shapes = await app.locator(':scope > .mx-menubar__bar > .mx-menubar__item').evaluateAll(els => [...new Set(els.filter(el => el.offsetParent).map(el => `${el.getBoundingClientRect().height}/${el.getBoundingClientRect().top}`))]);
    check('merged items stand in the row with the same height as the app’s own', shapes.length === 1, shapes.join(' '));
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    await page.waitForTimeout(200);
    const xs = await app.locator(':scope > .mx-menubar__bar > .mx-menubar__item').evaluateAll(els => els.filter(el => el.offsetParent).map(el => el.getBoundingClientRect().left));
    check('right to left, the merged bar runs from the right', xs.every((x, i) => i === 0 || x < xs[i - 1]), xs.join(','));
    await page.evaluate(() => document.documentElement.removeAttribute('dir'));
    await page.getByRole('tab', { name: 'Budget.xlsx' }).click();
    await page.waitForTimeout(400);
    check('another tab shown: its bar joins Edit, adds Data, takes Window away', (await tops(app)).join(',') === 'File,Edit,Data,Help', (await tops(app)).join(','));
    await app.locator('.mx-menubar__item').filter({ hasText: 'Data' }).click();
    await page.waitForTimeout(250);
    await pick('Sort');
    check('a merged item runs in its own bar', (await page.locator('.mb-merge-told').textContent()) === 'Sort in Budget');

    const studio = barOf('Studio');
    await studio.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    check('the active document’s menus are in the app’s bar', (await tops(studio)).join(',') === 'File,View,Image,Help', (await tops(studio)).join(','));
    await page.locator('.mx-tabdocs__tab').filter({ hasText: 'Letter' }).click();
    await page.waitForTimeout(400);
    check('another document made active brings its own', (await tops(studio)).join(',') === 'File,View,Format,Help', (await tops(studio)).join(','));
    const popupPromise = page.context().waitForEvent('page');
    await page.getByRole('button', { name: 'Move the active document into a new window' }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('load');
    await page.waitForTimeout(800);
    check('in a browser window of its own the document is still shown, so it keeps merging beside the one shown here', (await tops(studio)).join(',') === 'File,View,Format,Image,Help', (await tops(studio)).join(','));
    await studio.locator('.mx-menubar__item').filter({ hasText: 'Format' }).click();
    await page.waitForTimeout(250);
    await pick('Bold');
    check('…and its item runs there', (await page.locator('.mb-docs-told').textContent()) === 'Bold in Letter');
    // Merging by focus, across the two windows.
    await page.locator('.mx-switch').filter({ hasText: 'Merge only while focus is in the document' }).getByText('Merge only while focus is in the document', { exact: true }).click();
    await page.waitForTimeout(300);
    check('by focus: with focus outside both documents, neither is merged', (await tops(studio)).join(',') === 'File,View,Help', (await tops(studio)).join(','));
    await popup.locator('.mb-doc input').first().click();
    await page.waitForTimeout(300);
    check('by focus: focus in the document in the other window merges its bar', (await tops(studio)).join(',') === 'File,View,Format,Help', (await tops(studio)).join(','));
    await page.locator('.mb-doc input').first().click();
    await page.waitForTimeout(300);
    check('by focus: focus back in this window takes it away and merges the document here', (await tops(studio)).join(',') === 'File,View,Image,Help', (await tops(studio)).join(','));
    await page.locator('.mx-switch').filter({ hasText: 'Merge only while focus is in the document' }).getByText('Merge only while focus is in the document', { exact: true }).click();
    await page.waitForTimeout(300);
    await popup.close();
    await page.waitForTimeout(800);
    const back = (await tops(studio)).join(',');
    check('the window closed: the document is back in its tabs, one document shown, its menus alone', back === 'File,View,Format,Help' || back === 'File,View,Image,Help', back);

    const desk = barOf('Desk');
    await desk.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Open the note window' }).click();
    await page.waitForTimeout(500);
    await page.locator('.mb-window-note input').click();
    await page.waitForTimeout(300);
    check('focus in the window merges its bar', (await tops(desk)).join(',') === 'File,Insert,Help', (await tops(desk)).join(','));
    await desk.locator('.mx-menubar__item').filter({ hasText: 'File' }).click();
    await page.waitForTimeout(250);
    check('…joining File', (await menuItems()).join(',') === 'New,Save note,Exit', (await menuItems()).join(','));
    await page.keyboard.press('Escape');
    await page.locator('.mb-window-page').click();
    await page.waitForTimeout(300);
    check('focus outside the window takes its menus back', (await tops(desk)).join(',') === 'File,Help', (await tops(desk)).join(','));

    // The API reference opens with every table.
    await page.goto(base + 'menus/api', { waitUntil: 'load' });
    check('the API reference lists the merging props', (await page.getByText('mergeWhen', { exact: true }).count()) > 0);
}
