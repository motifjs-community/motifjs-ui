import { designLanguages, designLanguageThemes } from '../languages.mjs';

/** Texts of every gauge on the page: none covers another, none leaves its gauge's room in the page. */
function crowding(selector) {
    const out = [];
    for (const el of document.querySelectorAll(selector)) {
        const host = el.getBoundingClientRect();
        const texts = [...el.querySelectorAll('.mx-gauge__scale text, .mx-bar-gauge__labels text, .mx-gauge__value:not([hidden]), .mx-gauge__label:not([hidden]), .mx-gauge__callout text, .mx-gauge__mark text')]
            .map(t => ({ t: t.textContent, r: t.getBoundingClientRect() }))
            .filter(x => x.t && x.r.width);
        for (let i = 0; i < texts.length; i++) {
            const a = texts[i].r;
            if (a.left < host.left - 1 || a.right > host.right + 1 || a.top < host.top - 1 || a.bottom > host.bottom + 1) out.push(`${el.className}: "${texts[i].t}" leaves its gauge`);
            for (let j = i + 1; j < texts.length; j++) {
                const b = texts[j].r;
                const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
                const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
                if (w > 1 && h > 1) out.push(`${el.className}: "${texts[i].t}" covers "${texts[j].t}"`);
            }
        }
    }
    return out;
}

const GAUGE_PAGES = ['gauge', 'gauge/circular', 'gauge/linear', 'gauge/scales', 'gauge/ranges', 'gauge/markers', 'gauge/marks', 'gauge/base-value', 'gauge/dashboards'];
const BAR_PAGES = ['bar-gauge', 'bar-gauge/labels', 'bar-gauge/data', 'bar-gauge/angles'];

