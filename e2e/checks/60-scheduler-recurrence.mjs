import { designLanguages, designLanguageThemes } from '../languages.mjs';

/** Real-browser checks of the Scheduler's recurrence page: series and their marks, the series question by mouse and by keys, the recurrence editor, time zones over a change of summer time, right to left, axe. */
export default async function ({ page, base, check, axeSource, box }) {
  // A fixed day: Thursday 29 October 2026, so the next three days run over New York's change of clocks (1 November).
  // The clock still runs from there (a drag tells its end from a click by the time).
  await page.clock.install({ time: new Date('2026-10-29T10:00:00Z') });
  await page.clock.resume();
  await page.goto(base + 'scheduler/recurrence', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const section = (id) => page.locator(`section[aria-labelledby="${id}"]`);
  const axe = async (label, scope) => {
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await page.waitForTimeout(120);
      await page.addScriptTag({ content: axeSource });
      const violations = await scope.evaluate(async (el) =>
        (await window.axe.run(el)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`),
      );
      check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  };

  // Series, their marks and the tooltip.
  const recurring = section('recurring').locator('.mx-scheduler');
  await recurring.locator('.mx-scheduler__appointment').first().waitFor();
  await recurring.scrollIntoViewIfNeeded();
  await recurring.locator('.mx-scheduler__scroll').evaluate((el) => (el.scrollTop = 0));
  const shown = await recurring.evaluate((el) => {
    const boxes = [...el.querySelectorAll('.mx-scheduler__appointment')];
    const standups = boxes.filter((b) => b.textContent.includes('Team standup'));
    return {
      series: boxes.filter((b) => b.hasAttribute('data-series')).length,
      exceptions: boxes.filter((b) => b.hasAttribute('data-exception')).length,
      standupDays: standups.map((b) => b.style.getPropertyValue('--_column')).sort(),
      named: standups[0]?.textContent ?? '',
    };
  });
  check(
    'a series shows its occurrences (a day left out, one moved apart) and names how it repeats',
    shown.series > 3 && shown.exceptions === 1 && shown.standupDays.length === 4 && /Repeats: Every week on/.test(shown.named),
    JSON.stringify(shown),
  );
  const marks = [];
  for (const designLanguage of designLanguages) {
    await page.evaluate((i) => (document.documentElement.dataset.designLanguage = i), designLanguage);
    await page.waitForTimeout(150);
    marks.push(
      await recurring.evaluate((el, i) => {
        // A box that is not of a series keeps its mark hidden.
        const found = [...el.querySelectorAll('.mx-scheduler__mark:not([hidden])')];
        const drawn = found.filter((m) => getComputedStyle(m).display !== 'none' && m.getBoundingClientRect().width > 0);
        // Drawn ones: a glyph, centred on the first line of the box's text.
        const off = drawn.map((m) => {
          const text = m.closest('.mx-scheduler__appointment').querySelector('.mx-scheduler__appointment-content > :not([hidden])');
          const r = m.getBoundingClientRect();
          return Math.abs(r.top + r.height / 2 - (text.getBoundingClientRect().top + parseFloat(getComputedStyle(text).lineHeight) / 2));
        });
        const glyph = drawn.every((m) => getComputedStyle(m).getPropertyValue('--_icon').includes('url('));
        return { i, found: found.length, drawn: drawn.length, off: Math.max(0, ...off), glyph };
      }, designLanguage),
    );
  }
  await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));
  check(
    'every language either draws the marks (a glyph on the first line of the text) or leaves them out',
    marks.every((m) => m.found > 0 && (m.drawn === 0 || (m.drawn === m.found && m.glyph && m.off <= 0.5))),
    JSON.stringify(marks),
  );
  await recurring.locator('.mx-scheduler__appointment[data-series]', { hasText: 'Design review' }).first().click();
  const tip = page.locator('.mx-scheduler__tooltip-popup:popover-open');
  await tip.waitFor();
  check('the tooltip says how it repeats', /Repeats: Every 2 weeks on Thursday/.test(await tip.textContent()), await tip.textContent());
  check('…and its box is open, under the pointer', (await recurring.locator('.mx-scheduler__appointment[data-open]').count()) === 1);
  // The box open and under the pointer: its text must stand out on its deeper fill.
  await axe('series, their marks and an open box', section('recurring'));
  await axe('the tooltip', tip);
  const low = [];
  for (const designLanguage of designLanguages) {
    for (const theme of designLanguageThemes[designLanguage].themes) {
      await page.evaluate(([i, t]) => {
        document.documentElement.dataset.designLanguage = i;
        document.documentElement.dataset.theme = t;
      }, [designLanguage, theme]);
      await page.waitForTimeout(100);
      const found = await recurring.evaluate(async (el) => (await window.axe.run(el, { runOnly: ['color-contrast'] })).violations.flatMap((v) => v.nodes.map((n) => n.target.join(' '))));
      if (found.length) low.push(`${designLanguage} ${theme}: ${found.slice(0, 2).join(' | ')}`);
    }
  }
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-design-language');
    document.documentElement.removeAttribute('data-theme');
  });
  check('…in every language and theme the open box’s text stands out on its fill (axe contrast)', low.length === 0, low.join(' ;; '));
  await page.keyboard.press('Escape');

  // The series question, by the mouse: a drag, then "this and following".
  const series = section('series');
  const s = series.locator('.mx-scheduler');
  await s.scrollIntoViewIfNeeded();
  const lines = () => series.locator('.sched-events li').allTextContents();
  const review = s.locator('.mx-scheduler__appointment[data-series]', { hasText: 'Design review' }).first();
  await review.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const a = await box(review);
  const row = await s.locator('.mx-scheduler__cells [data-cell="0:0"]').evaluate((el) => el.getBoundingClientRect().height);
  await page.mouse.move(a.left + a.width / 2, a.top + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.left + a.width / 2 + 4, a.top + a.height / 2 + 6, { steps: 2 });
  await page.mouse.move(a.left + a.width / 2, a.top + a.height / 2 + row * 2, { steps: 8 });
  await page.mouse.up();
  const question = page.locator('.mx-scheduler__question');
  await question.waitFor();
  const asked = await question.evaluate((el) => ({ text: el.textContent, radios: el.querySelectorAll('input[type="radio"]').length, first: el.querySelector('input[type="radio"]')?.checked }));
  check('a drag of an occurrence asks what it reaches: three choices, the first chosen', asked.radios === 3 && asked.first && /Which ones change\?/.test(asked.text), JSON.stringify(asked));
  await axe('the series question', question);
  await question.getByText('This and the following ones').click();
  await question.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(300);
  check('…answered by the mouse, the change goes to this one and the following', (await lines()).some((l) => /^Saved Design review, following$/.test(l)), (await lines()).join(' | '));

  // By the keys: an occurrence moved by the arrows, the question answered with Enter; Escape drops a delete.
  const standup = s.locator('.mx-scheduler__appointment[data-series]', { hasText: 'Team standup' }).first();
  const before = await s.locator('.mx-scheduler__appointment[data-exception]').count();
  await standup.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await question.waitFor();
  const focusIn = await page.evaluate(() => document.activeElement?.closest('.mx-scheduler__question') !== null);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const after = await s.locator('.mx-scheduler__appointment[data-exception]').count();
  check(
    'by the keys: the arrows move an occurrence, focus is in the question, Enter answers "this one": it goes apart from its series',
    focusIn && after === before + 1 && (await lines()).some((l) => /^Saved Team standup, occurrence$/.test(l)),
    `${focusIn} ${before} → ${after}: ${(await lines()).join(' | ')}`,
  );
  const count = await s.locator('.mx-scheduler__appointment').count();
  await s.locator('.mx-scheduler__appointment[data-series]', { hasText: 'Team standup' }).first().focus();
  await page.keyboard.press('Delete');
  await question.waitFor();
  const deleteText = await question.textContent();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check(
    'Delete asks the same question; Escape drops it and nothing is deleted',
    /Which ones are deleted\?/.test(deleteText) && (await s.locator('.mx-scheduler__appointment').count()) === count && (await question.count()) === 0,
    deleteText,
  );

  // The form holds the recurrence editor.
  // Enter on an occurrence opens its form.
  await s.locator('.mx-scheduler__appointment[data-series]', { hasText: 'Team standup' }).first().focus();
  await page.keyboard.press('Enter');
  const form = page.locator('.mx-scheduler__form');
  await form.waitFor();
  const inForm = await form.evaluate((el) => ({ editor: !!el.querySelector('.mx-recurrence-editor'), pressed: [...el.querySelectorAll('.mx-recurrence-editor__day[data-pressed]')].length }));
  check('the form of an occurrence holds the recurrence editor with its series’ weekdays', inForm.editor && inForm.pressed === 5, JSON.stringify(inForm));
  await axe('the form with the recurrence editor', form);
  await form.getByRole('button', { name: 'Cancel' }).click();

  // The editor on its own.
  const editor = section('editor');
  await editor.scrollIntoViewIfNeeded();
  const rule = () => editor.locator('.sched-log code').textContent();
  await editor.locator('.mx-recurrence-editor__frequency').click();
  await page.getByRole('option', { name: 'Weekly' }).click();
  await editor.locator('.mx-recurrence-editor__day', { hasText: 'Mon' }).click();
  await editor.locator('.mx-recurrence-editor__day', { hasText: 'Fri' }).click();
  const weekly = await rule();
  const summary = await editor.locator('.mx-recurrence-editor__summary').textContent();
  check('the editor writes the rule of its choices and says it', /^FREQ=WEEKLY;COUNT=6;BYDAY=(MO,)?\w\w(,\w\w)*$/.test(weekly) && weekly.includes('MO') && weekly.includes('FR') && /^Every week on/.test(summary), `${weekly} | ${summary}`);
  const widths = await editor.locator('.mx-recurrence-editor__day').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
  check('…its weekday buttons are of one width', Math.max(...widths) - Math.min(...widths) <= 0.5, widths.join(' '));
  await editor.getByText('Never', { exact: true }).click();
  check('…an end of never takes the count away', !(await rule()).includes('COUNT'), await rule());
  await axe('the recurrence editor', editor);

  // The form's time zones: one picker and a box for a separate end zone, on the line of the picker's box.
  const zones = section('zones').locator('.mx-scheduler');
  await zones.first().scrollIntoViewIfNeeded();
  const openLunch = async () => {
    await zones.first().locator('.mx-scheduler__appointment', { hasText: 'Istanbul lunch' }).first().focus();
    await page.keyboard.press('Enter');
    await form.waitFor();
    await page.waitForTimeout(200);
  };
  const zoneState = () =>
    form.evaluate((el) => {
      const shown = (d) => !d.closest('[hidden]') && d.getBoundingClientRect().width > 0;
      const pickers = [...el.querySelectorAll('.mx-drop-down')].filter((d) => shown(d) && !d.closest('.mx-recurrence-editor'));
      const box = el.querySelector('.mx-scheduler__end-zone-switch');
      const mark = box.querySelector('.mx-check-box__mark').getBoundingClientRect();
      return {
        pickers: pickers.map((p) => p.querySelector('.mx-field__label')?.textContent + '=' + (p.querySelector('.mx-drop-down__value, .mx-field__control, input')?.textContent || p.querySelector('input')?.value || '')),
        checked: box.getAttribute('data-state'),
        // Under the picker, at the start of its box; the picker the whole row, its name whole.
        off: Math.abs(mark.left - pickers[0].querySelector('.mx-field__box').getBoundingClientRect().left),
        under: mark.top >= pickers[0].getBoundingClientRect().bottom,
        cut: pickers.some((p) => {
          const display = p.querySelector('.mx-drop-down__display');
          return [display, ...display.querySelectorAll('*')].some((n) => n.scrollWidth > n.clientWidth + 0.5);
        }),
      };
    });
  // A zone by its name as the list writes it ("(GMT+1) Europe/Berlin", "America/New York").
  const choose = async (picker, name) => {
    await picker.click();
    await page.keyboard.type(name.split('/')[1]);
    await page.getByRole('option', { name: new RegExp(name.replace('/', '\/')) }).first().click();
    await page.waitForTimeout(200);
  };
  await openLunch();
  const first = await zoneState();
  check(
    'the form has one time zone picker, and under it, at its start, an unchecked box for a separate end zone',
    first.pickers.length === 1 && first.checked === 'unchecked' && first.under && first.off <= 0.5,
    JSON.stringify(first),
  );
  const visiblePickers = () => form.locator('.mx-drop-down:not(.mx-recurrence-editor .mx-drop-down)').filter({ visible: true });
  await choose(visiblePickers().first(), 'Europe/Berlin');
  await form.locator('.mx-scheduler__end-zone-switch').click();
  await page.waitForTimeout(200);
  const ticked = await zoneState();
  check('…ticked, the end zone picker appears', ticked.pickers.length === 2 && ticked.checked === 'checked', JSON.stringify(ticked));
  await choose(visiblePickers().nth(1), 'America/New York');
  await form.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(400);
  await openLunch();
  const again = await zoneState();
  check(
    '…saved and opened again: the box is checked and each picker shows its zone, its name whole',
    again.checked === 'checked' && again.pickers.length === 2 && again.pickers[0].includes('Berlin') && again.pickers[1].includes('New York') && !again.cut,
    JSON.stringify(again),
  );
  await axe('the form with its time zones', form);
  await form.getByRole('button', { name: 'Cancel' }).click();

  // Time zones over New York's change of clocks: its call stays at 09:00 there and moves an hour in Istanbul.
  // Its day and the hour on the scheduler's clock (Istanbul shows 6 to 22, New York 0 to 16).
  const callAt = (i, from) =>
    zones.nth(i).evaluate(
      (el, start) =>
        [...el.querySelectorAll('.mx-scheduler__appointment')]
          .filter((b) => b.textContent.includes('Call with New York'))
          .map((b) => `${b.style.getPropertyValue('--_column')}@${Math.round(start + (parseFloat(b.style.insetBlockStart) / 100) * 16)}`)
          .join(' '),
      from,
    );
  const before1 = [await callAt(0, 6), await callAt(1, 0)];
  for (let i = 0; i < 2; i++) await zones.nth(i).locator('.mx-scheduler__step').nth(1).click();
  await page.waitForTimeout(300);
  const after1 = [await callAt(0, 6), await callAt(1, 0)];
  check(
    'over the change of summer time: 09:00 in New York before and after, 16:00 then 17:00 in Istanbul',
    /^0@16 1@16$/.test(before1[0]) && /^0@9 1@9$/.test(before1[1]) && /^1@17 2@17$/.test(after1[0]) && /^1@9 2@9$/.test(after1[1]),
    `${before1.join(' / ')} → ${after1.join(' / ')}`,
  );

  // Right to left.
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await page.waitForTimeout(200);
  const rtl = await editor.evaluate((el) => {
    const days = [...el.querySelectorAll('.mx-recurrence-editor__day')].map((d) => d.getBoundingClientRect().left);
    return { order: days.every((x, i) => i === 0 || x < days[i - 1]) };
  });
  const mark = await recurring.evaluate((el) => {
    const m = [...el.querySelectorAll('.mx-scheduler__mark')].find((x) => x.getBoundingClientRect().width > 0);
    if (!m) return { none: true };
    const b = m.closest('.mx-scheduler__appointment').getBoundingClientRect();
    const r = m.getBoundingClientRect();
    return { atEnd: r.left - b.left < b.right - r.right };
  });
  check('right to left: the weekdays run from the right, a mark stands at the left end of its box', rtl.order && (mark.none || mark.atEnd), JSON.stringify({ rtl, mark }));
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));
}
