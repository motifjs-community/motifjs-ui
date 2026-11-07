import { designLanguages, designLanguageThemes } from '../languages.mjs';

/** Real-browser checks of the chart page: geometry, pointer, keyboard, table, image, right to left, every language. */
export default async function ({ page, base, check, axeSource }) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + 'chart', { waitUntil: 'load' });
    const basic = page.locator('.ch-basic');
    await basic.waitFor();
    await page.waitForTimeout(500);

    // Geometry.
    const bars = await basic.evaluate(el => {
        const svg = el.querySelector('svg').getBoundingClientRect();
        const d = el.querySelector('.mx-chart__bars').getAttribute('d');
        const middles = [...d.matchAll(/M(-?[\d.]+) [\d.]+v-?[\d.]+a([\d.]+) [\d.]+ 0 0 1 [\d.-]+ [\d.-]+h([\d.]+)/g)].map(m => Number(m[1]) + Number(m[2]) + Number(m[3]) / 2);
        const labels = [...el.querySelectorAll('.mx-chart__ticks text')].filter(t => /^[A-Z]/.test(t.textContent)).map(t => {
            const box = t.getBoundingClientRect();
            return box.left + box.width / 2 - svg.left;
        });
        return { middles, labels, zero: el.querySelector('.mx-chart__axis').getAttribute('d') };
    });
    check('every month has a bar', bars.middles.length === 12, String(bars.middles.length));
    const off = bars.labels.map((x, i) => Math.abs(x - bars.middles[i]));
    check('each label sits under the middle of its bar', off.length === 12 && Math.max(...off) <= 0.75, off.map(v => v.toFixed(2)).join(' '));
    const steps = bars.middles.slice(1).map((x, i) => x - bars.middles[i]);
    check('the bars are evenly spaced', Math.max(...steps) - Math.min(...steps) <= 0.25, steps.join(' '));

    // Empty and loading.
    const states = page.locator('.ch-states');
    await states.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await page.waitForTimeout(100);
    check('an empty chart says so', (await states.locator('.mx-chart__message').textContent()).length > 0 && (await states.locator('.mx-chart__message').isVisible()));
    await page.getByRole('button', { name: 'Fill', exact: true }).click();
    await page.waitForTimeout(100);
    check('and fills again', !(await states.locator('.mx-chart__message').isVisible()));
    await page.getByRole('button', { name: 'Load', exact: true }).click();
    await page.waitForTimeout(100);
    const dim = await states.evaluate(el => ({ busy: el.getAttribute('aria-busy'), opacity: getComputedStyle(el.querySelector('.mx-chart__marks')).opacity }));
    check('while loading the marks stay, dimmed', dim.busy === 'true' && Number(dim.opacity) < 1, JSON.stringify(dim));
    await page.getByRole('button', { name: 'Load', exact: true }).click();

    // An image.
    await page.getByRole('button', { name: 'Create the image', exact: true }).click();
    const image = page.locator('.ch-image');
    await image.waitFor();
    const facts = await image.evaluate(async el => {
        await el.decode();
        const canvas = document.createElement('canvas');
        canvas.width = el.naturalWidth;
        canvas.height = el.naturalHeight;
        const context = canvas.getContext('2d');
        context.drawImage(el, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = new Set();
        for (let i = 0; i < pixels.length; i += 4 * 97) colors.add(`${pixels[i] >> 4},${pixels[i + 1] >> 4},${pixels[i + 2] >> 4}`);
        return { width: el.naturalWidth, height: el.naturalHeight, colors: colors.size, src: el.src.slice(0, 22) };
    });
    check('a PNG twice the size, in color', facts.src === 'data:image/png;base64,' && facts.width > 900 && facts.colors > 4, JSON.stringify(facts));

    // Right to left.
    const mirrored = await basic.evaluate(async el => {
        el.setAttribute('dir', 'rtl');
        el.querySelector('.mx-chart__plot').style.paddingRight = '1px';
        await new Promise(resolve => setTimeout(resolve, 150));
        el.querySelector('.mx-chart__plot').style.paddingRight = '';
        return el;
    }).then(() => basic.evaluate(async el => {
        await new Promise(resolve => setTimeout(resolve, 150));
        const texts = [...el.querySelectorAll('.mx-chart__ticks text')];
        const place = name => texts.find(t => t.textContent === name)?.getBoundingClientRect().left;
        return { jan: place('Jan'), dec: place('Dec') };
    }));
    await basic.evaluate(el => el.removeAttribute('dir'));
    check('right to left runs the other way', mirrored.jan === undefined || mirrored.dec === undefined || mirrored.jan > mirrored.dec, JSON.stringify(mirrored));

    // Every language and theme.
    await page.addScriptTag({ content: axeSource });
    for (const language of designLanguages) {
        for (const theme of designLanguageThemes[language].themes) {
            const seen = await page.evaluate(async ({ language, theme }) => {
                document.documentElement.setAttribute('data-design-language', language);
                document.documentElement.setAttribute('data-theme', theme);
                await new Promise(resolve => setTimeout(resolve, 200));
                const el = document.querySelector('.ch-basic');
                const css = getComputedStyle(el);
                const series = [1, 2, 3, 4, 5, 6, 7, 8].map(i => css.getPropertyValue(`--_chart-series-${i}`).trim());
                const bar = document.querySelector('.ch-basic .mx-chart__bars');
                const probe = document.createElement('span');
                document.querySelector('.ch-basic').append(probe);
                probe.style.color = 'var(--_chart-series-1)';
                const first = getComputedStyle(probe).color;
                probe.remove();
                return { series: series.filter(Boolean).length, fill: getComputedStyle(bar).fill, first, line: css.getPropertyValue('--_chart-line-width').trim() };
            }, { language, theme });
            check(`${language} ${theme}: its own eight colors reach the marks`, seen.series === 8 && seen.fill === seen.first && parseFloat(seen.line) >= 1, JSON.stringify(seen));
            const issues = await page.evaluate(async () => (await window.axe.run('.docs-article', { rules: { 'color-contrast': { enabled: true } } })).violations.map(v => `${v.id}: ${v.nodes.length} ${v.nodes[0]?.target}`));
            check(`${language} ${theme}: axe clean`, issues.length === 0, issues.join(', '));
        }
    }
    await page.evaluate(() => {
        document.documentElement.removeAttribute('data-design-language');
        document.documentElement.removeAttribute('data-theme');
    });
    // On every page of the category: no text leaves its chart, no label covers another, the plot follows its width.
    const PAGES = ['chart', 'chart/lines', 'chart/bars', 'chart/scatter', 'chart/pie', 'chart/funnel', 'chart/radar', 'chart/heatmap', 'chart/ranges', 'chart/candles', 'chart/waterfall', 'chart/zoom', 'chart/live', 'chart/references'];
    const outside = [];
    const covered = [];
    const wide = [];
    for (const path of PAGES) {
        await page.goto(base + path, { waitUntil: 'load' });
        await page.locator('.mx-chart').first().waitFor();
        await page.waitForTimeout(300);
        const seen = await page.evaluate(() => {
            const charts = [...document.querySelectorAll('.mx-chart')];
            const clipped = charts.flatMap(chart => {
                const box = chart.getBoundingClientRect();
                return [...chart.querySelectorAll('.mx-chart__ticks text, .mx-chart__labels text, .mx-chart__axis-title text')]
                    .map(t => t.getBoundingClientRect())
                    .filter(r => r.left < box.left - 0.5 || r.right > box.right + 0.5 || r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5);
            }).length;
            const crowded = charts.filter(chart => {
                const boxes = [...chart.querySelectorAll('.mx-chart__ticks text')].map(t => t.getBoundingClientRect());
                return boxes.some((a, i) => boxes.slice(i + 1).some(b => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom));
            }).length;
            return { clipped, crowded };
        });
        if (seen.clipped) outside.push(`${path}: ${seen.clipped}`);
        if (seen.crowded) covered.push(`${path}: ${seen.crowded}`);
        await page.setViewportSize({ width: 360, height: 800 });
        await page.waitForTimeout(300);
        const gaps = await page.evaluate(() => [...document.querySelectorAll('.mx-chart')].map(c => {
            // A chart has a plot for each family it drew; the one in view is the one that counts.
            const svg = [...c.querySelectorAll('svg.mx-chart__svg')].find(s => s.style.display !== 'none');
            return Math.abs(Number(svg.getAttribute('width')) - c.querySelector('.mx-chart__plot').clientWidth);
        }));
        if (gaps.some(gap => gap > 1) || !(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))) wide.push(`${path}: ${gaps.join(' ')}`);
        await page.setViewportSize({ width: 1280, height: 900 });
    }
    check('no text leaves its chart, on any page', !outside.length, outside.join(', '));
    check('labels never cover each other, on any page', !covered.length, covered.join(', '));
    check('the plot follows its width on a phone, with no sideways scroll, on any page', !wide.length, wide.join(', '));

    await page.goto(base + 'chart/lines', { waitUntil: 'load' });
    await page.locator('.ch-lines').waitFor();
    await page.waitForTimeout(300);
    const lined = await page.locator('.ch-lines').evaluate(el => {
        const title = el.querySelector('.mx-chart__title').getBoundingClientRect();
        const key = el.querySelector('.mx-chart__legend-key').getBoundingClientRect();
        return { title: title.left, key: key.left, scroll: el.scrollHeight - el.clientHeight };
    });
    check('the legend lines up with the title', Math.abs(lined.title - lined.key) <= 0.5, JSON.stringify(lined));
    check('nothing scrolls inside a chart', lined.scroll <= 0, JSON.stringify(lined));

    // The pointer.
    const lines = page.locator('.ch-lines');
    await lines.scrollIntoViewIfNeeded();
    const box = await lines.locator('.mx-chart__plot').boundingBox();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.waitForTimeout(80);
    const tip = lines.locator('.mx-chart__tooltip');
    check('a tooltip follows the pointer', await tip.isVisible());
    check('and lists every series', (await lines.locator('.mx-chart__tooltip-row').count()) === 2);
    const cross = await lines.locator('.mx-chart__crosshair').getAttribute('d');
    check('the crosshair finds a position', !!cross && cross.includes('v'));
    await page.mouse.move(box.x + box.width - 2, box.y + 30);
    await page.waitForTimeout(80);
    const inside = await lines.evaluate(el => {
        const plot = el.querySelector('.mx-chart__plot').getBoundingClientRect();
        const tooltip = el.querySelector('.mx-chart__tooltip').getBoundingClientRect();
        return tooltip.left >= plot.left - 0.5 && tooltip.right <= plot.right + 0.5 && tooltip.top >= plot.top - 0.5 && tooltip.bottom <= plot.bottom + 0.5;
    });
    check('the tooltip stays inside at the far corner', inside);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(80);
    check('and goes when the pointer leaves', !(await tip.isVisible()));

    // A finger: the value stays after it lifts.
    const touched = await lines.evaluate(async el => {
        const plot = el.querySelector('.mx-chart__plot');
        const r = plot.getBoundingClientRect();
        const at = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerType: 'touch', bubbles: true };
        plot.dispatchEvent(new PointerEvent('pointerdown', at));
        plot.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'touch' }));
        await new Promise(resolve => setTimeout(resolve, 40));
        const shown = !el.querySelector('.mx-chart__tooltip').hidden;
        plot.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
        return shown;
    });
    check('a tap keeps the tooltip after the finger lifts', touched);

    // The keyboard.
    const plot = lines.locator('.mx-chart__plot');
    await page.locator('.ch-lines .mx-chart__tools button').last().focus();
    await page.keyboard.press('Tab');
    const ring = await plot.evaluate(el => {
        const style = getComputedStyle(el);
        return { active: document.activeElement === el, outline: style.outlineStyle, shadow: style.boxShadow };
    });
    check('Tab reaches the plot', ring.active, JSON.stringify(ring));
    check('with a ring around it', ring.outline !== 'none' || ring.shadow !== 'none', JSON.stringify(ring));
    check('and the first value is shown', await tip.isVisible());
    const status = lines.locator('[role="status"]');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const said = await status.textContent();
    check('the arrows are spoken', said.includes('Mar'), said);
    await page.keyboard.press('ArrowUp');
    check('up moves to the next series', (await status.textContent()).includes('Stores'), await status.textContent());
    await page.keyboard.press('End');
    check('End goes to the last position', (await status.textContent()).includes('Dec'), await status.textContent());
    await page.keyboard.press('Escape');
    check('Escape clears it', !(await tip.isVisible()));

    // Legend and colors.
    const colorOf = (series) => lines.evaluate((el, i) => getComputedStyle(el.querySelectorAll('.mx-chart__series')[i].querySelector('.mx-chart__line')).stroke, series);
    const before = await colorOf(1);
    await lines.getByRole('button', { name: 'Online', exact: true }).click();
    await page.waitForTimeout(80);
    check('the legend hides a series', await lines.evaluate(el => el.querySelectorAll('.mx-chart__series')[0].style.display === 'none'));
    check('and the other keeps its color', (await colorOf(1)) === before);
    const hiddenItem = await lines.evaluate(el => {
        const item = el.querySelector('.mx-chart__legend-item');
        return { off: item.hasAttribute('data-off'), key: getComputedStyle(item.querySelector('.mx-chart__legend-key')).backgroundColor, name: getComputedStyle(item.querySelector('.mx-chart__legend-name')).textDecorationLine };
    });
    check('a hidden series reads as hidden without its color', hiddenItem.off && hiddenItem.key === 'rgba(0, 0, 0, 0)' && hiddenItem.name === 'line-through', JSON.stringify(hiddenItem));
    await lines.getByRole('button', { name: 'Online', exact: true }).click();
    await page.waitForTimeout(80);

    const legendItem = lines.getByRole('button', { name: 'Stores', exact: true });
    const colorBefore = await legendItem.evaluate(el => getComputedStyle(el).color);
    await legendItem.hover();
    await page.waitForTimeout(60);
    check('a legend item answers the pointer', (await legendItem.evaluate(el => getComputedStyle(el).color)) !== colorBefore);
    await page.mouse.move(0, 0);

    // The table: the kit's grid, with every value and only the rows in view drawn.
    const toTable = lines.locator('.mx-chart__tools button').last();
    await toTable.click();
    await page.waitForTimeout(150);
    const grid = lines.locator('.mx-data-grid [role="grid"]');
    check('the button shows a table', await grid.isVisible());
    check('of every value', (await grid.getAttribute('aria-rowcount')) === '13', await grid.getAttribute('aria-rowcount'));
    const firstRow = lines.locator('.mx-data-grid [role="row"]').filter({ hasText: /\d/ }).first();
    check('in the order of the rows', (await firstRow.textContent()).includes('Jan'), await firstRow.textContent());
    check('with the plot gone', !(await lines.locator('.mx-chart__plot').isVisible()));
    await toTable.click();
    await page.waitForTimeout(150);
    check('and back to the chart, drawn', (await lines.locator('.mx-chart__line').first().getAttribute('d')).length > 20);

    await page.goto(base + 'chart/bars', { waitUntil: 'load' });
    await page.locator('.ch-stacked').waitFor();
    await page.waitForTimeout(300);
    // Stacking.
    await page.getByRole('radio', { name: 'Percent', exact: true }).or(page.getByRole('button', { name: 'Percent', exact: true })).first().click();
    await page.waitForTimeout(120);
    const shares = await page.locator('.ch-stacked').evaluate(el => [...el.querySelectorAll('.mx-chart__ticks text')].map(t => t.textContent));
    check('percent stacking reads as shares', shares.some(t => t.includes('100')) && shares.some(t => t.includes('%')), shares.join(' '));

    await page.goto(base + 'chart/live', { waitUntil: 'load' });
    await page.locator('.ch-live').waitFor();
    await page.waitForTimeout(300);
    // Growing with reactive data.
    const live = page.locator('.ch-live');
    await live.scrollIntoViewIfNeeded();
    const pathBefore = await live.locator('.mx-chart__line').getAttribute('d');
    await page.getByRole('button', { name: 'Add a value', exact: true }).click();
    await page.waitForTimeout(100);
    check('a new value is drawn', (await live.locator('.mx-chart__line').getAttribute('d')) !== pathBefore);

}
