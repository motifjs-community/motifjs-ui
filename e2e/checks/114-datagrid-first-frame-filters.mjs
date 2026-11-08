/** Real-browser checks of the datagrid's first frame, the filter row's lists while they load, and custom filter editors. */
export default async function ({ page, base, check }) {
    // No frame shows the cells of a row on top of each other: the columns are laid out from the first one.
    await page.addInitScript(() => {
        window.__stacked = [];
        const t0 = performance.now();
        const tick = () => {
            document.querySelectorAll('.mx-data-grid').forEach((g, i) => {
                const vp = g.querySelector('.mx-data-grid__viewport');
                if (!vp || getComputedStyle(vp).visibility === 'hidden') return;
                const row = g.querySelector('.mx-data-grid__body .mx-data-grid__row');
                if (!row || row.children.length < 2) return;
                const a = row.children[0].getBoundingClientRect();
                const b = row.children[1].getBoundingClientRect();
                if (b.width && Math.abs(a.left - b.left) < 1 && a.width === b.width) window.__stacked.push(`grid ${i} at ${Math.round(performance.now() - t0)}ms`);
            });
            if (performance.now() - t0 < 3000) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
    for (const path of ['datagrid', 'datagrid/scrolling', 'datagrid/lookups']) {
        await page.goto(base + path, { waitUntil: 'load' });
        await page.waitForTimeout(3100);
        const seen = await page.evaluate(() => ({ stacked: window.__stacked, settling: document.querySelectorAll('.mx-data-grid[data-settling]').length }));
        check(`/${path}: no frame shows a row's cells piled up, and no grid stays out of sight`, seen.stacked.length === 0 && seen.settling === 0, seen.stacked.slice(0, 3).join(', '));
    }

    // The filter row's lookup list says it is loading, then lists the names soon after.
    const grid = page.locator('.dg-lookups');
    await grid.scrollIntoViewIfNeeded();
    await grid.locator('.mx-data-grid__filter-cell .mx-drop-down').first().click();
    const list = () => page.evaluate(() => {
        const l = document.querySelector('.mx-popup:popover-open .mx-list');
        return l ? { empty: l.querySelector('.mx-list__empty')?.textContent ?? '', options: l.querySelectorAll('[role=option]').length } : null;
    });
    const first = await list();
    check('the lookup filter list says it is loading while the names arrive', first?.empty === 'Loading…' && first.options === 0, JSON.stringify(first));
    const t0 = Date.now();
    let now = first;
    while (Date.now() - t0 < 4000 && !(now?.options > 0)) {
        await page.waitForTimeout(50);
        now = await list();
    }
    check('the names of 300 customers arrive side by side, in well under the time one after another would take', now?.options > 0 && Date.now() - t0 < 2500, `${Date.now() - t0}ms`);
    await page.keyboard.press('Escape');

    // A column's own filter editor: buttons write the filter, the same button clears it.
    await page.goto(base + 'datagrid/filtering', { waitUntil: 'load' });
    const own = page.locator('.dg-filter-editors');
    await own.waitFor();
    await own.scrollIntoViewIfNeeded();
    await own.getByRole('button', { name: 'Shipped' }).click();
    await page.waitForTimeout(300);
    const statuses = [...new Set(await own.locator('.mx-data-grid__body [data-field="status"]').allTextContents())];
    check('a custom filter editor writes the column filter', statuses.length === 1 && statuses[0] === 'Shipped', statuses.join(','));
    await own.getByRole('button', { name: 'Shipped' }).click();
    await page.waitForTimeout(300);
    check('and clears it', (await own.locator('.mx-data-grid__body [data-field="status"]').allTextContents()).some(t => t !== 'Shipped'));
    check('a field as a filter editor stands in its cell', (await own.locator('.mx-data-grid__filter-cell[data-field="amount"] .mx-number-box').count()) === 1);

    // A list column's choices from a server: asked once, they write the cells, the filter row's list and the search.
    const server = page.locator('.dg-server-choices');
    await server.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1300);
    const cities = () => server.locator('.mx-data-grid__body [data-field="city"]').allTextContents();
    check('the cells show the labels of choices that came from a server', (await cities()).every(t => /\(\d\d\)$/.test(t)), (await cities()).slice(0, 2).join(','));
    await server.locator('.mx-data-grid__filter-cell[data-field="city"] .mx-drop-down').click();
    await page.waitForTimeout(250);
    const listed = await page.evaluate(() => [...document.querySelectorAll('.mx-popup:popover-open [role=option]')].map(o => o.textContent));
    check('the filter row lists them after "(All)"', listed[0] === '(All)' && listed.includes('İzmir (35)'), listed.join(','));
    await page.keyboard.press('Escape');
    check('the server was asked once for all of it', (await page.locator('.dg-server-choices-asked').textContent()) === 'The server was asked 1 times');
}
