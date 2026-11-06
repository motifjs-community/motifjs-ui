import { designLanguages, designLanguageThemes } from '../languages.mjs';

/** Real-browser checks of the signature page: a real pointer, and the pixels it leaves on the canvas. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'signature', { waitUntil: 'load' });
    const field = page.locator('.sig-basic');
    await field.waitFor();
    const pad = field.locator('.mx-signature__pad');
    await pad.scrollIntoViewIfNeeded();
    const told = page.locator('.sig-told');
    const painted = (selector) => page.evaluate((selector) => {
        const canvas = document.querySelector(`${selector} canvas`);
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) count++;
        return count;
    }, selector);
    const draw = async (locator, from = 0.15, to = 0.7) => {
        const box = await locator.boundingBox();
        await page.mouse.move(box.x + box.width * from, box.y + box.height * 0.5);
        await page.mouse.down();
        for (let i = 1; i <= 12; i++) {
            const t = i / 12;
            await page.mouse.move(box.x + box.width * (from + (to - from) * t), box.y + box.height * (0.5 + Math.sin(t * 6) * 0.2));
        }
        await page.mouse.up();
        await page.waitForTimeout(60);
    };

    check('an empty pad has no ink', (await painted('.sig-basic')) === 0);
    check('an empty pad says where to sign', await field.locator('.mx-signature__placeholder').isVisible());
    check('the pad takes every touch', (await pad.evaluate(el => getComputedStyle(el).touchAction)) === 'none');
    check('the canvas matches the pad', await pad.evaluate(el => {
        const canvas = el.querySelector('canvas');
        const box = el.getBoundingClientRect();
        const own = canvas.getBoundingClientRect();
        return Math.abs(canvas.width - own.width * devicePixelRatio) <= 1 && own.width >= box.width - 4;
    }));

    await draw(pad);
    const inked = await painted('.sig-basic');
    const tip = await page.evaluate(async () => {
        const pad = document.querySelector('.sig-basic .mx-signature__pad');
        const canvas = pad.querySelector('canvas');
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let first = canvas.width;
        for (let y = 0; y < canvas.height; y++) for (let x = 0; x < first; x++) if (data[(y * canvas.width + x) * 4 + 3] > 0) first = x;
        return first / devicePixelRatio;
    });
    const started = (await pad.boundingBox()).width * 0.15;
    check('the ink starts under the pointer', Math.abs(tip - started) <= 3, `${tip} ${started}`);
    check('a line leaves ink on the canvas', inked > 100, String(inked));
    check('x-model holds the stroke', (await told.textContent()).includes('1'));
    const after = await pad.evaluate(el => ({ focused: document.activeElement === el, ring: el.matches(':focus-visible') }));
    check('the pointer gives the pad focus, without the ring of the keyboard', after.focused && !after.ring, JSON.stringify(after));
    check('the text goes away', !(await field.locator('.mx-signature__placeholder').isVisible()));

    // The ink stays when the pad changes size, in the same place.
    const before = await page.evaluate(() => {
        const field = document.querySelector('.sig-basic');
        field.style.inlineSize = '300px';
        return true;
    });
    await page.waitForTimeout(120);
    check('the ink stays when the pad gets narrower', before && (await painted('.sig-basic')) > 50);
    await page.evaluate(() => (document.querySelector('.sig-basic').style.inlineSize = ''));
    await page.waitForTimeout(120);

    await draw(pad, 0.3, 0.85);
    check('a second stroke is added', (await told.textContent()).includes('2'));
    await field.locator('.mx-signature__actions .mx-button').first().click();
    await page.waitForTimeout(60);
    check('the undo button removes the last stroke', (await told.textContent()).includes('1'));
    await pad.focus();
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(60);
    check('Ctrl+Z removes the last stroke', (await told.textContent()).includes('0'));
    check('and the ink goes with it', (await painted('.sig-basic')) === 0);
    await draw(pad);
    await pad.focus();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(60);
    check('Delete removes the signature', (await told.textContent()).includes('0'));

    // A click takes a dot.
    const spot = await pad.boundingBox();
    await page.mouse.click(spot.x + 60, spot.y + 40);
    await page.waitForTimeout(60);
    check('a tap leaves a dot', (await painted('.sig-basic')) > 0);
    await pad.focus();
    await page.keyboard.press('Delete');

    // The image.
    const exportField = page.locator('.sig-export');
    await exportField.locator('.mx-signature__pad').scrollIntoViewIfNeeded();
    await draw(exportField.locator('.mx-signature__pad'));
    await page.getByRole('button', { name: 'Create the image', exact: true }).click();
    const image = page.locator('.sig-image');
    await image.waitFor();
    const facts = await image.evaluate(async el => {
        await el.decode();
        const canvas = document.createElement('canvas');
        canvas.width = el.naturalWidth;
        canvas.height = el.naturalHeight;
        const context = canvas.getContext('2d');
        context.drawImage(el, 0, 0);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let dark = 0;
        for (let i = 0; i < data.length; i += 4) if (data[i] < 80) dark++;
        return { width: el.naturalWidth, dark, corner: [...data.slice(0, 3)], src: el.src.slice(0, 22) };
    });
    check('a PNG in the size asked for', facts.src === 'data:image/png;base64,' && facts.width === 420, JSON.stringify(facts));
    check('dark ink on the white background asked for', facts.dark > 50 && facts.corner.join() === '255,255,255', JSON.stringify(facts));
    // Saved, read-only and disabled.
    check('saved strokes are drawn again', (await painted('.sig-saved')) > 100);
    const saved = page.locator('.sig-saved');
    await saved.locator('.mx-signature__pad').scrollIntoViewIfNeeded();
    const was = await painted('.sig-saved');
    await draw(saved.locator('.mx-signature__pad'));
    check('a read-only pad takes no strokes', (await painted('.sig-saved')) === was);
    check('a read-only pad has no buttons', !(await saved.locator('.mx-signature__actions').isVisible()));
    await page.getByRole('button', { name: 'Validate', exact: true }).click();
    await page.waitForTimeout(80);
    check('a required, empty pad fails', await page.locator('.sig-required').evaluate(el => el.hasAttribute('data-invalid')));

    for (const language of designLanguages) {
        const result = await page.evaluate(async (language) => {
            document.documentElement.setAttribute('data-design-language', language);
            await new Promise(resolve => setTimeout(resolve, 200));
            const pad = document.querySelector('.sig-basic .mx-signature__pad');
            const box = pad.getBoundingClientRect();
            const canvas = pad.querySelector('canvas');
            const guide = pad.querySelector('.mx-signature__guide').getBoundingClientRect();
            const actions = document.querySelector('.sig-basic .mx-signature__actions').getBoundingClientRect();
            return {
                height: box.height,
                fits: Math.abs(canvas.getBoundingClientRect().height - box.height) <= 4,
                guideLeft: guide.left - box.left, guideRight: box.right - guide.right,
                topGap: actions.top - box.top, endGap: box.right - actions.right,
            };
        }, language);
        check(`${language}: the pad has a height, and the canvas fills it`, result.height >= 100 && result.fits, JSON.stringify(result));
        check(`${language}: the line is centered`, Math.abs(result.guideLeft - result.guideRight) <= 0.5, JSON.stringify(result));
        check(`${language}: the buttons sit as far from both edges`, Math.abs(result.topGap - result.endGap) <= 1.5, JSON.stringify(result));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));

    await page.addScriptTag({ content: axeSource });
    for (const language of designLanguages) {
        for (const theme of designLanguageThemes[language].themes) {
            await page.evaluate(async ([language, theme]) => {
                document.documentElement.setAttribute('data-design-language', language);
                document.documentElement.setAttribute('data-theme', theme);
                await new Promise(resolve => setTimeout(resolve, 220));
            }, [language, theme]);
            const low = await page.evaluate(async () => {
                const results = await window.axe.run({ include: [['.docs-article .sig-basic']] }, { runOnly: ['color-contrast'] });
                return results.violations.flatMap(v => v.nodes.map(n => `${n.target[0]} ${n.any[0]?.data?.contrastRatio ?? ''}`));
            });
            check(`${language} ${theme}: the text can be read`, low.length === 0, low.slice(0, 3).join(' | '));
        }
    }
    await page.evaluate(() => {
        document.documentElement.removeAttribute('data-design-language');
        document.documentElement.removeAttribute('data-theme');
    });
    await page.waitForTimeout(350);
    const violations = await page.evaluate(async () => (await window.axe.run('.docs-article')).violations.map(v => `${v.id}: ${v.nodes.length}`));
    check('axe clean', violations.length === 0, violations.join(', '));
}
