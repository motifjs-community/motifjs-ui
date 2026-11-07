import { designLanguages, designLanguageThemes } from '../languages.mjs';

/** Real-browser checks of the QR code and barcode pages. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'qrcode', { waitUntil: 'load' });
    const code = page.locator('.qr-basic');
    await code.waitFor();
    const pathOf = () => code.locator('path').getAttribute('d');
    check('a code with a name', (await code.getAttribute('role')) === 'img' && (await code.getAttribute('aria-label')).includes('ui.motifjs.com'));
    check('the sheet is square', await code.evaluate(el => {
        const box = el.getBoundingClientRect();
        return Math.abs(box.width - box.height) <= 0.5 && box.width >= 100;
    }));
    check('a code stays light in the dark theme', await page.evaluate(async () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        await new Promise(resolve => setTimeout(resolve, 200));
        const style = getComputedStyle(document.querySelector('.qr-basic'));
        const ok = style.backgroundColor === 'rgb(255, 255, 255)' && style.color === 'rgb(0, 0, 0)';
        document.documentElement.removeAttribute('data-theme');
        return ok;
    }));

    const first = await pathOf();
    await page.getByLabel('Text', { exact: true }).fill('Another text');
    await page.waitForTimeout(80);
    check('the code follows the text', (await pathOf()) !== first);

    const level = page.locator('.qr-level');
    const sideOf = () => level.evaluate(el => Number(el.querySelector('svg').getAttribute('viewBox').split(' ')[2]));
    const before = await sideOf();
    await page.getByRole('radio', { name: 'H', exact: true }).or(page.getByRole('button', { name: 'H', exact: true })).first().click();
    await page.waitForTimeout(80);
    check('a higher level makes a larger code', (await sideOf()) > before);

    const logo = page.locator('.qr-logo');
    const place = await logo.evaluate(el => {
        const box = el.getBoundingClientRect();
        const image = el.querySelector('img').getBoundingClientRect();
        return { x: image.left + image.width / 2 - (box.left + box.width / 2), y: image.top + image.height / 2 - (box.top + box.height / 2), size: image.width / box.width };
    });
    check('the logo is in the middle of the code', Math.abs(place.x) <= 0.5 && Math.abs(place.y) <= 0.5 && place.size < 0.3, JSON.stringify(place));

    await page.getByRole('button', { name: 'Create the image', exact: true }).click();
    const image = page.locator('.qr-image');
    await image.waitFor();
    const facts = await image.evaluate(async el => {
        await el.decode();
        return { width: el.naturalWidth, height: el.naturalHeight, src: el.src.slice(0, 22) };
    });
    check('a square PNG of whole modules', facts.src === 'data:image/png;base64,' && facts.width === facts.height && facts.width >= 200, JSON.stringify(facts));

    for (const language of designLanguages) {
        const box = await page.evaluate(async (language) => {
            document.documentElement.setAttribute('data-design-language', language);
            await new Promise(resolve => setTimeout(resolve, 150));
            const el = document.querySelector('.qr-export');
            const b = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return { width: b.width, height: b.height, bg: style.backgroundColor, color: style.color };
        }, language);
        check(`${language}: a QR code keeps its shape and its colors`, box.width >= 100 && box.width === box.height && box.bg === 'rgb(255, 255, 255)' && box.color === 'rgb(0, 0, 0)', JSON.stringify(box));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));
    await page.addScriptTag({ content: axeSource });
    const qrViolations = await page.evaluate(async () => (await window.axe.run('.docs-article')).violations.map(v => `${v.id}: ${v.nodes.length}`));
    check('axe clean on the QR code page', qrViolations.length === 0, qrViolations.join(', '));

    // Barcodes.
    await page.goto(base + 'barcode', { waitUntil: 'load' });
    const bars = page.locator('.bc-13');
    await bars.waitFor();
    check('the check digit is worked out', (await bars.locator('.mx-barcode__text').textContent()) === '4006381333931');
    check('each format draws bars', await page.evaluate(() => ['128', '39', '13', '8', 'upc', 'itf'].every(name => (document.querySelector(`.bc-${name} path`).getAttribute('d') ?? '').length > 50)));
    const crisp = await bars.evaluate(el => {
        const svg = el.querySelector('svg');
        const box = svg.getBoundingClientRect();
        const width = Number(svg.getAttribute('viewBox').split(' ')[2]);
        return { perModule: box.width / width };
    });
    check('a module is a whole number of pixels', Number.isInteger(crisp.perModule), JSON.stringify(crisp));
    const large = await page.locator('.bc-large svg').evaluate(el => el.getBoundingClientRect().height);
    check('height sets the bars', large === 96, String(large));
    check('no text when asked', !(await page.locator('.bc-plain .mx-barcode__text').isVisible()));

    const valid = page.locator('.bc-valid');
    await valid.scrollIntoViewIfNeeded();
    await page.getByLabel('EAN-13', { exact: true }).fill('4006381333930');
    await page.waitForTimeout(80);
    check('a wrong check digit is refused', await valid.evaluate(el => el.hasAttribute('data-invalid')));
    check('and draws nothing', !(await valid.locator('svg').isVisible()));
    check('and says so', (await page.locator('.bc-told').textContent()).includes('4006381333930'));
    await page.getByLabel('EAN-13', { exact: true }).fill('4006381333931');
    await page.waitForTimeout(80);
    check('a right one comes back', await valid.locator('svg').isVisible());

    await page.getByRole('button', { name: 'Create the image', exact: true }).click();
    const bcImage = page.locator('.bc-image');
    await bcImage.waitFor();
    const bcFacts = await bcImage.evaluate(async el => {
        await el.decode();
        return { width: el.naturalWidth, src: el.src.slice(0, 22) };
    });
    check('a PNG of the barcode', bcFacts.src === 'data:image/png;base64,' && bcFacts.width > 100, JSON.stringify(bcFacts));

    // A narrow parent never squeezes the bars.
    const narrow = await page.evaluate(async () => {
        const el = document.querySelector('.bc-large');
        const svg = el.querySelector('svg');
        const width = svg.getBoundingClientRect().width;
        el.style.maxInlineSize = '120px';
        await new Promise(resolve => setTimeout(resolve, 60));
        const after = svg.getBoundingClientRect().width;
        el.style.maxInlineSize = '';
        return { width, after };
    });
    check('a narrow parent does not squeeze the bars', narrow.width === narrow.after, JSON.stringify(narrow));
    const reachable = await page.evaluate(async () => {
        const el = document.querySelector('.bc-large');
        el.style.maxInlineSize = '120px';
        await new Promise(resolve => setTimeout(resolve, 60));
        el.scrollLeft = 0;
        const sheet = el.getBoundingClientRect();
        const left = el.querySelector('svg').getBoundingClientRect().left;
        el.style.maxInlineSize = '';
        return left - sheet.left;
    });
    check('and the start of the code can be reached', reachable >= -0.5, String(reachable));

    for (const language of designLanguages) {
        const facts2 = await page.evaluate(async (language) => {
            document.documentElement.setAttribute('data-design-language', language);
            await new Promise(resolve => setTimeout(resolve, 150));
            const el = document.querySelector('.bc-128');
            const svg = el.querySelector('svg').getBoundingClientRect();
            const text = el.querySelector('.mx-barcode__text').getBoundingClientRect();
            const style = getComputedStyle(el);
            return { offset: Math.abs(svg.left + svg.width / 2 - (text.left + text.width / 2)), bg: style.backgroundColor, height: svg.height };
        }, language);
        check(`${language}: the text is under the middle of the bars, on a light sheet`, facts2.offset <= 0.75 && facts2.bg === 'rgb(255, 255, 255)' && facts2.height >= 40, JSON.stringify(facts2));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));

    await page.addScriptTag({ content: axeSource });
    for (const language of designLanguages) {
        for (const theme of designLanguageThemes[language].themes) {
            await page.evaluate(async ([language, theme]) => {
                document.documentElement.setAttribute('data-design-language', language);
                document.documentElement.setAttribute('data-theme', theme);
                await new Promise(resolve => setTimeout(resolve, 180));
            }, [language, theme]);
            const low = await page.evaluate(async () => {
                const results = await window.axe.run({ include: [['.docs-article .bc-128']] }, { runOnly: ['color-contrast'] });
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
    check('axe clean on the barcode page', violations.length === 0, violations.join(', '));
}
