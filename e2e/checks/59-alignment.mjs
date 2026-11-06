/** The buttons, icons and glyphs in a field's box sit in its middle: in every design language, the
 *  gap above each one equals the gap below it (within half a pixel). A stacked pair of steps is one
 *  column: each half leans to its own end. */
import { designLanguages } from '../languages.mjs';

// Every design language the design system ships.
const LANGUAGES = [...designLanguages];
const PAGES = ['textbox', 'numberbox', 'dropdown', 'combobox', 'tagbox', 'datebox', 'lookup'];
// Fields drawn as something else than a one-line box.
const SKIP = ['mx-toggle-field', 'mx-text-area', 'mx-list-box', 'mx-radio-group', 'mx-slider'];

export default async function ({ page, base, check }) {
  const restore = await page.evaluate(() => document.documentElement.dataset.designLanguage);
  for (const path of PAGES) {
    await page.goto(base + path, { waitUntil: 'load' });
    await page.waitForSelector('.docs-main');
    for (const designLanguage of LANGUAGES) {
      const off = await page.evaluate(
        async ([id, skip]) => {
          document.documentElement.dataset.designLanguage = id;
          await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
          const found = [];
          let measured = 0;
          for (const box of document.querySelectorAll('.docs-main .mx-field > .mx-field__box')) {
            const field = box.parentElement;
            if (!box.getClientRects().length || skip.some((name) => field.classList.contains(name))) continue;
            const style = getComputedStyle(box);
            const rect = box.getBoundingClientRect();
            const top = rect.top + parseFloat(style.borderTopWidth);
            const bottom = rect.bottom - parseFloat(style.borderBottomWidth);
            const parts = box.querySelectorAll(
              ":scope > :is(.mx-field__start, .mx-field__tools, .mx-field__end, .mx-field__actions):not([data-layout='stacked']) > :is(.mx-field__button, .mx-glyph), :scope > [data-layout='stacked'], :scope > .mx-field__icon",
            );
            for (const part of parts) {
              const p = part.getBoundingClientRect();
              if (!p.height) continue;
              measured++;
              const above = p.top - top;
              const below = bottom - p.bottom;
              if (Math.abs(above - below) > 0.5) found.push(`${field.className.split(' ')[1]} ${part.className.split(' ').at(-1)}: ${above.toFixed(1)} above, ${below.toFixed(1)} below`);
            }
          }
          return { measured, found };
        },
        [designLanguage, SKIP],
      );
      check(`${designLanguage} /${path}: field buttons and icons are centred (${off.measured} measured)`, off.measured > 0 && off.found.length === 0, off.found.slice(0, 3).join(' | '));
    }
  }
  await page.evaluate((r) => {
    if (r) document.documentElement.dataset.designLanguage = r;
    else delete document.documentElement.dataset.designLanguage;
  }, restore);
}
