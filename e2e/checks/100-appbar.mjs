import { designLanguages, designLanguageThemes } from '../languages.mjs';

const SCROLLED = '.ab-scrolling';
const SELECTOR = '.docs-article .mx-app-bar';

/** Real-browser checks of the app bar page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'appbar', { waitUntil: 'load' });
    const bar = page.locator('.ab-basic');
    await bar.waitFor();
    check('a header that is a banner or a generic header', (await bar.evaluate(el => el.localName)) === 'header');
    check('the commands are a named toolbar', (await bar.locator('[role="toolbar"]').getAttribute('aria-label')) === 'Actions');

    await bar.locator('.mx-app-bar__navigation').click();
    check('the navigation button reports a press', (await page.locator('.ab-told').textContent()).includes('the menu'));
    await bar.locator('[role="toolbar"] button').first().click();
    check('a command runs', (await page.locator('.ab-told').textContent()).includes('search'));

    for (const language of designLanguages) {
        const result = await page.evaluate(async (language) => {
            document.documentElement.setAttribute('data-design-language', language);
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const bar = document.querySelector('.ab-basic');
            const box = bar.getBoundingClientRect();
            const nav = bar.querySelector('.mx-app-bar__navigation').getBoundingClientRect();
            const tools = bar.querySelector('.mx-toolbar').getBoundingClientRect();
            const row = bar.querySelector('.mx-app-bar__row').getBoundingClientRect();
            const mid = (r) => r.top + r.height / 2;
            const rowMid = mid(row);
            const accent = document.querySelector('.ab-accent');
            const accentTools = accent.querySelector('.mx-toolbar');
            return {
                start: nav.left - box.left,
                end: box.right - tools.right,
                offNav: Math.abs(mid(nav) - rowMid),
                offTools: Math.abs(mid(tools) - rowMid),
                accentFill: getComputedStyle(accentTools).backgroundColor,
                accentButton: getComputedStyle(accent).color === getComputedStyle(accent.querySelector('.mx-toolbar .mx-button')).color,
            };
        }, language);
        check(`${language}: the two ends are the same distance from the edges`, Math.abs(result.start - result.end) <= 0.5, `${result.start} ${result.end}`);
        check(`${language}: the parts are centered on the row`, result.offNav <= 0.5 && result.offTools <= 0.5, `${result.offNav} ${result.offTools}`);
        check(`${language}: the commands have no fill of their own`, /, 0\)$|transparent/.test(result.accentFill), result.accentFill);
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));

    // The title of a centered bar is in the middle of the bar, whatever lies beside it.
    const centered = await page.locator('.ab-center').evaluate(el => {
        const box = el.getBoundingClientRect();
        const title = el.querySelector('.mx-app-bar__titles').getBoundingClientRect();
        return Math.abs(title.left + title.width / 2 - (box.left + box.width / 2));
    });
    check('a centered title is in the middle of the bar', centered <= 1, String(centered));

    // Narrow: the title keeps its room, commands go into the menu, and the bar never widens.
    await bar.evaluate(el => (el.style.inlineSize = '240px'));
    await page.waitForTimeout(300);
    const narrow = await bar.evaluate(el => ({
        more: (() => { const more = el.querySelector('.mx-toolbar__more'); return !!more && !more.hasAttribute('data-idle') && more.offsetWidth > 0; })(),
        wide: el.scrollWidth > el.clientWidth + 1,
        title: el.querySelector('.mx-app-bar__titles').getBoundingClientRect().width,
    }));
    check('commands that do not fit move into the menu', narrow.more, JSON.stringify(narrow));
    check('the title keeps its room', narrow.title >= 90, String(narrow.title));
    check('the bar does not widen', !narrow.wide);
    await bar.evaluate(el => (el.style.inlineSize = ''));

    // Scrolling: `lift` raises the bar, `hide` moves it away and brings it back.
    const box = page.locator('.ab-scroll');
    const scrolling = page.locator('.ab-scrolling');
    await box.scrollIntoViewIfNeeded();
    await box.evaluate(el => (el.scrollTop = 200));
    await page.waitForTimeout(120);
    check('lift: the bar is raised while scrolled', await scrolling.evaluate(el => el.hasAttribute('data-lifted')));
    check('sticky: the bar stays at the top of the box', Math.abs(await box.evaluate(el => el.querySelector('.ab-scrolling').getBoundingClientRect().top - el.getBoundingClientRect().top)) <= 1.5);
    await page.getByRole('radio', { name: 'Hide' }).or(page.getByRole('button', { name: 'Hide', exact: true })).first().click();
    await page.waitForTimeout(120);
    await box.evaluate(el => (el.scrollTop = 500));
    await page.waitForTimeout(350);
    check('hide: scrolling down moves the bar away', await scrolling.evaluate(el => el.hasAttribute('data-hidden')));
    await box.evaluate(el => (el.scrollTop = 400));
    await page.waitForTimeout(120);
    check('hide: scrolling up brings it back', !(await scrolling.evaluate(el => el.hasAttribute('data-hidden'))));

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
        const bar = document.querySelector('.ab-scrolling');
        bar.setAttribute('data-position', 'fixed');
        const layer = getComputedStyle(bar).zIndex;
        bar.setAttribute('data-position', 'sticky');
        return { layer, sticky: getComputedStyle(bar).zIndex };
    });
    check('fixed takes the layer of the page, sticky stays low', Number(fixed.layer) >= 1000 && Number(fixed.sticky) < 100, JSON.stringify(fixed));

    // Right to left: the back arrow points the other way.
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    await page.waitForTimeout(120);
    const scale = await page.locator('.ab-center .mx-app-bar__navigation .mx-glyph').evaluate(el => getComputedStyle(el).scale);
    check('the back arrow is mirrored right to left', scale.startsWith('-1'), scale);
    await page.evaluate(() => document.documentElement.removeAttribute('dir'));

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
