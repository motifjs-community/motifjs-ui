/** Real-browser checks of the load panel page. */
export default async function ({ page, base, check, axeSource, box }) {
    await page.goto(base + 'loadpanel', { waitUntil: 'load' });
    const ways = page.locator('section[aria-labelledby="ways"]');
    const panel = ways.locator('.lp-panel');
    await panel.waitFor();
    const load = ways.getByRole('button', { name: 'Load orders' });
    await load.focus();
    await load.click();
    await page.waitForTimeout(100);
    check('nothing shows before the delay', (await ways.locator('.mx-load-panel').evaluateAll(els => els.filter(el => !el.hidden).length)) === 0);
    const layer = panel.locator('.mx-load-panel');
    await layer.waitFor({ timeout: 3000 });
    check('after the delay the layer is in the panel, which is busy', (await panel.getAttribute('aria-busy')) === 'true' && (await panel.evaluate(el => getComputedStyle(el).position === 'relative')));
    check('what is under it is inert', await panel.evaluate(el => [...el.children].filter(c => !c.classList.contains('mx-load-panel')).every(c => c.hasAttribute('inert'))));
    check('the pane is a status region with the message', (await layer.getByRole('status').textContent()).includes('Loading orders'));
    check('focus waits on the layer', await layer.evaluate(el => document.activeElement === el));
    const fit = await layer.evaluate(el => {
        const l = el.getBoundingClientRect();
        const p = el.parentElement;
        const pane = el.querySelector('.mx-load-panel__pane').getBoundingClientRect();
        return { covers: Math.abs(l.width - p.clientWidth) <= 1 && Math.abs(l.height - p.clientHeight) <= 1, centred: Math.abs((pane.left + pane.right) / 2 - (l.left + l.right) / 2) <= 1 && Math.abs((pane.top + pane.bottom) / 2 - (l.top + l.bottom) / 2) <= 1 };
    });
    check('the layer covers the panel, the pane sits in its middle', fit.covers && fit.centred, JSON.stringify(fit));
    await page.waitForFunction(() => document.querySelector('.lp-result')?.textContent === 'Orders loaded.', null, { timeout: 4000 }).catch(() => {});
    check('when the work ends it hides and focus comes back', (await layer.isHidden()) && (await load.evaluate(el => document.activeElement === el)) && (await panel.getAttribute('aria-busy')) === null);

    // Over the page: the rest is inert; Cancel tells and hides.
    const pageSection = page.locator('section[aria-labelledby="page"]');
    await pageSection.getByRole('button', { name: 'Build the report' }).click();
    const whole = page.locator('body > .mx-load-panel');
    await whole.waitFor();
    check('the whole page is covered, fixed', (await whole.getAttribute('data-page')) === '' && (await whole.evaluate(el => getComputedStyle(el).position === 'fixed')));
    check('the app is inert under it', await page.evaluate(() => [...document.body.children].filter(c => !c.classList.contains('mx-load-panel') && c.tagName !== 'SCRIPT').every(c => c.hasAttribute('inert'))));
    const cancel = whole.getByRole('button', { name: 'Cancel' });
    check('Cancel has focus', await cancel.evaluate(el => document.activeElement === el));
    await cancel.click();
    await page.waitForFunction(() => document.querySelector('.lp-told')?.textContent === 'Cancelled.', null, { timeout: 2000 }).catch(() => {});
    check('Cancel told and hid it', (await pageSection.locator('.lp-told').textContent()) === 'Cancelled.' && (await whole.isHidden()));
    check('the app can be used again', await page.evaluate(() => ![...document.body.children].some(c => c.hasAttribute('inert'))));

    // Options: the shade and the pane left out.
    const options = page.locator('section[aria-labelledby="options"]');
    await options.getByRole('button', { name: 'No shade' }).click();
    const clear = options.locator('.mx-load-panel').nth(0);
    await clear.waitFor();
    check('without the shade the layer is clear', await clear.evaluate(el => !el.hasAttribute('data-shade') && getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)'));
    await clear.click({ position: { x: 4, y: 4 } });
    await page.waitForTimeout(100);
    check('a press on it hides it when allowed', await clear.isHidden());

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
