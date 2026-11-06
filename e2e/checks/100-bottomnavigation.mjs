import { designLanguages, designLanguageThemes } from '../languages.mjs';

const SCROLLED = '.bn-scroll';
const SELECTOR = '.docs-article .mx-bottom-navigation';

/** Real-browser checks of the bottom navigation page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'bottomnavigation', { waitUntil: 'load' });
    const bar = page.locator('.bn-basic');
    await bar.waitFor();
    const items = bar.locator('.mx-bottom-navigation__item');
    const told = page.locator('.bn-told');
    check('a named nav', (await bar.evaluate(el => el.localName)) === 'nav' && (await bar.getAttribute('aria-label')) === 'Navigation');
    check('the selected item is marked', (await items.nth(0).getAttribute('aria-current')) === 'page');

    await items.nth(2).click();
    check('a press selects, and x-model follows', (await told.textContent()).includes('calendar') && (await items.nth(2).getAttribute('aria-current')) === 'page');

    // The keyboard: one Tab stop, the arrows inside it, Enter selects.
    await items.nth(2).focus();
    await page.keyboard.press('ArrowRight');
    check('the arrow moves focus', await items.nth(3).evaluate(el => el === document.activeElement));
    await page.keyboard.press('Enter');
    check('Enter selects', (await told.textContent()).includes('profile'));
    check('one Tab stop', (await items.evaluateAll(els => els.filter(el => el.tabIndex === 0).length)) === 1);

    for (const language of designLanguages) {
        const result = await page.evaluate(async (language) => {
            document.documentElement.setAttribute('data-design-language', language);
            await new Promise((resolve) => setTimeout(resolve, 200));
            const bar = document.querySelector('.bn-basic');
            const all = [...bar.querySelectorAll('.mx-bottom-navigation__item')];
            const item = all.find(el => el.hasAttribute('data-selected'));
            const r = (el) => el.getBoundingClientRect();
            const mid = (b) => b.left + b.width / 2;
            const midY = (b) => b.top + b.height / 2;
            const host = r(item.querySelector('.mx-bottom-navigation__icon-host'));
            const ind = r(item.querySelector('.mx-bottom-navigation__indicator'));
            const label = r(item.querySelector('.mx-bottom-navigation__label'));
            const list = r(bar.querySelector('.mx-bottom-navigation__list'));
            const widths = all.map(el => Math.round(r(el).width));
            const glyph = r(item.querySelector('.mx-glyph'));
            return {
                offIcon: Math.abs(mid(host) - mid(r(item))),
                offLabel: Math.abs(mid(label) - mid(r(item))),
                offGlyph: Math.abs(midY(glyph) - midY(host)),
                ind: { w: ind.width, h: ind.height, off: Math.abs(mid(ind) - mid(host)), offY: Math.abs(midY(ind) - midY(host)) },
                padTop: r(item).top - list.top,
                padBottom: list.bottom - r(item).bottom,
                equal: new Set(widths).size === 1,
            };
        }, language);
        check(`${language}: icon and label are centered in the item`, result.offIcon <= 0.5 && result.offLabel <= 0.75 && result.offGlyph <= 0.5, JSON.stringify(result));
        check(`${language}: the items have the same width`, result.equal);
        check(`${language}: the row is as far from both edges`, Math.abs(result.padTop - result.padBottom) <= 1, `${result.padTop} ${result.padBottom}`);
        if (result.ind.w > 0 && result.ind.h > 8) check(`${language}: the mark lies behind the icon`, result.ind.off <= 0.5 && result.ind.offY <= 0.5, JSON.stringify(result.ind));
        else if (result.ind.w > 0) check(`${language}: the mark is above the icon`, result.ind.off <= 0.5, JSON.stringify(result.ind));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));

    // Labels: out of view, but still the name of the item.
    const labels = page.locator('.bn-labels');
    await page.getByRole('radio', { name: 'Never' }).or(page.getByRole('button', { name: 'Never', exact: true })).first().click();
    await page.waitForTimeout(120);
    const name = await labels.locator('.mx-bottom-navigation__item').nth(1).evaluate(el => {
        const label = el.querySelector('.mx-bottom-navigation__label').getBoundingClientRect();
        return { width: label.width, text: el.textContent };
    });
    check('a label out of view stays the name of the item', name.width <= 1 && name.text.includes('Search'), JSON.stringify(name));

    // A refused change keeps the item.
    const guarded = page.locator('.bn-guarded');
    await guarded.locator('.mx-bottom-navigation__item').nth(1).click();
    check('onSelecting keeps the item', (await guarded.locator('.mx-bottom-navigation__item').nth(0).getAttribute('aria-current')) === 'page');
    check('and says why', (await page.locator('.bn-guard-told').textContent()).includes('Save'));

    // Scrolling away in a box, and coming back.
    const screen = page.locator('.bn-screen');
    const scroll = page.locator('.bn-scroll');
    await screen.scrollIntoViewIfNeeded();
    await screen.evaluate(el => (el.scrollTop = 200));
    await page.waitForTimeout(350);
    check('scrolling down moves the bar away', await scroll.evaluate(el => el.hasAttribute('data-hidden')));
    await screen.evaluate(el => (el.scrollTop = 100));
    await page.waitForTimeout(120);
    check('scrolling up brings it back', !(await scroll.evaluate(el => el.hasAttribute('data-hidden'))));

    // Under the page's own top bar: a bar that sticks in a box must not rise above what the page keeps on top.
    const under = await page.evaluate(async (selector) => {
        const top = document.querySelector('.docs-topbar');
        const bar = document.querySelector(selector);
        const line = top.getBoundingClientRect();
        window.scrollBy({ top: bar.getBoundingClientRect().top - line.top, behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 200));
        const edge = bar.getBoundingClientRect();
        const now = top.getBoundingClientRect();
        const inside = edge.top < now.bottom && edge.bottom > now.top;
        const hit = document.elementFromPoint(edge.left + edge.width / 2, now.top + now.height / 2);
        return { inside, onTop: !!hit?.closest('.docs-topbar'), hit: hit?.className?.toString().slice(0, 40) };
    }, SCROLLED);
    check('a sticky bar stays under the top bar of the page', under.inside && under.onTop, JSON.stringify(under));

    // A bar fixed to the viewport keeps the page's layer.
    const fixed = await page.evaluate(() => {
        const bar = document.querySelector('.bn-scroll');
        bar.setAttribute('data-position', 'fixed');
        const layer = getComputedStyle(bar).zIndex;
        bar.setAttribute('data-position', 'sticky');
        return { layer, sticky: getComputedStyle(bar).zIndex };
    });
    check('fixed takes the layer of the page, sticky stays low', Number(fixed.layer) >= 1000 && Number(fixed.sticky) < 100, JSON.stringify(fixed));

    await page.addScriptTag({ content: axeSource });
    // Every language in every theme: all text on the bars can be read.
    for (const language of designLanguages) {
        for (const theme of designLanguageThemes[language].themes) {
            await page.evaluate(async ([language, theme]) => {
                document.documentElement.setAttribute('data-design-language', language);
                document.documentElement.setAttribute('data-theme', theme);
                await new Promise((resolve) => setTimeout(resolve, 220));
            }, [language, theme]);
            const low = await page.evaluate(async (selector) => {
                const results = await window.axe.run({ include: [selector] }, { runOnly: ['color-contrast'] });
                return results.violations.flatMap(v => v.nodes.map(n => `${n.target[0]} ${n.any[0]?.data?.contrastRatio ?? ''}`));
            }, SELECTOR);
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
