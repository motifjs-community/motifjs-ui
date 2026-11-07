/** Real-browser checks of the category overviews: each demo is used the way a reader would use it, and each page passes axe. */
export default async function ({ page, base, check, axeSource }) {
    await page.setViewportSize({ width: 1280, height: 900 });
    const open = async path => {
        await page.goto(base + path, { waitUntil: 'load' });
        await page.locator('.ov-frame').waitFor();
        await page.waitForTimeout(400);
    };
    const axe = async path => {
        await page.addScriptTag({ content: axeSource });
        const issues = await page.evaluate(async () => (await window.axe.run('.docs-article')).violations.map(v => `${v.id}: ${v.nodes.length} ${v.nodes[0]?.target}`));
        check(`${path}: axe clean`, issues.length === 0, issues.join(', '));
    };

    await open('buttons');
    const text = page.locator('.ov-buttons .ov-page');
    await page.locator('.ov-buttons').getByRole('button', { name: 'Bold' }).click();
    check('a toolbar toggle changes the document', (await text.evaluate(el => getComputedStyle(el).fontWeight)) === '600');
    await page.locator('.ov-buttons').getByRole('button', { name: 'Save', exact: true }).click();
    check('the split button saves', (await page.locator('.ov-buttons-log').textContent()) === 'Saved, version 1.', await page.locator('.ov-buttons-log').textContent());
    await page.locator('.ov-buttons').getByRole('button', { name: 'Preview' }).click();
    await page.waitForTimeout(150);
    check('the segmented choice switches the view', (await text.textContent()).startsWith('Preview'), await text.textContent());
    await text.click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Copy' }).click();
    check('the context menu works on the document', (await page.locator('.ov-buttons-log').textContent()) === 'Copied.');
    await axe('buttons');

    await open('editors');
    await page.locator('.ov-book').click();
    await page.waitForTimeout(300);
    const missing = await page.locator('.ov-editors .mx-validation-summary').textContent();
    check('booking with empty fields lists what is missing, without access key marks', /Name:/.test(missing) && /E-mail:/.test(missing) && /Stay:/.test(missing) && !missing.includes('&'), missing);
    await axe('editors');

    await open('choice');
    await page.locator('.ov-all-topics').click();
    const topics = await page.locator('.ov-choice-sum').textContent();
    check('one check box sets all the topics', topics.includes('Orders, Invoices, Comments, Releases'), topics);
    await axe('choice');

    await open('feedback');
    await page.locator('.ov-feedback').getByRole('button', { name: 'Sync now' }).click();
    await page.waitForTimeout(400);
    const connecting = await page.locator('.ov-feedback .ov-sync .mx-spinner').count();
    await page.waitForTimeout(4200);
    const done = await page.locator('.ov-sync-bar').getAttribute('aria-valuenow');
    check('syncing shows a spinner, then a bar that fills', connecting === 1 && done === '6', `spinner ${connecting}, bar ${done}`);
    check('a toast reports the end', (await page.locator('.mx-toast', { hasText: '6 files are up to date.' }).count()) === 1);
    await axe('feedback');

    await open('display');
    await page.locator('.ov-display').getByRole('button', { name: /Messages/ }).click();
    check('reading the messages clears the badge', (await page.locator('.ov-display .mx-badge').evaluate(el => el.hidden || getComputedStyle(el).display === 'none' || !el.textContent)) === true);
    await page.locator('.ov-display').getByRole('switch', { name: 'Show as loading' }).click();
    check('the card shows placeholders while loading', (await page.locator('.ov-display [aria-busy="true"]').count()) > 0);
    await axe('display');

    await open('navigation');
    await page.locator('.ov-navigation').getByRole('button', { name: /menu/i }).first().click();
    await page.getByRole('option', { name: 'Mobile app' }).click();
    await page.waitForTimeout(400);
    check('the drawer picks the project shown in the bar', (await page.locator('.ov-navigation .mx-app-bar').textContent()).includes('Mobile app'));
    await page.locator('.ov-navigation').getByRole('tab', { name: /Members/ }).click();
    await page.locator('.ov-navigation').getByRole('button', { name: /next/i }).first().click();
    await page.waitForTimeout(200);
    check('the members list turns its pages', (await page.locator('.ov-navigation .ov-file-list li').first().textContent()) === 'Member 9');
    await axe('navigation');

    await open('data');
    await page.locator('.ov-data').getByRole('treeitem', { name: 'Letters' }).click();
    await page.waitForTimeout(200);
    check('a folder shows its files', (await page.locator('.ov-data-sum').textContent()) === '2 file(s)', await page.locator('.ov-data-sum').textContent());
    await axe('data');

    await open('foundations');
    await page.locator('.ov-foundations').getByRole('switch', { name: 'Lock the form' }).click();
    check('locking the panel turns off everything inside', await page.locator('.ov-foundations').getByRole('spinbutton', { name: 'Price' }).isDisabled());
    await page.locator('.ov-foundations').getByRole('switch', { name: 'Lock the form' }).click();
    await page.locator('.ov-foundations').getByRole('button', { name: 'Türkçe' }).click();
    await page.waitForTimeout(500);
    check('the language switches live', (await page.locator('.ov-locale').textContent()) === 'tr');
    await page.locator('.ov-foundations').getByRole('button', { name: 'English' }).click();
    await page.waitForTimeout(300);
    await axe('foundations');
}
