/** The side menu of the site: its groups start closed but for the page being read, and it keeps what the reader opened and how far they scrolled it. */
export default async function ({ page, base, check }) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(base + 'chart/pie', { waitUntil: 'load' });
    await page.evaluate(() => {
        localStorage.removeItem('mx-docs-nav-open');
        localStorage.removeItem('mx-docs-nav-scroll');
    });
    await page.reload({ waitUntil: 'load' });
    await page.locator('.docs-sidebar__title').first().waitFor();
    await page.waitForTimeout(300);
    const open = () => page.locator('.docs-sidebar__title[aria-expanded="true"]').allTextContents().then(list => list.map(t => t.trim()));
    check('a first visit opens only the group of the page being read', (await open()).join() === 'Charts', (await open()).join());

    await page.getByRole('button', { name: 'Editors', exact: true }).click();
    await page.locator('.docs-sidebar').evaluate(el => (el.scrollTop = 150));
    await page.waitForTimeout(200);
    await page.reload({ waitUntil: 'load' });
    await page.locator('.docs-sidebar__title').first().waitFor();
    await page.waitForTimeout(400);
    check('the groups the reader opened stay open after a reload', (await open()).includes('Editors'), (await open()).join());
    const scrolled = await page.locator('.docs-sidebar').evaluate(el => el.scrollTop);
    check('and the menu comes back scrolled where it was', Math.abs(scrolled - 150) <= 1, String(scrolled));

    await page.getByRole('button', { name: 'Editors', exact: true }).click();
    await page.waitForTimeout(100);
    check('a group closes again', !(await open()).includes('Editors'));
    const items = await page.locator('.docs-sidebar__group').filter({ hasText: 'Editors' }).locator('li').evaluateAll(els => els.filter(el => el.offsetParent !== null).length);
    check('and its pages leave the menu', items === 0, String(items));
    await page.evaluate(() => {
        localStorage.removeItem('mx-docs-nav-open');
        localStorage.removeItem('mx-docs-nav-scroll');
    });
}
