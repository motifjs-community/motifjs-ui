/** Real-browser checks of the wizard page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'wizard', { waitUntil: 'load' });
    const ways = page.locator('section[aria-labelledby="ways"]');
    const wizard = ways.locator('.mx-wizard').first();
    await wizard.waitFor();
    const steps = wizard.getByRole('navigation', { name: 'Sign up' }).getByRole('button');
    const pages = wizard.locator('.mx-wizard__page');
    check('the first page shows, the others are hidden', (await pages.evaluateAll(els => els.map(el => el.hidden))).join() === 'false,true,true');
    check('the page is a group named after its step', (await pages.nth(0).getAttribute('role')) === 'group' && (await pages.nth(0).getAttribute('aria-label')) === 'Account');
    const next = wizard.getByRole('button', { name: 'Next' });
    const back = wizard.getByRole('button', { name: 'Back' });
    check('Back is disabled on the first page', (await back.isDisabled()) === true);
    await next.click();
    await page.waitForFunction(() => document.querySelector('section[aria-labelledby="ways"] .mx-stepper__step[data-status="error"]') !== null, null, { timeout: 2000 }).catch(() => {});
    check('an empty required field keeps the page and marks the step', (await steps.nth(0).getAttribute('data-status')) === 'error' && (await pages.nth(0).isHidden()) === false);
    check('focus went to the first invalid field', await page.evaluate(() => document.activeElement?.getAttribute('aria-invalid') === 'true'));
    await wizard.getByRole('textbox', { name: 'Name' }).fill('Ada');
    await wizard.getByRole('textbox', { name: 'E-mail' }).fill('ada@example.com');
    await next.click();
    await page.waitForFunction(() => !document.querySelectorAll('section[aria-labelledby="ways"] .mx-wizard__page')[1].hidden, null, { timeout: 2000 }).catch(() => {});
    check('a valid page moves on, its step done', (await pages.nth(1).isHidden()) === false && (await steps.nth(0).getAttribute('data-status')) === 'done');
    await wizard.getByRole('textbox', { name: 'City' }).fill('Ankara');
    await next.click();
    await page.waitForFunction(() => !document.querySelectorAll('section[aria-labelledby="ways"] .mx-wizard__page')[2].hidden, null, { timeout: 2000 }).catch(() => {});
    const finish = wizard.getByRole('button', { name: 'Finish' });
    check('on the last page Next reads Finish', (await finish.count()) === 1);
    await finish.click();
    await page.waitForTimeout(200);
    check('the step’s own validate keeps it until the box is checked', (await ways.locator('.wz-result').textContent()) === '');
    await wizard.getByRole('checkbox', { name: 'Everything is right' }).check();
    await finish.click();
    await page.waitForFunction(() => document.querySelector('.wz-result')?.textContent === 'Welcome, Ada.', null, { timeout: 2000 }).catch(() => {});
    check('finishing tells the app, every step done', (await ways.locator('.wz-result').textContent()) === 'Welcome, Ada.' && (await steps.evaluateAll(els => els.every(el => el.dataset.status === 'done'))));

    // Programmatically: factories build pages when first shown; a step added later takes its place.
    const codeSection = page.locator('section[aria-labelledby="code"]');
    const coded = codeSection.locator('.mx-wizard').first();
    check('a page from a factory is built when first shown', (await coded.locator('.mx-wizard__page').nth(1).locator('p').count()) === 0);
    await codeSection.getByRole('button', { name: 'Add a step' }).click();
    await page.waitForTimeout(100);
    check('a step added programmatically shows in the stepper', (await coded.getByRole('navigation').getByRole('button', { name: /Extra/ }).count()) === 1);
    await codeSection.getByRole('button', { name: 'Go to Done' }).click();
    await page.waitForFunction(() => document.querySelector('.wz-told')?.textContent === 'Step 4: Done', null, { timeout: 2000 }).catch(() => {});
    check('goTo programmatically tells the change', (await codeSection.locator('.wz-told').textContent()) === 'Step 4: Done');

    // Standing: the stepper takes a column at the start, the pages beside it.
    const vertical = page.locator('section[aria-labelledby="vertical"] .mx-wizard');
    const layout = await vertical.evaluate(el => {
        const nav = el.querySelector('.mx-stepper').getBoundingClientRect();
        const pages = el.querySelector('.mx-wizard__pages').getBoundingClientRect();
        return { beside: pages.left >= nav.right, sameTop: Math.abs(pages.top - nav.top) <= 1 };
    });
    check('standing, the pages sit beside the stepper', layout.beside && layout.sameTop, JSON.stringify(layout));

    // Finishing that waits: a wrong code is refused, the right one finishes.
    const custom = page.locator('section[aria-labelledby="custom"]');
    await custom.getByRole('textbox', { name: 'Gift code' }).fill('nope');
    await custom.getByRole('button', { name: 'Next' }).click();
    await custom.getByRole('button', { name: 'Redeem' }).click();
    await page.waitForFunction(() => document.querySelector('.wz-note')?.textContent === 'That code is not known.', null, { timeout: 3000 }).catch(() => {});
    check('a promise that resolves to false keeps the wizard', (await custom.locator('.wz-note').textContent()) === 'That code is not known.');
    await custom.getByRole('button', { name: 'Back' }).click();
    await custom.getByRole('textbox', { name: 'Gift code' }).fill('motif');
    await custom.getByRole('button', { name: 'Next' }).click();
    await custom.getByRole('button', { name: 'Redeem' }).click();
    await page.waitForFunction(() => document.querySelector('.wz-note')?.textContent === 'Saved.', null, { timeout: 3000 }).catch(() => {});
    check('and true finishes it', (await custom.locator('.wz-note').textContent()) === 'Saved.');

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
