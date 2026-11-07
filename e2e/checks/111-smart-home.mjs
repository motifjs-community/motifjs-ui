/** Real-browser checks of the smart home panel: what a resident would do with it, live values, every screen, a tablet held both ways and a phone. */
export default async function ({ page, base, check, axeSource }) {
    const panel = base + 'smart-home/';
    const open = async (screen = '') => {
        await page.goto(`${panel}#/${screen}`, { waitUntil: 'load' });
        await page.locator('.sh-screen > *').first().waitFor();
        await page.waitForTimeout(700);
    };
    const axe = async where => {
        await page.addScriptTag({ content: axeSource });
        const issues = await page.evaluate(async () => (await window.axe.run('.sh')).violations.map(v => `${v.id}: ${v.nodes.length} ${v.nodes[0]?.target}`));
        check(`${where}: axe clean`, issues.length === 0, issues.join(', '));
    };
    await page.setViewportSize({ width: 1180, height: 820 });

    // Home: live values, a scene and its undo, a room's lights from its tile.
    await open();
    const watched = () => page.locator('.sh-indoor').getAttribute('aria-valuenow');
    const clock = await page.locator('.sh-day').textContent();
    check('the day and the time are at the top', /\d{1,2}[:.]\d{2}/.test(clock), clock);
    const energy = () => page.locator('.sh-energy .mx-gauge').getAttribute('aria-valuenow');
    const firstEnergy = await energy();
    await page.waitForTimeout(4300);
    // Both move every two seconds: the power at random, the rooms toward their targets.
    const firstIndoor = await watched();
    await page.waitForTimeout(4300);
    check('the devices report new values on their own', (await energy()) !== firstEnergy || (await watched()) !== firstIndoor, `power ${firstEnergy} → ${await energy()}, indoors ${firstIndoor} → ${await watched()}`);
    await page.locator('.sh-scene', { hasText: 'Away' }).click();
    await page.waitForTimeout(300);
    const pressed = await page.locator('.sh-scene[aria-pressed="true"]').textContent();
    const lightsAfter = await page.locator('.sh-room-tile').first().locator('.sh-quiet').last().textContent();
    check('the away scene is on, and the lights are off', pressed.includes('Away') && lightsAfter.startsWith('0 of'), `${pressed} / ${lightsAfter}`);
    await page.locator('.mx-toast').getByRole('button', { name: 'Undo' }).click();
    await page.waitForTimeout(300);
    check('undo in the toast brings the scene back', (await page.locator('.sh-scene[aria-pressed="true"]').textContent()).includes('At home'));
    const target = () => page.locator('.sh-climate .sh-target strong').textContent();
    const before = await target();
    await page.locator('.sh-climate').getByRole('button', { name: 'Warmer' }).click();
    check('the target goes up half a degree', parseFloat(await target()) === parseFloat(before) + 0.5, `${before} → ${await target()}`);
    await axe('home');

    // From a room's tile to the room.
    await page.locator('.sh-room-tile', { hasText: 'Bedroom' }).locator('.mx-card__title').click();
    await page.waitForTimeout(700);
    check('a room tile opens its room', page.url().endsWith('#/rooms') && (await page.locator('.sh-room-climate .mx-card__title').textContent()) === 'Bedroom', page.url());
    const ceiling = page.locator('.sh-light').first();
    const dimmer = ceiling.getByRole('slider');
    const offBefore = await dimmer.getAttribute('aria-disabled');
    await ceiling.getByRole('switch').click();
    await page.waitForTimeout(200);
    check('turning a light on lets its brightness change', offBefore === 'true' && (await dimmer.getAttribute('aria-disabled')) !== 'true');
    check('the rail shows where the reader is', (await page.locator('.sh-rail-item[aria-current="page"]').textContent()).includes('Rooms'));
    await axe('rooms');

    await open('climate');
    check('every room has its gauge on the climate screen', (await page.locator('.sh-climate-room .mx-gauge').count()) === 5);
    await axe('climate');
    const hours = page.locator('.sh-hours');
    const lines = await hours.evaluate(el => [...el.querySelectorAll('.mx-chart__line')].map(line => line.getAttribute('d')));
    check('every room has its own line in the last hours', lines.length === 5 && new Set(lines).size === 5, `${lines.length} lines, ${new Set(lines).size} different`);
    const fill = await hours.evaluate(el => Math.round(el.closest('.mx-card').getBoundingClientRect().bottom - el.getBoundingClientRect().bottom));
    const toTable = hours.locator('.mx-chart__tools button').last();
    await toTable.click();
    await page.waitForTimeout(300);
    const readable = await hours.evaluate(el => {
        const box = el.querySelector('.mx-data-grid__viewport').getBoundingClientRect();
        return [...el.querySelectorAll('[role="row"]')].filter(row => {
            const r = row.getBoundingClientRect();
            return r.height > 0 && r.top >= box.top - 1 && r.bottom <= box.bottom + 1;
        }).length;
    });
    check('the hours chart fills its card', fill <= 24, `${fill}px below`);
    check('the hours table shows enough rows to be read', readable >= 5, `${readable} rows`);
    await toTable.click();

    await open('energy');
    const drawn = await page.evaluate(() => ({
        day: document.querySelectorAll('.sh-power .mx-chart__line').length,
        devices: document.querySelectorAll('.sh-usage .mx-bar-gauge__bar').length
    }));
    check('the energy screen draws the day and the devices', drawn.day === 2 && drawn.devices === 5, JSON.stringify(drawn));
    await axe('energy');

    // Security: the alarm goes off only with the code.
    await open('security');
    await page.locator('.sh-arm').click();
    await page.waitForTimeout(300);
    const code = page.locator('.sh-code').getByRole('textbox');
    await code.click();
    await page.keyboard.type('1111');
    await page.waitForTimeout(300);
    const stillOn = (await page.locator('.sh-alarm-state').getAttribute('data-armed')) === 'true';
    await code.click();
    await page.keyboard.type('1234');
    await page.waitForTimeout(400);
    check('a wrong code keeps the alarm on, the right one turns it off', stillOn && (await page.locator('.sh-alarm-state').getAttribute('data-armed')) === 'false');
    await axe('security');

    // Automations: a new one, step by step.
    await open('automations');
    const count = await page.locator('.sh-automation').count();
    await page.locator('.sh-new').click();
    const form = page.getByRole('dialog', { name: 'New automation' });
    await form.waitFor();
    await form.getByRole('button', { name: /Next/ }).click();
    await page.waitForTimeout(200);
    await form.getByRole('button', { name: /Next/ }).click();
    await page.waitForTimeout(200);
    await form.getByRole('textbox', { name: 'Name' }).fill('Evening lights');
    await form.getByRole('button', { name: /Finish/ }).click();
    await page.waitForTimeout(500);
    check('a new automation is added through the steps', (await page.locator('.sh-automation').count()) === count + 1 && (await page.getByText('Evening lights').count()) > 0);
    await axe('automations');

    // Parts laid out side by side or one under the other never sit on each other, in any design language or theme.
    const overlaps = () =>
        page.evaluate(() => {
            const found = [];
            const shown = el => {
                const r = el.getBoundingClientRect();
                const st = getComputedStyle(el);
                return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.position !== 'absolute' && st.position !== 'fixed';
            };
            for (const box of document.querySelectorAll('.sh-screen [class*="sh-"], .sh-top')) {
                const kids = [...box.children].filter(shown);
                for (let i = 0; i < kids.length; i++) {
                    const a = kids[i].getBoundingClientRect();
                    for (let j = i + 1; j < kids.length; j++) {
                        const b = kids[j].getBoundingClientRect();
                        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
                        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
                        if (w > 1 && h > 1) found.push(`${box.className}: ${kids[i].className || kids[i].tagName} / ${kids[j].className || kids[j].tagName}`);
                    }
                }
            }
            return [...new Set(found)];
        });
    const { designLanguages, designLanguageThemes } = await import('../languages.mjs');
    for (const language of designLanguages) {
        for (const theme of designLanguageThemes[language].themes) {
            await page.evaluate(({ language, theme }) => {
                localStorage.setItem('mx-docs-design-language', language);
                localStorage.setItem('mx-docs-theme', theme);
            }, { language, theme });
            const seen = [];
            for (const screen of ['', 'rooms', 'climate', 'energy', 'security', 'automations']) {
                await open(screen);
                seen.push(...(await overlaps()).map(o => `${screen || 'home'}: ${o}`));
            }
            check(`${language} ${theme}: no parts sit on each other on any screen`, seen.length === 0, seen.slice(0, 4).join(' | '));
        }
    }
    await page.evaluate(() => {
        localStorage.removeItem('mx-docs-design-language');
        localStorage.removeItem('mx-docs-theme');
    });

    // A tablet upright and a phone: nothing can be scrolled sideways on any screen.
    for (const size of [{ width: 820, height: 1180 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(size);
        for (const screen of ['', 'rooms', 'climate', 'energy', 'security', 'automations']) {
            await open(screen);
            const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            const sitting = await overlaps();
            check(`${screen || 'home'} at ${size.width}px: nothing scrolls sideways and no parts sit on each other`, wide <= 1 && sitting.length === 0, `${wide}px ${sitting.slice(0, 3).join(' | ')}`);
        }
    }

    // The showcase page shows the panel in a tablet frame scaled to the page.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + 'showcase/home', { waitUntil: 'load' });
    const frame = page.locator('.sh-tablet');
    await frame.waitFor();
    await page.waitForTimeout(1200);
    const fit = await page.locator('.sh-stage').evaluate(el => {
        const stage = el.getBoundingClientRect();
        const tablet = el.querySelector('iframe').getBoundingClientRect();
        return { inside: tablet.right <= stage.right + 1, ratio: Math.round((tablet.width / tablet.height) * 100) / 100 };
    });
    const inner = await page.frameLocator('.sh-tablet').locator('.sh-greeting').textContent();
    check('the showcase shows the whole panel in a tablet frame', fit.inside && fit.ratio === 1.44 && /Ada/.test(inner), JSON.stringify(fit));
}
