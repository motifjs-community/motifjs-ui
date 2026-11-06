/** Real-browser checks of the speed dial page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'speeddial', { waitUntil: 'load' });
    const up = page.locator('.sd-up');
    await up.waitFor();
    const main = up.locator('.mx-speed-dial__main');
    const fan = up.locator('.mx-speed-dial__fan');
    const told = page.locator('.sd-told');
    check('a main button that opens a menu, named New', (await main.getAttribute('aria-haspopup')) === 'menu' && (await main.getAttribute('aria-expanded')) === 'false' && (await main.getAttribute('aria-label')) === 'New' && (await fan.getAttribute('role')) === 'menu');
    check('closed, the actions are out of sight and inert', (await fan.isHidden()) && (await fan.evaluate(el => el.inert === true)));

    // A press opens the fan above the button, with the labels; a press on an action runs it and closes the fan.
    await main.click();
    await page.waitForTimeout(250);
    const actions = up.locator('.mx-speed-dial__action');
    check('open: the actions are in sight with their labels, the glyph says close', (await up.getAttribute('data-open')) === '' && (await main.getAttribute('aria-expanded')) === 'true' && (await fan.isVisible()) && (await actions.nth(0).locator('.mx-speed-dial__label').isVisible()) && (await main.locator('.mx-speed-dial__main-glyph').getAttribute('data-icon')) === 'dismiss' && (await told.textContent()) === 'nothing yet (open)');
    const mainBox = await main.boundingBox();
    const firstBox = await actions.nth(0).boundingBox();
    const lastBox = await actions.nth(3).boundingBox();
    check('the fan stands above the button, the first action nearest, centred on it', firstBox.y + firstBox.height <= mainBox.y && lastBox.y < firstBox.y && Math.abs(firstBox.x + firstBox.width / 2 - (mainBox.x + mainBox.width / 2)) <= 0.5, `${firstBox.y} ${mainBox.y}`);
    const labelBox = await actions.nth(0).locator('.mx-speed-dial__label').boundingBox();
    check('the label lies to the start side of its action, centred on it', labelBox.x + labelBox.width <= firstBox.x && Math.abs(labelBox.y + labelBox.height / 2 - (firstBox.y + firstBox.height / 2)) <= 0.5);
    check('a disabled action says so', (await actions.nth(3).getAttribute('aria-disabled')) === 'true');
    await actions.nth(0).click();
    await page.waitForTimeout(250);
    check('the action ran and the fan closed', (await told.textContent()) === 'a new note' && (await up.getAttribute('data-open')) === null && (await fan.isHidden()));

    // The keys: Up opens on the first action, Up again moves on, Escape closes and the focus is back.
    await main.focus();
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(250);
    check('Up on the button opens the fan on the first action', (await up.getAttribute('data-open')) === '' && (await actions.nth(0).evaluate(el => document.activeElement === el)));
    await page.keyboard.press('ArrowUp');
    check('Up again moves to the next action', await actions.nth(1).evaluate(el => document.activeElement === el));
    await page.keyboard.press('End');
    check('End skips the disabled last one and stops on the last enabled', await actions.nth(2).evaluate(el => document.activeElement === el));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    check('Enter runs it and closes', (await told.textContent()) === 'a file to upload' && (await up.getAttribute('data-open')) === null);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    check('Escape closes and puts the focus back on the button', (await up.getAttribute('data-open')) === null && (await main.evaluate(el => document.activeElement === el)));
    await main.click();
    await page.waitForTimeout(250);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(250);
    check('a press outside closes the fan', (await up.getAttribute('data-open')) === null);

    // One that fans to the end: the actions lie in a row after the button, the labels under them.
    const end = page.locator('.sd-end');
    await end.locator('.mx-speed-dial__main').click();
    await page.waitForTimeout(250);
    const endMain = await end.locator('.mx-speed-dial__main').boundingBox();
    const endFirst = await end.locator('.mx-speed-dial__action').nth(0).boundingBox();
    const endLabel = await end.locator('.mx-speed-dial__action').nth(0).locator('.mx-speed-dial__label').boundingBox();
    check('fanned to the end: the first action after the button, its label over it', endFirst.x >= endMain.x + endMain.width && Math.abs(endFirst.y + endFirst.height / 2 - (endMain.y + endMain.height / 2)) <= 0.5 && endLabel.y + endLabel.height <= endFirst.y + 0.5, `action ${endFirst.x},${endFirst.y} main ${endMain.x + endMain.width},${endMain.y} label ${endLabel.y + endLabel.height}`);
    await page.keyboard.press('Escape');

    // Around the button: what a dial's open actions measure from its main button and in its box.
    const around = async (dial, box) => {
        await dial.locator('.mx-speed-dial__main').click();
        await page.waitForTimeout(350);
        return dial.evaluate((el, boxSelector) => {
            const r = n => n.getBoundingClientRect();
            const main = r(el.querySelector('.mx-speed-dial__main'));
            const cx = main.left + main.width / 2;
            const cy = main.top + main.height / 2;
            const frame = r(el.closest(boxSelector));
            const rows = [...el.querySelectorAll('.mx-speed-dial__action')].map(a => {
                const b = r(a);
                const x = b.left + b.width / 2;
                const y = b.top + b.height / 2;
                return { x, y, distance: Math.hypot(x - cx, y - cy), angle: (Math.atan2(y - cy, x - cx) * 180) / Math.PI, inside: b.left >= frame.left - 0.5 && b.right <= frame.right + 0.5 && b.top >= frame.top - 0.5 && b.bottom <= frame.bottom + 0.5, size: b.width };
            });
            const near = Math.min(...rows.slice(1).map((a, i) => Math.hypot(a.x - rows[i].x, a.y - rows[i].y)));
            const fromMain = Math.min(...rows.map(a => a.distance)) - main.width / 2 - rows[0].size / 2;
            return { rows, near, fromMain, spread: Math.max(...rows.map(a => a.distance)) - Math.min(...rows.map(a => a.distance)), main, frame };
        }, box);
    };
    const circle = page.locator('.sd-circle');
    await circle.scrollIntoViewIfNeeded();
    check('closed, no action of the circle is in sight', (await circle.locator('.mx-speed-dial__fan').isHidden()));
    const round = await around(circle, 'div');
    check('in the centre of its box', Math.abs(round.main.left + round.main.width / 2 - (round.frame.left + round.frame.width / 2)) <= 0.5 && Math.abs(round.main.top + round.main.height / 2 - (round.frame.top + round.frame.height / 2)) <= 0.5, `${round.main.left + round.main.width / 2} of ${round.frame.left + round.frame.width / 2}`);
    check('five actions at one distance from the button', round.rows.length === 5 && round.spread <= 0.5, `${round.spread}`);
    const steps = round.rows.slice(1).map((a, i) => (a.angle - round.rows[i].angle + 360) % 360);
    check('evenly around it, the first straight up, clockwise', Math.abs(round.rows[0].angle + 90) <= 0.5 && steps.every(a => Math.abs(a - 72) <= 0.5), steps.map(a => a.toFixed(1)).join(' '));
    check('the actions keep clear of each other and of the button', round.near >= round.rows[0].size && round.fromMain >= 8, `${round.near} ${round.fromMain}`);
    check('no labels around the button', await circle.locator('.mx-speed-dial__label').first().isHidden());
    const tip = page.locator('[role="tooltip"]:popover-open');
    await circle.locator('.mx-speed-dial__action').nth(0).hover();
    await page.waitForTimeout(350);
    check('hovering an action shows its text as a tooltip', (await tip.count()) === 1 && (await tip.textContent()) === 'Edit');
    const tipBox = await tip.boundingBox();
    const actionBox = await circle.locator('.mx-speed-dial__action').nth(0).boundingBox();
    check('over the action on top: outwards', tipBox.y + tipBox.height <= actionBox.y + 0.5, `${tipBox.y + tipBox.height} ${actionBox.y}`);
    await circle.locator('.mx-speed-dial__action').nth(2).click();
    await page.waitForTimeout(350);
    check('a press runs it, the fan closes and the tooltip goes', (await page.locator('.sd-circle-told').textContent()) === 'delete' && (await tip.count()) === 0 && (await circle.getAttribute('data-open')) === null);
    await page.getByRole('button', { name: 'Radius 120' }).click();
    await page.waitForTimeout(100);
    const wide = await around(circle, 'div');
    check('a radius of its own', wide.rows.every(a => Math.abs(a.distance - 120) <= 0.5), wide.rows.map(a => a.distance.toFixed(1)).join(' '));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await circle.locator('.mx-speed-dial__main').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(350);
    check('an arrow opens it on the first action', (await circle.getAttribute('data-open')) === '' && (await circle.locator('.mx-speed-dial__action').nth(0).evaluate(el => document.activeElement === el)));
    check('keyboard focus shows the tooltip', (await tip.count()) === 1 && (await tip.textContent()) === 'Edit');
    await page.keyboard.press('ArrowDown');
    check('Down moves on along the circle', await circle.locator('.mx-speed-dial__action').nth(1).evaluate(el => document.activeElement === el));
    await page.keyboard.press('ArrowLeft');
    check('Left comes back', await circle.locator('.mx-speed-dial__action').nth(0).evaluate(el => document.activeElement === el));
    await page.keyboard.press('Escape');
    check('the first Escape hides the tooltip', (await tip.count()) === 0 && (await circle.getAttribute('data-open')) === '');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    check('the second closes the actions', (await circle.getAttribute('data-open')) === null && (await circle.locator('.mx-speed-dial__main').evaluate(el => document.activeElement === el)));

    // A half circle on each edge of a box, into the box.
    await page.locator('.sd-semi').scrollIntoViewIfNeeded();
    for (const [name, middle] of [['top', 90], ['end', 180], ['bottom', -90], ['start', 0]]) {
        const dial = page.locator(`.sd-semi-${name}`);
        const m = await around(dial, '.sd-semi');
        const away = a => Math.abs(((a.angle - middle + 540) % 360) - 180);
        const onEdge = name === 'top' || name === 'bottom' ? Math.abs(m.main.left + m.main.width / 2 - (m.frame.left + m.frame.width / 2)) : Math.abs(m.main.top + m.main.height / 2 - (m.frame.top + m.frame.height / 2));
        check(`half circle at ${name}: in the middle of the edge`, onEdge <= 0.5, `${onEdge}`);
        check(`half circle at ${name}: all in the box, at one distance, spread over 180 degrees around the way in`, m.rows.every(a => a.inside) && m.spread <= 0.5 && Math.abs(Math.max(...m.rows.map(away)) - 90) <= 0.5, m.rows.map(a => a.angle.toFixed(0)).join(' '));
        await page.keyboard.press('Escape');
        await page.waitForTimeout(250);
    }

    // A quarter circle in each corner of a box, into the box.
    await page.locator('.sd-quarter').scrollIntoViewIfNeeded();
    for (const name of ['top-start', 'top-end', 'bottom-start', 'bottom-end']) {
        const dial = page.locator(`.sd-quarter-${name}`);
        const m = await around(dial, '.sd-quarter');
        check(`quarter circle at ${name}: all in the box, at one distance, clear of each other`, m.rows.every(a => a.inside) && m.spread <= 0.5 && m.near >= m.rows[0].size, `${m.near} ${m.rows.map(a => a.angle.toFixed(0)).join(' ')}`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(250);
    }

    // The tooltips: the speed dial's options, an action's own text and options, none on one, off for all.
    const tips = page.locator('.sd-tips');
    await tips.scrollIntoViewIfNeeded();
    const tipActions = tips.locator('.mx-speed-dial__action');
    const hovered = async n => {
        await page.mouse.move(5, 5);
        await page.waitForTimeout(400);
        await tipActions.nth(n).hover();
        await page.waitForTimeout(350);
        return (await tip.count()) === 1 ? { text: await tip.textContent(), box: await tip.boundingBox(), action: await tipActions.nth(n).boundingBox() } : null;
    };
    await tips.locator('.mx-speed-dial__main').click();
    await page.waitForTimeout(300);
    let shownTip = await hovered(0);
    check('the speed dial\'s placement on top, with the action\'s text', shownTip?.text === 'Edit' && shownTip.box.y + shownTip.box.height <= shownTip.action.y + 0.5, JSON.stringify(shownTip));
    shownTip = await hovered(1);
    check('an action\'s own text', shownTip?.text === 'Upload a new version, up to 20 MB');
    shownTip = await hovered(2);
    check('an action\'s own options: under it', shownTip?.text === 'Kept in the bin for 30 days' && shownTip.box.y >= shownTip.action.y + shownTip.action.height - 0.5, JSON.stringify(shownTip));
    check('none on an action that says no', (await hovered(3)) === null);
    await page.locator('.sd-tips-toggle').click();
    await tips.locator('.mx-speed-dial__main').click();
    await page.waitForTimeout(300);
    check('off for all but the actions that say otherwise', (await hovered(0)) === null && (await hovered(1))?.text === 'Upload a new version, up to 20 MB');
    await page.mouse.move(5, 5);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(300);

    // In the corner: switched on, it is fixed to the viewport's bottom end corner; another corner moves it.
    await page.locator('.sd-corner-toggle').click();
    await page.waitForTimeout(250);
    const corner = page.locator('.sd-corner');
    let box = await corner.boundingBox();
    const view = page.viewportSize();
    const inset = await corner.evaluate(el => parseFloat(getComputedStyle(el).insetInlineEnd));
    check('switched on, it sits in the bottom end corner of the viewport', (await corner.evaluate(el => getComputedStyle(el).position)) === 'fixed' && Math.abs(view.width - (box.x + box.width) - inset) <= 1 && Math.abs(view.height - (box.y + box.height) - inset) <= 1, `${box.x + box.width} of ${view.width}, ${box.y + box.height} of ${view.height}, inset ${inset}`);
    await page.getByRole('button', { name: 'Top end', exact: true }).click();
    await page.waitForTimeout(250);
    box = await corner.boundingBox();
    check('moved to the top end corner, fanning down', Math.abs(box.y - inset) <= 1 && (await corner.getAttribute('data-direction')) === 'down');
    await page.locator('.sd-corner-toggle').click();
    await page.waitForTimeout(250);
    check('switched off, it is gone', await corner.isHidden());

    // One action: the main button does it and takes its name.
    const single = page.locator('.sd-single .mx-speed-dial__main');
    await single.scrollIntoViewIfNeeded();
    check('with one action the main button is that action', (await single.getAttribute('aria-haspopup')) === null && (await single.getAttribute('aria-label')) === 'Save' && (await single.locator('.mx-speed-dial__main-glyph').getAttribute('data-icon')) === 'save');
    await single.click();
    check('a press does the action', (await page.locator('.sd-single-told').textContent()) === 'saved 1 times');
    check('extended, the name shows beside the glyph', (await page.locator('.sd-extended .mx-speed-dial__main-text').textContent()) === 'Save a copy' && (await page.locator('.sd-extended .mx-speed-dial__main-text').isVisible()));

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
