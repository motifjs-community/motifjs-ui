/** Real-browser checks of the Toolbar customization page: the right-click menu, the customizer, sending commands from a menu bar. */
import { readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/** The design languages of the design system, as its package lists them. */
function designLanguages() {
    const dir = join(dirname(createRequire(import.meta.url).resolve('@motifx-community/design-system/package.json')), 'dist', 'json');
    return readdirSync(dir).filter(name => statSync(join(dir, name)).isDirectory());
}

export default async function ({ page, base, check, axeSource }) {
    const barOf = name => page.locator(`.mx-toolbar[aria-label="${name}"]`);
    // The bar as the user sees it: a button by its text (its tooltip when it shows only its icon), a separator as `|`.
    const row = bar => bar.locator(':scope > .mx-button:not(.mx-toolbar__more), :scope > .mx-toolbar__separator').evaluateAll(els =>
        els.filter(el => el.offsetParent !== null).map(el => (el.matches('.mx-toolbar__separator') ? '|' : el.querySelector('.mx-button__text')?.textContent || `[${el.querySelector('.mx-button__face, button')?.getAttribute('title') ?? el.getAttribute('title')}]`)),
    );
    // A button by its text, or by its tooltip when it shows only its icon.
    const buttonOf = (bar, text) => bar.locator(`:scope > .mx-button[title="${text}"]`).or(bar.locator(':scope > .mx-button').filter({ hasText: new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) })).first();
    const openMenu = () => page.locator('.mx-popup:popover-open').last();
    const menuItems = () => openMenu().locator(':scope > .mx-menu > .mx-menu__item').evaluateAll(els => els.map(el => el.querySelector('.mx-menu__label').textContent));
    const pick = async text => {
        await openMenu().locator('.mx-menu__item').filter({ hasText: text }).first().click();
        await page.waitForTimeout(250);
    };
    const saved = async selector => JSON.parse(await page.locator(selector).textContent());

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + 'toolbar/customization', { waitUntil: 'load' });
    const format = barOf('Format');
    await format.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const start = await row(format);
    check('the toolbar shows its items as given, icon-only buttons named by their text', start.join(',') === '[Undo],[Redo],|,[Bold],[Italic],[Underline],|,Insert link,Insert image,Publish', start.join(','));

    // The menu of the right button: hiding, Shift+F10 and moving, what a button shows, a fixed item.
    await buttonOf(format, 'Insert link').click({ button: 'right' });
    await page.waitForTimeout(250);
    const menu = await menuItems();
    check('a right-click offers to hide, move, choose what it shows and customize', ['Hide “Insert link”', 'Move left', 'Move right', 'Display', 'Customize…'].every(t => menu.includes(t)), menu.join(','));
    check('…but no second separator next to one', !menu.includes('Add a separator before'), menu.join(','));
    await pick('Hide “Insert link”');
    check('hiding takes the item off the bar', !(await row(format)).includes('Insert link'), (await row(format)).join(','));
    check('…and the change is reported as one object', (await saved('.tb-custom-saved')).hidden?.includes('link'));
    await buttonOf(format, 'Insert image').focus();
    await page.keyboard.press('Shift+F10');
    await page.waitForTimeout(250);
    await pick('Move left');
    const moved = await row(format);
    check('Shift+F10 opens the same menu; Move left moves the item past the separator', moved.join(',') === '[Undo],[Redo],|,[Bold],[Italic],[Underline],Insert image,|,Publish', moved.join(','));
    check('…and focus stays on the item', await buttonOf(format, 'Insert image').evaluate(el => el.contains(document.activeElement)));
    await buttonOf(format, 'Bold').click({ button: 'right' });
    await page.waitForTimeout(250);
    await openMenu().locator('.mx-menu__item').filter({ hasText: 'Display' }).first().hover();
    await page.waitForTimeout(300);
    await pick('Icon and text');
    check('Display: icon and text shows the text of an icon-only button', (await row(format)).includes('Bold'), (await row(format)).join(','));
    await buttonOf(format, 'Underline').click({ button: 'right' });
    await page.waitForTimeout(250);
    await pick('Add a separator before');
    check('a separator can be put before an item', (await row(format)).join(',').includes('[Italic],|,[Underline]'), (await row(format)).join(','));
    await buttonOf(format, 'Publish').click({ button: 'right' });
    await page.waitForTimeout(250);
    check('an item that is not customizable cannot be hidden or moved', !(await menuItems()).some(t => t.startsWith('Hide') || t.startsWith('Move')), (await menuItems()).join(','));
    await page.keyboard.press('Escape');
    const changed = await row(format);
    await page.getByRole('button', { name: 'Forget the changes' }).click();
    await page.waitForTimeout(200);
    check('forgetting the changes brings the toolbar back', (await row(format)).join(',') === start.join(','), (await row(format)).join(','));
    await page.getByRole('button', { name: 'Restore the saved changes' }).click();
    await page.waitForTimeout(200);
    check('the saved object restores them', (await row(format)).join(',') === changed.join(','), (await row(format)).join(','));

    // In every design language the items of a customized toolbar stand in one row, separators drawn.
    const off = [];
    for (const language of designLanguages()) {
        await page.evaluate(l => document.documentElement.setAttribute('data-design-language', l), language);
        await page.waitForTimeout(350);
        const r = await format.evaluate(el => {
            const parts = [...el.querySelectorAll(':scope > .mx-button:not(.mx-toolbar__more), :scope > .mx-toolbar__separator')].filter(p => p.offsetParent !== null);
            const middles = parts.map(p => { const b = p.getBoundingClientRect(); return b.top + b.height / 2; });
            const lines = parts.filter(p => p.matches('.mx-toolbar__separator')).map(p => p.getBoundingClientRect());
            return { spread: Math.max(...middles) - Math.min(...middles), lines: lines.length, drawn: lines.every(b => b.width > 0 && b.height > 0) };
        });
        if (r.spread > 0.5 || r.lines !== 3 || !r.drawn) off.push(`${language}:${JSON.stringify(r)}`);
    }
    check('in every design language the items stand in one row and the separators are drawn', off.length === 0, off.join(' '));
    await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));

    // Right to left: Move left moves an item later, and the bar runs from the right.
    await page.getByRole('button', { name: 'Forget the changes' }).click();
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    await page.waitForTimeout(250);
    await buttonOf(format, 'Bold').click({ button: 'right' });
    await page.waitForTimeout(250);
    await pick('Move left');
    const rtl = await row(format);
    check('right to left, Move left moves the item later', rtl.indexOf('[Bold]') === rtl.indexOf('[Italic]') + 1, rtl.join(','));
    const xs = await format.locator(':scope > .mx-button:not(.mx-toolbar__more)').evaluateAll(els => els.filter(el => el.offsetParent).map(el => el.getBoundingClientRect().left));
    check('…and the bar runs from the right', xs.every((x, i) => i === 0 || x < xs[i - 1]), xs.join(','));
    await page.evaluate(() => document.documentElement.removeAttribute('dir'));
    await page.getByRole('button', { name: 'Forget the changes' }).click();
    await page.waitForTimeout(200);

    // The customizer: a flat list, its tools, axe.
    await page.getByRole('button', { name: 'Customize…' }).click();
    await page.waitForTimeout(500);
    const win = page.locator('dialog').filter({ has: page.locator('.mx-customizer__pages') });
    const tabs = await win.locator('.mx-tabs__tab').allTextContents();
    check('the customizer has an Items and a Commands page', tabs[0] === 'Items' && tabs[1] === 'Commands', tabs.join(','));
    const tree = await win.locator('.mx-tree-view__text').allTextContents();
    check('the Items page lists the items, separators by name', tree.join(',') === 'Undo,Redo,Separator,Bold,Italic,Underline,Separator,Insert link,Insert image,Publish', tree.join(','));
    const tools = await win.locator('.mx-tabs__panel:not([hidden]) > .mx-toolbar .mx-button').allTextContents();
    check('a flat list has separators instead of groups', tools.includes('New separator') && !tools.some(t => t.startsWith('New ') && t !== 'New separator') && !tools.includes('Move to') && tools.includes('Display'), tools.join(','));
    const flush = await win.evaluate(el => {
        const panel = el.querySelector('.mx-tabs__panel:not([hidden])').getBoundingClientRect();
        const bar = el.querySelector('.mx-tabs__panel:not([hidden]) > .mx-toolbar').getBoundingClientRect();
        return Math.max(Math.abs(bar.left - panel.left), Math.abs(panel.right - bar.right), Math.abs(bar.top - panel.top));
    });
    check('the page toolbar stands against the strip, across the panel', flush <= 0.5, String(flush));
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('dialog[open]') ?? document)).violations.map(v => v.id));
    check('axe clean with the toolbar customizer open', violations.length === 0, violations.join(', '));
    await win.locator('.mx-tree-view__item').filter({ hasText: 'Italic' }).first().locator('.mx-tree-view__row').first().click();
    await page.waitForTimeout(150);
    await win.locator('.mx-tabs__tab').filter({ hasText: 'Commands' }).click();
    await page.waitForTimeout(200);
    await win.locator('.mx-tabs__panel:not([hidden]) .mx-list__item').filter({ hasText: 'Print' }).click();
    await page.waitForTimeout(150);
    await win.locator('.mx-tabs__panel:not([hidden]) > .mx-toolbar .mx-button').filter({ hasText: 'Add' }).click();
    await page.waitForTimeout(300);
    const added = await row(format);
    check('Add puts the command after the selected item', added.join(',').includes('[Italic],Print,[Underline]'), added.join(','));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Forget the changes' }).click();

    // Sending commands from the menu bar to the Quick access toolbar.
    const quick = barOf('Quick access');
    const menuBar = page.locator('.mx-menubar').filter({ has: page.locator('[role=menubar][aria-label="Document"]') });
    await menuBar.scrollIntoViewIfNeeded();
    await menuBar.locator('.mx-menubar__item').filter({ hasText: 'File' }).click();
    await page.waitForTimeout(250);
    await openMenu().locator('.mx-menu__item').filter({ hasText: 'Print' }).click({ button: 'right' });
    await page.waitForTimeout(250);
    check('a menu item that names a command offers the toolbars that take it', (await menuItems()).join(',') === 'Add to the “Quick access” toolbar', (await menuItems()).join(','));
    // The pointer crosses the File menu on its way to the line.
    const line = await openMenu().locator('.mx-menu__item').first().boundingBox();
    await page.mouse.move(line.x + line.width / 2, line.y + line.height / 2, { steps: 8 });
    await page.waitForTimeout(150);
    check('…and the menu stays open while the pointer moves to it', (await menuItems()).join(',') === 'Add to the “Quick access” toolbar', (await menuItems()).join(','));
    await pick('Add to the “Quick access” toolbar');
    await page.keyboard.press('Escape');
    check('…and adding puts it on the toolbar', (await row(quick)).join(',') === 'Save,[Undo],Print…', (await row(quick)).join(','));
    check('…kept as the command’s key', (await saved('.tb-send-saved')).added?.[0]?.command === 'doc.print');
    await buttonOf(quick, 'Print…').click();
    await page.waitForTimeout(150);
    check('the button runs the command', (await page.locator('.tb-send-told').textContent()) === 'Print');
    await menuBar.locator('.mx-menubar__item').filter({ hasText: 'File' }).click();
    await page.waitForTimeout(250);
    await openMenu().locator('.mx-menu__item').filter({ hasText: 'Save' }).click({ button: 'right' });
    await page.waitForTimeout(250);
    check('a command shown on the toolbar is offered to be taken away', (await menuItems()).join(',') === 'Remove from the “Quick access” toolbar', (await menuItems()).join(','));
    await pick('Remove from');
    await page.keyboard.press('Escape');
    check('…which hides the toolbar’s own item', (await row(quick)).join(',') === '[Undo],Print…', (await row(quick)).join(','));
    await page.addScriptTag({ content: axeSource });
    const after = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean after the changes', after.length === 0, after.join(', '));
}