/** Real-browser checks of the gauge family, page by page: scales, ranges, markers, marks, upright gauges, bar gauges; every language. */
export default async function ({ page, base, check, axeSource }) {
    const open = async path => {
        await page.goto(base + path, { waitUntil: 'load' });
        await page.locator('.mx-gauge, .mx-bar-gauge').first().waitFor();
        await page.waitForTimeout(500);
    };

    // On every page, at desktop and phone width: no text covers another or leaves its gauge.
    for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 });
        for (const path of [...GAUGE_PAGES, ...BAR_PAGES]) {
            await open(path);
            const crowded = await page.evaluate(crowding, '.mx-gauge, .mx-bar-gauge');
            check(`${path} at ${width}px: no text covers another or leaves its gauge`, crowded.length === 0, crowded.slice(0, 6).join('; '));
        }
    }
    await page.setViewportSize({ width: 1280, height: 900 });

    await open('gauge/circular');
    const plain = await page.locator('.ga-arc .mx-gauge__track').evaluate(el => Math.round(el.getBoundingClientRect().width));
    const quarter = await page.locator('.ga-quarter').evaluate(el => {
        const box = el.querySelector('svg').getBoundingClientRect();
        return { wide: Math.round(box.width), high: Math.round(box.height) };
    });
    check('a quarter takes the room of a quarter', quarter.wide < 130 && quarter.high < 130, JSON.stringify(quarter));

    await open('gauge/scales');
    const minor = await page.locator('.ga-minor').evaluate(el => ({
        labels: el.querySelectorAll('.mx-gauge__scale text').length,
        minor: (el.querySelector('.mx-gauge__minor').getAttribute('d') ?? '').match(/M/g)?.length ?? 0,
        track: Math.round(el.querySelector('.mx-gauge__track').getBoundingClientRect().width)
    }));
    check('ticks every 100 with three small ones between', minor.labels === 11 && minor.minor === 30, JSON.stringify(minor));
    check('ticks do not shrink the arc', Math.abs(plain - minor.track) <= 2, `${plain} and ${minor.track}`);
    // The arc starts at its lower left end and ends at its lower right one.
    const down = await page.locator('.ga-down').evaluate(el => {
        const track = el.querySelector('.mx-gauge__track').getBoundingClientRect();
        const middle = track.left + track.width / 2;
        const place = name => {
            const r = [...el.querySelectorAll('.mx-gauge__scale text')].find(t => t.textContent === name).getBoundingClientRect();
            return { left: r.right < middle, low: r.top > track.top + track.height / 2 };
        };
        return { start: place('100'), end: place('0') };
    });
    check('a scale from 100 to 0 starts with 100', down.start.left && down.start.low && !down.end.left && down.end.low, JSON.stringify(down));
    const degrees = await page.locator('.ga-degrees').evaluate(el => [...el.querySelectorAll('.mx-gauge__scale text')].map(t => t.textContent).join());
    check('a format function writes the scale', degrees === '-45°,0°,45°', degrees);

    await open('gauge/ranges');
    const read = page.locator('.ga-read-out');
    await read.scrollIntoViewIfNeeded();
    await page.getByRole('slider', { name: 'Noise' }).focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    check('the range is read with the value', (await read.textContent()) === 'Read as: 120 dB, harmful', await read.textContent());
    const plainColors = await page.locator('.ga-chart-colors').evaluate(el => [...el.querySelectorAll('.mx-gauge__band')].map(b => getComputedStyle(b).fill));
    check('ranges without a tone take three different chart colors', new Set(plainColors).size === 3, plainColors.join(' '));

    await open('gauge/markers');
    const markers = await page.locator('.ga-bar-marker').evaluateAll(els => els.map(el => {
        const track = el.querySelector('.mx-gauge__track').getBoundingClientRect();
        const marker = [el.querySelector('.mx-gauge__marker'), el.querySelector('.mx-gauge__callout path')].find(p => p.getAttribute('d'));
        const box = marker.getBoundingClientRect();
        const value = Number(el.getAttribute('aria-valuenow'));
        return Math.abs(((box.left + box.width / 2 - track.left) / track.width) * 100 - value);
    }));
    check('each marker on a bar sits on its value', markers.length === 5 && markers.every(d => d <= 1.5), markers.map(d => d.toFixed(1)).join(', '));
    const tips = await page.locator('.ga-marker').evaluateAll(els => els.map(el => !!el.querySelector('.mx-gauge__needle-tip').getAttribute('d')));
    check('only the two-tone needle has a tip of its own', tips.join() === 'false,false,true', tips.join());

    await open('gauge/marks');
    const marks = page.locator('.ga-bar-marks');
    await marks.scrollIntoViewIfNeeded();
    const mark = await marks.locator('.mx-gauge__mark path').last().boundingBox();
    await page.mouse.move(mark.x + mark.width / 2, mark.y + mark.height + 6);
    await page.waitForTimeout(80);
    const tip = await marks.locator('.mx-gauge__tip').evaluate(el => (el.hidden ? '' : el.textContent));
    check('a mark shows its name under the pointer', tip === 'Highest: 25', tip);
    await page.mouse.move(0, 0);
    const text = await page.locator('.ga-marks').getAttribute('aria-valuetext');
    check('marks are read with the value', text.includes('Lowest expected: 40') && text.includes('Highest expected: 90'), text);
    const moving = page.locator('.ga-moving-marks');
    await moving.scrollIntoViewIfNeeded();
    const before = await moving.locator('.mx-gauge__mark path').first().getAttribute('d');
    const target = page.getByRole('spinbutton', { name: 'Target' });
    await target.fill('30');
    await target.press('Enter');
    await page.waitForTimeout(300);
    const movedText = await moving.getAttribute('aria-valuetext');
    check('a mark moves when its value changes', (await moving.locator('.mx-gauge__mark path').first().getAttribute('d')) !== before && movedText.includes('Target: 30'), movedText);

    await open('gauge/base-value');
    const balance = await page.locator('.ga-balance .mx-gauge').evaluateAll(els => els.map(el => {
        const track = el.querySelector('.mx-gauge__track').getBoundingClientRect();
        const fill = el.querySelector('.mx-gauge__fill').getBoundingClientRect();
        const middle = track.left + track.width / 2;
        return fill.right <= middle + 1 ? 'left' : fill.left >= middle - 1 ? 'right' : 'both';
    }));
    check('a loss fills left of 0 and a profit right of it', balance.join() === 'right,left,right,left', balance.join());
    // An upright gauge keeps its place while its value changes width ("0°", "-10°"): nothing beside it shakes.
    const upright = page.locator('.ga-base-bar .mx-gauge__track');
    const placeOf = () => upright.evaluate(el => Math.round(el.getBoundingClientRect().left * 10) / 10);
    const deviation = page.getByRole('slider', { name: 'Deviation' });
    await deviation.scrollIntoViewIfNeeded();
    const places = new Set([await placeOf()]);
    await deviation.focus();
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(220);
        places.add(await placeOf());
    }
    check('an upright gauge stays in place while its value changes', places.size === 1, [...places].join(', '));

    await open('gauge/dashboards');
    // Quarters with the same scale line up, whichever way they are turned: their middles share one line.
    const lines = await page.locator('.ga-dash-quarter .mx-gauge__track').evaluateAll(els => els.map(el => el.getBoundingClientRect()));
    const apart = [Math.abs(lines[0].right - lines[1].right), Math.abs(lines[2].left - lines[3].left)];
    check('quarter gauges turned different ways line up', apart.every(d => d <= 0.5), apart.map(d => d.toFixed(1)).join(', '));
    const weather = page.locator('.ga-weather').first();
    await weather.scrollIntoViewIfNeeded();
    const earlier = await weather.locator('.mx-gauge__fill').getAttribute('d');
    await page.getByRole('combobox', { name: 'City' }).click();
    await page.getByRole('option', { name: 'Oslo' }).click();
    await page.waitForTimeout(500);
    const after = await page.locator('.ga-weather').evaluateAll(els => els.map(el => el.getAttribute('aria-valuenow')));
    const fill = await weather.evaluate(el => {
        const track = el.querySelector('.mx-gauge__track').getBoundingClientRect();
        const fill = el.querySelector('.mx-gauge__fill').getBoundingClientRect();
        return { top: Math.round(fill.top - track.top), middle: Math.round(track.height / 2) };
    });
    check('a new city moves all three; below 0 the fill goes down from the middle', after.join() === '-6,81,994' && (await weather.locator('.mx-gauge__fill').getAttribute('d')) !== earlier && Math.abs(fill.top - fill.middle) <= 7, `${after}, ${JSON.stringify(fill)}`);
    const speed = page.getByRole('slider', { name: 'Speed' });
    await speed.scrollIntoViewIfNeeded();
    await speed.focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    const dash = await page.evaluate(() => ({
        speed: document.querySelector('.ga-speed').getAttribute('aria-valuenow'),
        quarters: [...document.querySelectorAll('.ga-dash-quarter')].map(el => el.getAttribute('aria-valuenow')).join(),
        fuel: document.querySelector('.ga-fuel').getAttribute('aria-valuenow')
    }));
    check('one slider drives the speedometer, the quarters and the fuel bar', dash.speed === '200' && dash.quarters === '100,0,100,0' && dash.fuel === '10', JSON.stringify(dash));
    // A stylesheet that arrives after the gauges drew (a late sheet, a language loaded on demand): they draw again with it.
    const thickness = () => page.locator('.ga-speed .mx-gauge__track').evaluate(el => {
        const radii = [...el.getAttribute('d').matchAll(/A([\d.]+) /g)].map(m => Number(m[1]));
        return Math.round((Math.max(...radii) - Math.min(...radii)) * 10) / 10;
    });
    await page.evaluate(() => {
        const sheet = document.createElement('style');
        sheet.id = 'late-sheet';
        sheet.textContent = '.mx-gauge { --_gauge-thickness: 20px !important; }';
        document.head.append(sheet);
    });
    await page.waitForTimeout(300);
    const late = await thickness();
    await page.evaluate(() => document.getElementById('late-sheet').remove());
    await page.waitForTimeout(300);
    const back = await thickness();
    const token = await page.locator('.ga-speed').evaluate(el => parseFloat(getComputedStyle(el).getPropertyValue('--_gauge-thickness')));
    check('a stylesheet that changes the thickness after drawing is followed at once', late === 20 && back === token, `${late}px, then ${back}px for a ${token}px token`);
    // Around half a turn the fill keeps the thickness of the track at every value: it never swells past its outer edge.
    const swells = [];
    await speed.focus();
    await page.keyboard.press('Home');
    for (let v = 0; v <= 150; v++) {
        await page.keyboard.press('ArrowRight');
        if (v < 120 || v % 2) continue;
        await page.waitForTimeout(30);
        const edge = await page.locator('.ga-speed').evaluate(el => {
            const fill = el.querySelector('.mx-gauge__fill').getBBox();
            const track = el.querySelector('.mx-gauge__track').getBBox();
            return Math.round((track.x - fill.x) * 100) / 100;
        });
        // Ends are written to a tenth of a pixel: what is left of that rounding is not a swelling.
        if (Math.abs(edge) > 0.2) swells.push(`${v + 1}: ${edge}px`);
    }
    check('the fill keeps the thickness of the track around half a turn', swells.length === 0, swells.join(', '));
    const liveValues = () => page.locator('.ga-live').locator('xpath=../..').locator('.mx-gauge').evaluateAll(els => els.map(el => el.getAttribute('aria-valuenow')).join());
    const firstValues = await liveValues();
    await page.waitForTimeout(2300);
    const laterValues = await liveValues();
    check('live values arrive every second', laterValues !== firstValues, `${firstValues} → ${laterValues}`);

    // Bar gauges.
    await open('bar-gauge');
    const ends = await page.locator('.bg-basic').evaluate(el => ({
        bars: el.querySelectorAll('.mx-bar-gauge__bar').length,
        labels: el.querySelectorAll('.mx-bar-gauge__labels text').length,
        name: el.getAttribute('aria-label')
    }));
    check('a bar for each value, its value written, all read as one name', ends.bars === 4 && ends.labels === 4 && ends.name.includes('84.6%'), JSON.stringify(ends));

    await open('bar-gauge/labels');
    const legend = page.locator('.bg-legend');
    await legend.scrollIntoViewIfNeeded();
    const second = await legend.locator('.mx-bar-gauge__bar').nth(1).boundingBox();
    await page.mouse.move(second.x + 6, second.y + second.height / 2);
    await page.waitForTimeout(80);
    const barTip = await legend.locator('.mx-bar-gauge__tip').evaluate(el => (el.hidden ? '' : el.textContent));
    check('the bar under the pointer shows its name and value', /^Rider \d: /.test(barTip), barTip);
    await page.mouse.move(0, 0);
    const points = await page.locator('.bg-points .mx-bar-gauge__labels text').allTextContents();
    check('a format function writes the values', points.sort().join() === '38 pts,52 pts,71 pts', points.join());

    await open('bar-gauge/data');
    const rows = await page.locator('.bg-rows .mx-bar-gauge__entry').allTextContents();
    check('a field function works the value out', rows.join() === 'Design: 75%,Web: 86%,Mobile: 40%', rows.join());
    const changing = page.locator('.bg-changing');
    await changing.scrollIntoViewIfNeeded();
    const colors = () => changing.locator('.mx-bar-gauge__bar').evaluateAll(els => els.map(el => getComputedStyle(el).fill));
    const all = await colors();
    await page.getByRole('checkbox', { name: 'Shovels' }).click();
    await page.waitForTimeout(500);
    const fewer = await colors();
    check('a bar goes with its row, and the others keep their colors', all.length === 6 && fewer.length === 5 && fewer[0] === all[0] && fewer[1] === all[2], `${all.length} → ${fewer.length}`);
    await page.getByRole('checkbox', { name: 'Shovels' }).click();
    await page.waitForTimeout(500);
    check('it comes back when chosen again', (await colors()).length === 6);

    // A legend whose values change every second keeps its entries in place.
    const live = page.locator('.bg-live .mx-bar-gauge__entry');
    await live.first().scrollIntoViewIfNeeded();
    const entries = () => live.evaluateAll(els => els.map(el => Math.round(el.getBoundingClientRect().left)).join());
    const firstPlaces = await entries();
    const placesSeen = new Set([firstPlaces]);
    for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(500);
        placesSeen.add(await entries());
    }
    check('legend entries stay in place while live values change', placesSeen.size === 1, [...placesSeen].join(' | '));

    await open('bar-gauge/angles');
    const many = await page.locator('.bg-many').evaluate(el => {
        const rings = [...el.querySelectorAll('.mx-bar-gauge__track')].map(t => t.getBoundingClientRect().width);
        return { count: rings.length, inner: Math.round(rings.at(-1)) };
    });
    check('eight bars grow thinner and leave the middle open', many.count === 8 && many.inner >= 50, JSON.stringify(many));

    // Every language and theme on the pages with the most parts: the texts still fit, and axe is clean.
    for (const path of ['gauge/markers', 'gauge/marks', 'gauge/ranges', 'bar-gauge/labels']) {
        await open(path);
        await page.addScriptTag({ content: axeSource });
        for (const language of designLanguages) {
            for (const theme of designLanguageThemes[language].themes) {
                const found = await page.evaluate(async ({ language, theme, source }) => {
                    document.documentElement.setAttribute('data-design-language', language);
                    document.documentElement.setAttribute('data-theme', theme);
                    // The language's font loads and the gauges draw again with it; colors finish their change.
                    await new Promise(resolve => setTimeout(resolve, 50));
                    await document.fonts.ready;
                    await new Promise(resolve => setTimeout(resolve, 400));
                    const crowd = new Function(`return (${source})`)()('.mx-gauge, .mx-bar-gauge');
                    // The track shows against the page: the scale must be seen, whatever the language and theme.
                    const rgb = c => {
                        const n = c.match(/[\d.]+/g).map(Number);
                        return c.startsWith('color(') ? [n[0] * 255, n[1] * 255, n[2] * 255, n[3] ?? 1] : [n[0], n[1], n[2], n[3] ?? 1];
                    };
                    const lum = c => c.slice(0, 3).map(v => v / 255).map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((t, v, i) => t + v * [0.2126, 0.7152, 0.0722][i], 0);
                    const page = rgb(getComputedStyle(document.body).backgroundColor);
                    const tracks = [...document.querySelectorAll('.mx-gauge__track, .mx-bar-gauge__track')].slice(0, 1).map(t => {
                        const c = rgb(getComputedStyle(t).color);
                        const seen = [0, 1, 2].map(i => c[i] * c[3] + page[i] * (1 - c[3]));
                        const [a, b] = [lum(seen), lum(page)].sort((x, y) => y - x);
                        return (a + 0.05) / (b + 0.05);
                    });
                    const faint = tracks.filter(ratio => ratio < 1.8).map(ratio => `track ${ratio.toFixed(2)}:1`);
                    const issues = (await window.axe.run('.docs-article', { rules: { 'color-contrast': { enabled: true } } })).violations.map(v => `${v.id}: ${v.nodes.length} ${v.nodes[0]?.target}`);
                    return { crowd: [...crowd, ...faint], issues };
                }, { language, theme, source: crowding.toString() });
                check(`${path} ${language} ${theme}: texts fit, the track shows and axe is clean`, found.crowd.length === 0 && found.issues.length === 0, [...found.crowd.slice(0, 3), ...found.issues].join('; '));
            }
        }
        await page.evaluate(() => {
            document.documentElement.removeAttribute('data-design-language');
            document.documentElement.removeAttribute('data-theme');
        });
    }
}
