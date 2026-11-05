/** Real-browser checks of the popover page. */
export default async function ({ page, base, check, axeSource, box }) {
    await page.goto(base + 'popover', { waitUntil: 'load' });
    const ways = page.locator('section[aria-labelledby="ways"]');
    const rename = ways.getByRole('button', { name: 'Rename' });
    await rename.waitFor();
    check('the target names what it opens', (await rename.getAttribute('aria-haspopup')) === 'dialog' && (await rename.getAttribute('aria-expanded')) === 'false');
    await rename.click();
    const dialog = page.getByRole('dialog', { name: 'New name' });
    await dialog.waitFor();
    check('a press opens a named dialog in the top layer', (await dialog.evaluate(el => el.matches(':popover-open'))) && (await rename.getAttribute('aria-expanded')) === 'true');
    check('focus went inside', await page.evaluate(() => document.activeElement?.closest('.mx-popover') !== null));
    check('x-model says open', (await ways.locator('.po-saved').textContent()) === 'Open');

    // The arrow (where the language draws one) sits on the edge towards the target, pointing at its middle.
    const geometry = await dialog.evaluate(el => {
        const arrow = el.querySelector('.mx-popover__arrow');
        if (!arrow || getComputedStyle(arrow).display === 'none') return null;
        const a = arrow.getBoundingClientRect();
        const p = el.getBoundingClientRect();
        const t = document.querySelector('section[aria-labelledby="ways"] .docs-example__stage .mx-button').getBoundingClientRect();
        return { side: el.dataset.side, onEdge: Math.abs((a.top + a.bottom) / 2 - p.top) <= 1, atMiddle: Math.abs((a.left + a.right) / 2 - (t.left + t.width / 2)) <= 1.5, arrow: Math.round((a.left + a.right) / 2), target: Math.round(t.left + t.width / 2), popover: Math.round(p.left + p.width / 2) };
    });
    check('the arrow points at the middle of the target', geometry === null || (geometry.onEdge && geometry.atMiddle), JSON.stringify(geometry));

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('.po-saved')?.textContent === 'Closed', null, { timeout: 2000 }).catch(() => {});
    check('Escape closes it and focus goes back to the target', (await ways.locator('.po-saved').textContent()) === 'Closed' && (await rename.evaluate(el => document.activeElement === el)));
    await rename.click();
    await dialog.waitFor();
    await dialog.getByRole('button', { name: 'Close' }).click();
    await page.waitForFunction(() => !document.querySelector('.mx-popover:popover-open'), null, { timeout: 2000 }).catch(() => {});
    check('the close button closes it', await page.evaluate(() => !document.querySelector('.mx-popover:popover-open')));
    await rename.click();
    await dialog.waitFor();
    await ways.locator('.po-saved').click();
    await page.waitForFunction(() => !document.querySelector('.mx-popover:popover-open'), null, { timeout: 2000 }).catch(() => {});
    check('a press outside closes it', await page.evaluate(() => !document.querySelector('.mx-popover:popover-open')));

    // Hover: the card opens while the pointer rests on the name and stays while the pointer is on the card.
    const hover = page.locator('section[aria-labelledby="hover"]');
    await hover.locator('.po-person').hover();
    const card = page.getByRole('dialog', { name: 'Ada Lovelace' });
    await card.waitFor({ timeout: 3000 }).catch(() => {});
    check('resting on the name opens the card', await card.evaluate(el => el.matches(':popover-open')).catch(() => false));
    const cardBox = await card.boundingBox();
    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2, { steps: 5 });
    await page.waitForTimeout(400);
    check('the pointer on the card keeps it', await card.evaluate(el => el.matches(':popover-open')).catch(() => false));
    await page.mouse.move(5, 5);
    await page.waitForFunction(() => !document.querySelector('.mx-popover:popover-open'), null, { timeout: 3000 }).catch(() => {});
    check('leaving both closes it', (await card.evaluate(el => el.matches(':popover-open')).catch(() => false)) === false);

    // Placements: the side the popover takes.
    const placements = page.locator('section[aria-labelledby="placements"]');
    await placements.getByRole('button', { name: 'top', exact: true }).click();
    await placements.getByRole('button', { name: 'Open' }).click();
    const placed = page.getByRole('dialog', { name: 'Placement' });
    await placed.waitFor();
    const above = await placed.evaluate(el => ({ side: el.dataset.side, width: el.getBoundingClientRect().width }));
    check('placed on top with its own width', above.side === 'top' && Math.abs(above.width - 256) <= 1, JSON.stringify(above));
    await page.keyboard.press('Escape');

    // onClosing keeps it open while there is text; the button closes it.
    const events = page.locator('section[aria-labelledby="events"]');
    await events.getByRole('button', { name: 'Add a note' }).click();
    const note = page.getByRole('dialog', { name: 'Note' });
    await note.waitFor();
    await note.getByRole('textbox', { name: 'Text' }).fill('Call back');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    check('onClosing kept it open', await note.evaluate(el => el.matches(':popover-open')) && (await events.locator('.po-told').textContent()) === 'Save or clear the note first.');
    await note.getByRole('button', { name: 'Save' }).click();
    await page.waitForFunction(() => document.querySelector('.po-told')?.textContent === 'Closed: code', null, { timeout: 2000 }).catch(() => {});
    check('the button closed it', (await events.locator('.po-told').textContent()) === 'Closed: code');

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
