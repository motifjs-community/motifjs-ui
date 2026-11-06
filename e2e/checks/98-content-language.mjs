/** Real-browser checks of the site's language: the content follows the picker live, across pages and reloads. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'speeddial', { waitUntil: 'load' });
    await page.locator('.docs-article').waitFor();
    const lead = page.locator('.docs-article p.lead');
    const heading = page.locator('#circle');
    const sideLabel = page.locator('.docs-sidebar a[href="/keyboard"]');
    const english = await lead.textContent();
    check('English by default', english.startsWith('A round button') && (await heading.textContent()) === 'On a circle');

    const pick = async name => {
        await page.locator('.docs-topbar__tools').getByRole('button').nth(2).click();
        await page.getByRole('menuitemcheckbox', { name }).or(page.getByRole('menuitemradio', { name })).or(page.getByRole('menuitem', { name })).first().click();
        await page.waitForTimeout(400);
    };
    await pick('Türkçe');
    check('the page changes at once, no reload', (await lead.textContent()).startsWith('Sayfanın köşesinde') && (await heading.textContent()) === 'Daire üzerinde', await lead.textContent());
    check('the frame too: the side menu, the outline, the title of the tab, the lang attribute', (await sideLabel.textContent()).trim() === 'Klavye ve odak' && (await page.locator('.docs-rail__title').first().textContent()) === 'Bu sayfada' && (await page.locator('html').getAttribute('lang')) === 'tr');
    check('the code in a text stays as it is', await page.evaluate(() => [...document.querySelectorAll('.docs-article p code')].some(c => c.textContent === "layout='circle'")));
    check('the table heads and cells follow', await page.evaluate(() => [...document.querySelectorAll('.docs-article th')].some(t => t.textContent === 'Açıklama') && [...document.querySelectorAll('.docs-article td')].some(t => t.textContent === 'kendiliğinden')));
    check('the controls in the kit follow too', (await page.getByRole('button', { name: 'Kodu göster' }).count()) > 0);

    // A page's own texts are read when it opens; one without a translation stays English and whole.
    await page.locator('.docs-sidebar a[href="/timeline"]').click();
    await page.waitForTimeout(500);
    check('the next page opens in the language', (await lead.textContent()).startsWith('Olaylar zaman sırasıyla') && (await page.locator('h1').textContent()) === 'Timeline');
    await page.locator('.docs-sidebar a[href="/keyboard"]').click();
    await page.waitForTimeout(500);
    check('a text without a translation stays English', /[a-z]/.test(await lead.textContent()) && (await page.locator('h1').textContent()) === 'Klavye ve odak');

    await page.goto(base + 'timeline', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    check('it is kept over a reload', (await lead.textContent()).startsWith('Olaylar zaman sırasıyla'));
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean in Turkish', violations.length === 0, violations.join(', '));

    await pick('English');
    check('and back to English', (await lead.textContent()).startsWith('Events in time order') && (await page.locator('html').getAttribute('lang')) === 'en');
    await page.evaluate(() => localStorage.removeItem('mx-docs-language'));
}
