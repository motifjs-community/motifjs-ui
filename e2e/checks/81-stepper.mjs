/** Real-browser checks of the stepper page. */
export default async function ({ page, base, check, axeSource, box }) {
    await page.goto(base + 'stepper', { waitUntil: 'load' });
    const ways = page.locator('section[aria-labelledby="ways"]');
    const signUp = ways.getByRole('navigation', { name: 'Sign up' });
    await signUp.waitFor();
    const steps = signUp.getByRole('button');
    check('three steps, the first current', (await steps.count()) === 3 && (await steps.nth(0).getAttribute('aria-current')) === 'step');
    check('a step is named with its position', (await signUp.getByRole('button', { name: /^Step 2 of 3/ }).count()) === 1);
    check('in order, the third cannot be reached yet', (await steps.nth(2).getAttribute('aria-disabled')) === 'true');
    await steps.nth(1).click();
    await page.waitForFunction(() => document.querySelector('.st-value')?.textContent === 'value: 1', null, { timeout: 2000 }).catch(() => {});
    check('a press writes x-model', (await ways.locator('.st-value').textContent()) === 'value: 1');
    check('the step before is completed, the line to it filled', (await steps.nth(0).getAttribute('data-status')) === 'done' && (await signUp.locator('.mx-stepper__line').nth(0).getAttribute('data-status')) === 'done');
    check('now the third can be reached', (await steps.nth(2).getAttribute('aria-disabled')) === null);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('.st-value')?.textContent === 'value: 2', null, { timeout: 2000 }).catch(() => {});
    check('the arrow keys move, Enter chooses', (await ways.locator('.st-value').textContent()) === 'value: 2');
    const stops = await signUp.locator('.mx-stepper__step').evaluateAll(els => els.filter(el => el.tabIndex >= 0).length);
    check('one Tab stop', stops === 1, String(stops));
    await ways.getByRole('button', { name: 'Next' }).click();
    await page.waitForFunction(() => document.querySelector('.st-told')?.textContent === 'Step 2', null, { timeout: 2000 }).catch(() => {});
    check('next() programmatically tells the change', (await ways.locator('.st-told').textContent()) === 'Step 2');

    // The line sits on the indicators' middle, with the same gap at both ends.
    const geometry = await signUp.evaluate(nav => {
        const dots = [...nav.querySelectorAll('.mx-stepper__indicator')].map(el => el.getBoundingClientRect());
        const line = nav.querySelector('.mx-stepper__line').getBoundingClientRect();
        const mid = (dots[0].top + dots[0].bottom) / 2;
        return { lineMid: (line.top + line.bottom) / 2 - mid, before: line.left - dots[0].right, after: dots[1].left - line.right };
    });
    check('the line is centred on the indicators and evenly spaced', Math.abs(geometry.lineMid) <= 0.5 && Math.abs(geometry.before - geometry.after) <= 0.5, JSON.stringify(geometry));

    const statuses = page.locator('section[aria-labelledby="statuses"]');
    const payment = statuses.getByRole('button', { name: /Payment/ });
    check('an item says error', (await payment.getAttribute('data-status')) === 'error' && (await payment.textContent()).includes('Needs attention'));
    await statuses.getByRole('button', { name: 'Take the payment' }).click();
    await page.waitForFunction(() => document.querySelector('section[aria-labelledby="statuses"] [data-status="error"]') === null, null, { timeout: 2000 }).catch(() => {});
    check('and done once it is paid', (await payment.getAttribute('data-status')) === 'done');
    check('a disabled item cannot be reached', (await statuses.getByRole('button', { name: /Pick-up/ }).getAttribute('aria-disabled')) === 'true');

    const linear = page.locator('section[aria-labelledby="linear"]');
    await linear.getByRole('button', { name: /Details/ }).click();
    await page.waitForFunction(() => document.querySelector('.st-note')?.textContent === 'Accept the terms first.', null, { timeout: 2000 }).catch(() => {});
    check('onStepChanging refused the step', (await linear.locator('.st-note').textContent()) === 'Accept the terms first.');

    const vertical = page.locator('section[aria-labelledby="orientations"]').getByRole('navigation', { name: 'Standing' });
    const column = await vertical.evaluate(nav => {
        const dots = [...nav.querySelectorAll('.mx-stepper__indicator')].map(el => el.getBoundingClientRect());
        const line = nav.querySelector('.mx-stepper__line').getBoundingClientRect();
        return { sameX: Math.abs((dots[0].left + dots[0].right) / 2 - (line.left + line.right) / 2), stacked: dots[1].top > dots[0].bottom };
    });
    check('standing, the line is under the indicators', column.sameX <= 0.5 && column.stacked, JSON.stringify(column));

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
