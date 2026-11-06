import { designLanguages } from '../languages.mjs';
import { sweepBox, sweepColours } from '../scheduler-ink-sweep.mjs';

/** Real-browser checks of the Scheduler's timeline page: rows, the scale, scrolling, the current time, dragging and resizing along and across rows, the keys, nested groups, settings and templates per view, right to left, every language, axe. */
export default async function ({ page, base, check, axeSource, box }) {
  // Wednesday 28 October 2026, 10:00 local (the clock runs on: a drag tells its end from a click by the time).
  await page.clock.install({ time: new Date(2026, 9, 28, 10, 0) });
  await page.clock.resume();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + 'scheduler/timeline', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const section = (id) => page.locator(`section[aria-labelledby="${id}"]`);
  const axe = async (label, scope) => {
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await page.waitForTimeout(150);
      await page.addScriptTag({ content: axeSource });
      const violations = await scope.evaluate(async (el) =>
        (await window.axe.run(el)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`),
      );
      check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  };

  // A view by its button, or from the bar's "more" menu when the button did not fit.
  const showView = async (scheduler, text) => {
    const button = scheduler.locator('.mx-scheduler__view-button:not([data-overflowed])', { hasText: text });
    if ((await button.count()) && (await button.first().isVisible())) return button.first().click();
    await scheduler.locator('.mx-toolbar__more').click();
    await page.locator('.mx-popup:popover-open .mx-menu__item', { hasText: text }).first().click();
    await page.waitForTimeout(200);
  };

  // The week: a row per person, the scale's two tiers, the jobs on their lanes.
  const views = section('views');
  const s = views.locator('.mx-scheduler');
  await s.locator('.mx-scheduler__line .mx-scheduler__appointment').first().waitFor();
  const layout = await s.evaluate((el) => ({
    view: el.dataset.view,
    rows: [...el.querySelectorAll('.mx-scheduler__line')].map((r) => r.querySelector('.mx-scheduler__resource')?.textContent.trim()),
    upper: el.querySelectorAll('.mx-scheduler__scale-cell[data-tier="upper"]').length,
    lower: [...el.querySelectorAll('.mx-scheduler__scale-cell[data-tier="lower"]')].slice(0, 2).map((c) => c.textContent.trim()),
    lanes: Math.max(...[...el.querySelectorAll('.mx-scheduler__line .mx-scheduler__appointment')].map((b) => Number(b.style.getPropertyValue('--_lane')))),
  }));
  check(
    'a timeline week: a row per person, days over hours, jobs at the same time on lanes of their own',
    layout.view === 'timelineWeek' && layout.rows.length === 7 && layout.rows[0] === 'Ana Silva' && layout.upper === 7 && /AM|PM|\d/.test(layout.lower[0]) && layout.lanes >= 1,
    JSON.stringify(layout),
  );
  const tall = await s.evaluate((el) => {
    const rows = [...el.querySelectorAll('.mx-scheduler__line')];
    const lanes = (r) => Math.max(0, ...[...r.querySelectorAll('.mx-scheduler__appointment')].map((b) => Number(b.style.getPropertyValue('--_lane')) + 1));
    return rows.map((r) => ({ lanes: lanes(r), height: Math.round(r.getBoundingClientRect().height) }));
  });
  const grows = tall.every((r) => tall.every((o) => (r.lanes > o.lanes ? r.height > o.height : true)));
  check('a row with more lanes is taller', grows, JSON.stringify(tall));

  // It opened at the work hours of today; the current time is a line in every row, at its time.
  const scroller = s.locator('.mx-scheduler__line-scroll');
  const opened = await scroller.evaluate((el) => {
    const now = el.querySelector('.mx-scheduler__line .mx-scheduler__now');
    const tick = parseFloat(getComputedStyle(el.closest('.mx-scheduler__timeline')).getPropertyValue('--_tick'));
    const at = Number(now?.style.getPropertyValue('--_at'));
    const track = el.querySelector('.mx-scheduler__line-track').getBoundingClientRect();
    const line = now?.getBoundingClientRect();
    return { left: el.scrollLeft, lines: el.querySelectorAll('.mx-scheduler__now:not([hidden])').length, off: line ? Math.abs(line.left + line.width / 2 - (track.left + at * tick)) : -1, at };
  });
  check('it opens scrolled to today; the now line stands in each row at its time', opened.left > 0 && opened.lines === 7 && opened.off >= 0 && opened.off <= 0.5 && Math.abs(opened.at - (3 * 13 + 3)) < 0.01, JSON.stringify(opened));

  // Scrolled down and along: the scale stays at the top, the resource column at the start.
  await scroller.evaluate((el) => {
    el.style.maxHeight = '260px';
    el.scrollTop = 120;
    el.scrollLeft += 300;
  });
  await page.waitForTimeout(150);
  const stuck = await scroller.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const scale = el.querySelector('.mx-scheduler__scale').getBoundingClientRect();
    const cell = [...el.querySelectorAll('.mx-scheduler__resource')].find((c) => c.getBoundingClientRect().bottom > r.top + scale.height + 10).getBoundingClientRect();
    return { top: Math.abs(scale.top - r.top), start: Math.abs(cell.left - r.left) };
  });
  check('the scale stays at the top and the resource column at the start while it scrolls', stuck.top <= 0.5 && stuck.start <= 0.5, JSON.stringify(stuck));
  await scroller.evaluate((el) => {
    el.style.maxHeight = '';
    el.scrollTop = 0;
  });

  // A drag along the row: two cells later, the same box; then to the next row.
  const box0 = s.locator('.mx-scheduler__line').nth(4).locator('.mx-scheduler__appointment').first();
  await box0.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  const job = await box0.evaluate((el) => ({ text: el.querySelector('.mx-scheduler__appointment-text').textContent, from: Number(el.style.getPropertyValue('--_from')), piece: el.dataset.piece }));
  const tick = await scroller.evaluate((el) => parseFloat(getComputedStyle(el.closest('.mx-scheduler__timeline')).getPropertyValue('--_tick')));
  let r = await box(box0);
  const grab = { x: r.left + Math.min(20, r.width / 2), y: r.top + r.height / 2 };
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + 6, grab.y + 2, { steps: 2 });
  await page.mouse.move(grab.x + 2 * tick, grab.y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  const after = await s.locator('.mx-scheduler__line').nth(4).evaluate((row, piece) => [...row.querySelectorAll('.mx-scheduler__appointment')].find((b) => b.dataset.piece === piece)?.style.getPropertyValue('--_from'), job.piece);
  check('dragged along its row, a job moves two cells on', Number(after) === job.from + 2, `${job.from} → ${after}`);
  // To the row below: it is that person's now (the same appointment, a box of that row).
  const id = job.piece.slice(0, job.piece.lastIndexOf('@'));
  const boxOf = (row) => s.locator('.mx-scheduler__line').nth(row).locator(`.mx-scheduler__appointment[data-piece="${id}@r${row}"]`);
  r = await box(boxOf(4));
  const below = await box(s.locator('.mx-scheduler__line').nth(5));
  await page.mouse.move(r.left + r.width / 2, r.top + r.height / 2);
  await page.mouse.down();
  await page.mouse.move(r.left + r.width / 2 + 6, r.top + r.height / 2 + 4, { steps: 2 });
  await page.mouse.move(r.left + r.width / 2, below.top + below.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  check('dragged to the row below, the job goes to that person', (await boxOf(5).count()) === 1 && (await boxOf(4).count()) === 0, `${await boxOf(4).count()} / ${await boxOf(5).count()}`);

  // Its end: a cell on.
  const resized = boxOf(5);
  await resized.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  // The scroll builds what came into view first.
  await page.waitForTimeout(150);
  const span = Number(await resized.evaluate((el) => el.style.getPropertyValue('--_span')));
  const edge = await box(resized.locator('.mx-scheduler__resize[data-edge="end"]'));
  await page.mouse.move(edge.left + edge.width / 2, edge.top + edge.height / 2);
  await page.mouse.down();
  await page.mouse.move(edge.left + edge.width / 2 + 6, edge.top + edge.height / 2, { steps: 2 });
  await page.mouse.move(edge.left + edge.width / 2 + tick, edge.top + edge.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  const spanAfter = Number(await boxOf(5).evaluate((el) => el.style.getPropertyValue('--_span')));
  // To the end of the hour the pointer is in: a cell on and up to the hour.
  check('its end dragged a cell on, the job ends an hour or more later', spanAfter >= span + 1 && spanAfter <= span + 1.5, `${span} → ${spanAfter}`);

  // The keys: over the cells, then a job to the row above by Up and a step along by Right; Enter saves.
  const cell = s.locator('.mx-scheduler__line').nth(1).locator('[data-cell]').nth(3);
  await cell.click();
  const start = await cell.getAttribute('data-cell');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(100);
  const went = await page.evaluate(() => document.activeElement?.dataset.cell);
  const [c0, s0] = start.split(':').map(Number);
  check('Right and Down move over the cells: a cell on, a row down', went === `${c0 + 7}:${s0 + 1}`, `${start} → ${went}`);
  const keyed = boxOf(5);
  const fromBefore = Number(await keyed.evaluate((el) => el.style.getPropertyValue('--_from')));
  await keyed.focus();
  await page.keyboard.press('ArrowUp');
  const said = await s.locator('.mx-scheduler__live').textContent();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const keyedTo = (await boxOf(4).count()) === 1 ? Number(await boxOf(4).evaluate((el) => el.style.getPropertyValue('--_from'))) : null;
  check(
    'Up on a job moves it to the row above (it says where), Right a step on; Enter saves',
    keyedTo !== null && Math.abs(keyedTo - fromBefore - 1) < 0.01 && (await boxOf(5).count()) === 0 && /Emil Novak/.test(said),
    `${fromBefore} → ${keyedTo}; ${said}`,
  );

  // The other views: a day of hours, the month of days.
  await showView(s, 'Timeline month');
  await page.waitForTimeout(300);
  const month = await s.evaluate((el) => ({
    view: el.dataset.view,
    days: el.querySelectorAll('.mx-scheduler__scale-cell[data-tier="lower"][data-kind="day"]').length,
    months: el.querySelectorAll('.mx-scheduler__scale-cell[data-tier="upper"]').length,
    cells: el.querySelectorAll('.mx-scheduler__line:first-of-type [data-cell], .mx-scheduler__line [data-cell$=":-1"]').length > 0,
  }));
  check('the timeline month: a month over its 31 days, a cell a day', month.view === 'timelineMonth' && month.days === 31 && month.months === 1 && month.cells, JSON.stringify(month));
  await axe('the timeline month', views);
  await showView(s, 'Timeline week');
  await page.waitForTimeout(300);
  await axe('the timeline week', views);

  // Nested: the team over its people; right to left mirrors the time and the resource column.
  const nested = section('nested');
  const n = nested.locator('.mx-scheduler');
  await n.scrollIntoViewIfNeeded();
  await n.locator('.mx-scheduler__line').first().waitFor();
  const levels = await n.evaluate((el) =>
    [...el.querySelectorAll('.mx-scheduler__line')].map((row) => [...row.querySelectorAll('.mx-scheduler__resource')].map((c) => (c.hasAttribute('data-continued') ? '' : c.textContent.trim()))),
  );
  check(
    'nested: each person under their team, the team named on its first row',
    JSON.stringify(levels.slice(0, 3)) === JSON.stringify([['Field service', 'Ana Silva'], ['', 'Ben Okafor'], ['', 'Cem Yılmaz']]) && levels[3][0] === 'Workshop',
    JSON.stringify(levels),
  );
  const label = await n.locator('.mx-scheduler__line').nth(1).locator('[data-cell]').first().getAttribute('aria-label');
  check('a cell reads its groups before its time', /^Field service, Ben Okafor, Wednesday/.test(label), label);
  await axe('nested groups', nested);
  await nested.locator('.mx-switch').first().click();
  await page.waitForTimeout(300);
  const rtl = await n.evaluate((el) => {
    const hours = [...el.querySelectorAll('.mx-scheduler__scale-cell[data-tier="lower"]')].slice(0, 2).map((c) => c.getBoundingClientRect().left);
    const head = el.querySelector('.mx-scheduler__line .mx-scheduler__resource').getBoundingClientRect();
    const track = el.querySelector('.mx-scheduler__line-track').getBoundingClientRect();
    return { mirrored: hours[1] < hours[0], headRight: head.left > track.left };
  });
  check('right to left: the hours run leftwards, the resource column on the right', rtl.mirrored && rtl.headRight, JSON.stringify(rtl));
  // Right to left, Right moves a job earlier.
  const rtlBox = n.locator('.mx-scheduler__line .mx-scheduler__appointment').first();
  const rtlFrom = Number(await rtlBox.evaluate((el) => el.style.getPropertyValue('--_from')));
  await rtlBox.focus();
  await page.keyboard.press('ArrowLeft');
  const rtlNow = Number(await rtlBox.evaluate((el) => el.style.getPropertyValue('--_from')));
  await page.keyboard.press('Escape');
  check('right to left, Left moves a job later', rtlNow > rtlFrom, `${rtlFrom} → ${rtlNow}`);
  await axe('right to left', nested);
  await nested.locator('.mx-switch').first().click();

  // Settings per view: two weeks of four-hour cells counted from a fixed Monday; a month with two lanes and "+N more".
  const settings = section('settings');
  const st = settings.locator('.mx-scheduler');
  await st.scrollIntoViewIfNeeded();
  await st.locator('.mx-scheduler__line').first().waitFor();
  const fortnight = await st.evaluate((el) => ({ days: el.querySelectorAll('.mx-scheduler__scale-cell[data-tier="upper"]').length, hours: el.querySelector('.mx-scheduler__line').querySelectorAll('[data-cell]').length }));
  check('the fortnight: 14 days of six four-hour cells', fortnight.days === 14 && fortnight.hours === 84, JSON.stringify(fortnight));
  await showView(st, 'Month');
  await page.waitForTimeout(300);
  const more = st.locator('.mx-scheduler__line .mx-scheduler__more').first();
  const hasMore = (await more.count()) > 0;
  const lanes = await st.evaluate((el) => Math.max(...[...el.querySelectorAll('.mx-scheduler__line .mx-scheduler__appointment:not([hidden])')].map((b) => Number(b.style.getPropertyValue('--_lane')))));
  check('the month keeps two lanes a row, the rest "+N more"', hasMore && lanes <= 1, `${hasMore}, lanes ${lanes}`);
  if (hasMore) {
    await more.click();
    const list = page.locator('.mx-scheduler__more-popup:popover-open .sched-more');
    await list.waitFor();
    check('"+N more" opens the view’s own list', (await list.locator('.sched-more__item').count()) > 0, await list.textContent());
    await page.keyboard.press('Escape');
  }

  // Templates: the scheduler's for every view; the week's own cell template, which the day does not have.
  const templates = section('templates');
  const tp = templates.locator('.mx-scheduler');
  await tp.scrollIntoViewIfNeeded();
  await tp.locator('.mx-scheduler__line').first().waitFor();
  const drawn = await tp.evaluate((el) => ({
    heads: el.querySelectorAll('.mx-scheduler__resource .sched-person').length,
    dates: el.querySelectorAll('.mx-scheduler__scale .sched-date').length,
    hours: el.querySelectorAll('.mx-scheduler__scale .sched-time').length,
    cells: el.querySelectorAll('.mx-scheduler__cell .sched-off').length,
    jobs: el.querySelectorAll('.mx-scheduler__appointment .sched-job').length,
  }));
  check('templates draw the heads, the days, the hours, the cells and the jobs', Object.values(drawn).every((v) => v > 0), JSON.stringify(drawn));
  await showView(tp, 'Timeline day');
  await page.waitForTimeout(300);
  const dayCells = await tp.evaluate((el) => el.querySelectorAll('.mx-scheduler__cell .sched-off').length);
  check('the week’s own cell template is not the day’s', dayCells === 0, String(dayCells));
  await axe('templates', templates);

  // Every language: the divider over a row is centred on the row's edge, the resource names on their row's middle.
  const results = [];
  for (const designLanguage of designLanguages) {
    await page.evaluate((i) => (document.documentElement.dataset.designLanguage = i), designLanguage);
    await page.waitForTimeout(200);
    results.push(
      await n.evaluate((el, i) => {
        const row = el.querySelector('.mx-scheduler__line[data-edge="outer"]');
        const line = getComputedStyle(row, '::before');
        const r = row.getBoundingClientRect();
        const divider = line.display === 'none' || parseFloat(line.height) === 0 ? null : (() => {
          const height = parseFloat(line.height);
          const shift = line.translate.split(' ')[1] ?? '0';
          const moved = shift.endsWith('%') ? (parseFloat(shift) / 100) * height : parseFloat(shift) || 0;
          return Math.abs(r.top + parseFloat(line.top) + moved + height / 2 - r.top);
        })();
        const name = row.querySelector('.mx-scheduler__resource:not([data-continued]) .mx-scheduler__group-text').getBoundingClientRect();
        const cell = row.querySelector('.mx-scheduler__resource').getBoundingClientRect();
        return { i, divider, name: Math.abs(name.top + name.height / 2 - (cell.top + cell.height / 2)) };
      }, designLanguage),
    );
  }
  await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));
  check('in every language the row divider is centred on the edge (or not drawn), the names in the middle of their row', results.every((x) => (x.divider === null || x.divider <= 0.5) && x.name <= 0.5), JSON.stringify(results));

  // The text of a job reads on its fill in every colour and state.
  await s.scrollIntoViewIfNeeded();
  const ink = await sweepBox(page, 'section[aria-labelledby="views"] .mx-scheduler__line .mx-scheduler__appointment', sweepColours());
  check('a job’s title and time read on its fill (4.5:1) in every colour and state', ink.title.ratio >= 4.5 && ink.time.ratio >= 4.5, JSON.stringify(ink));
}
