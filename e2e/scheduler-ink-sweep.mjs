// The contrast of an appointment's title and time on its fill, for colours all round the wheel: 24 hues at 5
// lightnesses, 6 greys and the given colours, in the states a box can be in (at rest, under the pointer, open,
// open under the pointer, focused, past), measured on what is painted (8-bit, the fill over what is behind it).

/** 24 hues × 5 lightnesses and 6 greys, as CSS colours. */
export function sweepColours(extra = []) {
  const out = [];
  for (let h = 0; h < 360; h += 15) for (const l of [20, 35, 50, 65, 80]) out.push(`hsl(${h} 80% ${l}%)`);
  for (const g of [0, 20, 40, 60, 80, 100]) out.push(`hsl(0 0% ${g}%)`);
  return [...out, ...extra];
}

const STATES = ['rest', 'focus', 'open', 'past', 'hover', 'open+hover'];

/**
 * Measures one appointment box (found by `selector`) in every colour and state; resolves to the least
 * contrast of its title and of its time, each with the colour and state where it is.
 */
export async function sweepBox(page, selector, colours) {
  const box = page.locator(selector).first();
  await box.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.mouse.move(0, 0);
  const worst = { title: { ratio: Infinity }, time: { ratio: Infinity } };
  for (const state of STATES) {
    if (state.includes('hover')) {
      const r = await box.boundingBox();
      await page.mouse.move(r.x + r.width - 3, r.y + r.height - 3);
    }
    const found = await box.evaluate(
      (el, [colours, state]) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const paint = (...layers) => {
          ctx.clearRect(0, 0, 1, 1);
          for (const c of layers) {
            ctx.fillStyle = c;
            ctx.fillRect(0, 0, 1, 1);
          }
          return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
        };
        const lin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
        // What is behind the box: the page, the scheduler, the cell under it.
        const r = el.getBoundingClientRect();
        el.style.pointerEvents = 'none';
        const cell = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find((n) => n.classList?.contains('mx-scheduler__cell'));
        el.style.pointerEvents = '';
        const behind = [getComputedStyle(document.body).backgroundColor, getComputedStyle(el.closest('.mx-scheduler')).backgroundColor, cell ? getComputedStyle(cell).backgroundColor : 'transparent'];
        const keep = el.getAttribute('style');
        el.toggleAttribute('data-open', state.includes('open'));
        el.toggleAttribute('data-past', state === 'past');
        if (state === 'focus') el.focus();
        const title = el.querySelector('.mx-scheduler__appointment-text');
        const time = el.querySelector('.mx-scheduler__appointment-time');
        const worst = { title: { ratio: Infinity }, time: { ratio: Infinity } };
        for (const colour of colours) {
          el.style.setProperty('--_color', colour);
          const fill = paint(...behind, getComputedStyle(el).backgroundColor);
          for (const [part, node] of [['title', title], ['time', time]]) {
            if (!node || getComputedStyle(node).display === 'none') continue;
            const ink = paint(...behind, getComputedStyle(el).backgroundColor, getComputedStyle(node).color);
            const found = ratio(fill, ink);
            if (found < worst[part].ratio) worst[part] = { ratio: found, colour, state, fill, ink };
          }
        }
        el.setAttribute('style', keep ?? '');
        el.removeAttribute('data-open');
        el.removeAttribute('data-past');
        if (state === 'focus') el.blur();
        return worst;
      },
      [colours, state],
    );
    for (const part of ['title', 'time']) if (found[part].ratio < worst[part].ratio) worst[part] = found[part];
    if (state.includes('hover')) await page.mouse.move(0, 0);
  }
  return worst;
}
