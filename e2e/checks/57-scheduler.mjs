/** Real-browser checks of the Scheduler page: the views, moving, the date picker, keys and selection, overlaps, "+N more", settings, a data source, templates, code, right to left, axe. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'scheduler', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const section = (id) => page.locator(`section[aria-labelledby="${id}"]`);
  const basics = section('basics');
  const s = basics.locator('.mx-scheduler');
  await s.locator('.mx-scheduler__appointment').first().waitFor();
  // The date in the bar (its button also holds the calendar it opens).
  const title = () =>
    s
      .locator('.mx-scheduler__title .mx-button__face')
      .first()
      .evaluate((el) =>
        [...el.childNodes]
          .filter((n) => !(n instanceof Element && n.closest('.mx-popup')))
          .map((n) => n.textContent)
          .join('')
          .trim(),
      );
  const view = () => s.evaluate((el) => el.dataset.view);
  const axe = async (label, scope) => {
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await page.waitForTimeout(120);
      await page.addScriptTag({ content: axeSource });
      const violations = await scope.evaluate(async (el) =>
        (await window.axe.run(el)).violations.map(
          (v) =>
            `${v.id}: ${v.nodes
              .slice(0, 2)
              .map((n) => n.target.join(' '))
              .join(' | ')}`,
        ),
      );
      check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  };

  // The week.
  const days = await s.locator('.mx-scheduler__date').count();
  const today = await s.locator('.mx-scheduler__date[data-today]').count();
  check('starts on the week, seven days, today marked once', (await view()) === 'week' && days === 7 && today === 1, `${days} days, ${today} today`);
  const now = await s.evaluate((el) => {
    const line = el.querySelector('.mx-scheduler__now');
    const body = el.querySelector('.mx-scheduler__body');
    if (!line || line.hidden) return null;
    const l = line.getBoundingClientRect();
    const b = body.getBoundingClientRect();
    const d = new Date();
    const at = (d.getHours() * 60 + d.getMinutes() - 7 * 60) / (14 * 60);
    return {
      off: Math.abs(l.top - b.top - at * b.height),
      today: el.querySelector('.mx-scheduler__date[data-today]').getBoundingClientRect(),
      line: l,
    };
  });
  const nowHour = new Date().getHours();
  if (nowHour >= 7 && nowHour < 21)
    check('the current time line is at now, in the column of today', !!now && now.off < 3 && Math.abs(now.line.left - now.today.left) < 2, JSON.stringify(now));

  // Two appointments at the same time share the column.
  const pair = await s.evaluate((el) => {
    const find = (t) => [...el.querySelectorAll('.mx-scheduler__appointment')].find((a) => a.textContent.includes(t))?.getBoundingClientRect();
    const a = find('Design review');
    const b = find('Release planning');
    return a && b ? { a: [a.left, a.right, a.width], b: [b.left, b.right, b.width] } : null;
  });
  check(
    'appointments at the same time stand side by side, half the column each',
    !!pair && Math.abs(pair.a[2] - pair.b[2]) < 2 && (pair.a[1] <= pair.b[0] + 1 || pair.b[1] <= pair.a[0] + 1),
    JSON.stringify(pair),
  );
  await axe('the week', s);

  // Moving.
  const start = await title();
  await s.locator('.mx-scheduler__step').nth(1).click();
  const next = await title();
  await s.locator('.mx-scheduler__step').nth(0).click();
  await s.locator('.mx-scheduler__step').nth(0).click();
  const back = await title();
  await s.locator('.mx-scheduler__today').click();
  check('next, previous and today move the week', next !== start && back !== start && (await title()) === start, `${start} → ${next} → ${back}`);
  const live = await s.locator('.mx-scheduler__live').textContent();
  check('…and say what it shows', live === start, live);

  // The date picker.
  await s.locator('.mx-scheduler__title').click();
  const picker = page.locator('.mx-popup:popover-open .mx-calendar');
  await picker.waitFor();
  const type = await picker.evaluate((el) => {
    const title = getComputedStyle(el.closest('.mx-scheduler__title').querySelector('.mx-button__face'));
    const cell = getComputedStyle(el.querySelector('.mx-calendar__cell'));
    const own = getComputedStyle(el.closest('.mx-scheduler'));
    return { cell: [cell.fontSize, cell.fontWeight], title: [title.fontSize, title.fontWeight], scheduler: own.fontSize };
  });
  check(
    "the calendar keeps its own type, not the bar's date",
    type.cell[0] === type.scheduler && type.cell[0] !== type.title[0] && type.cell[1] !== type.title[1],
    JSON.stringify(type),
  );
  const target = picker.locator('.mx-calendar__cell:not([data-outside])').filter({ hasText: /^15$/ }).first();
  await target.click();
  await page.waitForTimeout(200);
  const picked = await title();
  const numbers = await s.locator('.mx-scheduler__date .mx-scheduler__day-number').allTextContents();
  check(
    'the date opens a calendar; a day chosen there shows its week and closes it',
    picked !== start && numbers.includes('15') && (await page.locator('.mx-popup:popover-open .mx-calendar').count()) === 0,
    `${picked}: ${numbers.join(' ')}`,
  );
  await s.locator('.mx-scheduler__today').click();

  // Views.
  await s.locator('.mx-scheduler__view-button', { hasText: /^Month$/ }).click();
  await page.waitForTimeout(200);
  const cells = await s.locator('.mx-scheduler__month-cell').count();
  check('Month shows whole weeks of the month', (await view()) === 'month' && cells % 7 === 0 && cells >= 28, `${cells} cells`);
  await axe('the month', s);
  const more = s.locator('.mx-scheduler__more:visible').first();
  if (await more.count()) {
    const label = await more.textContent();
    await more.click();
    const list = page.locator('.mx-scheduler__more-popup:popover-open');
    await list.waitFor();
    const items = await list.locator('.mx-scheduler__more-item').count();
    const focused = await page.evaluate(() => document.activeElement?.classList.contains('mx-scheduler__more-item'));
    check('"+N more" opens the day\'s list, focus on its first appointment', items > Number(label.match(/\d+/)[0]) && focused, `${label}: ${items}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    check(
      '…Escape closes it and focus goes back',
      (await list.count()) === 0 && (await page.evaluate(() => document.activeElement?.classList.contains('mx-scheduler__more'))),
    );
  } else check('"+N more" shows on a full day', false, 'no "+N more" in the month');
  await page.keyboard.press('d');
  await page.waitForTimeout(150);
  check('D shows the day', (await view()) === 'day' && (await s.locator('.mx-scheduler__date').count()) === 1);
  await axe('the day', s);
  await page.keyboard.press('w');
  await page.waitForTimeout(150);

  // Keys and selection.
  await s.locator('.mx-scheduler__cells [data-cell="1:4"]').click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Shift+ArrowDown');
  const keys = await s.evaluate((el) => ({
    focus: document.activeElement?.dataset.cell,
    selected: [...el.querySelectorAll('[data-cell][aria-selected="true"]')].map((c) => c.dataset.cell).join(','),
  }));
  check('arrows move over the cells and Shift selects from where it began', keys.focus === '2:7' && keys.selected === '2:5,2:6,2:7', JSON.stringify(keys));
  await page.keyboard.press('Enter');
  const newForm = page.locator('dialog.mx-scheduler__form[open]');
  await newForm.waitFor();
  check('Enter on a cell is its double click: the form for a new appointment there', (await basics.locator('.sched-log').textContent()).startsWith('New at'));
  await page.keyboard.press('Escape');
  await newForm.waitFor({ state: 'detached' });
  const refocused = await page.evaluate(() => document.activeElement?.dataset.cell);
  check('…Escape closes the form and focus goes back to the cell', refocused === '2:7', refocused);
  await page.keyboard.press('Escape');
  check('Escape clears the selection', (await s.locator('[data-cell][aria-selected="true"]').count()) === 0);
  const first = await title();
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  const stepped = await s.evaluate(() => document.activeElement?.dataset.cell);
  check('past the last day the arrows move the view on, focus on its first day', (await title()) !== first && stepped === '0:7', `${stepped} ${await title()}`);
  await page.keyboard.press('t');
  await page.waitForTimeout(150);

  // An appointment.
  const appointment = s.locator('.mx-scheduler__appointment', {
    hasText: 'Design review',
  });
  await appointment.dblclick();
  check(
    'a double click on an appointment reports it, and opens its form',
    (await basics.locator('.sched-log').textContent()) === 'Open: Design review' && (await page.locator('dialog.mx-scheduler__form[open]').count()) === 1,
  );
  await page.keyboard.press('Escape');
  await page.locator('dialog.mx-scheduler__form').waitFor({ state: 'detached' });
  const name = await appointment.evaluate((el) => el.textContent);
  check('an appointment is named by its time, its text and its day', /Design review/.test(name) && /10:00/.test(name) && /,/.test(name), name);

  // Settings live.
  const views = section('views').locator('.mx-scheduler');
  const rows = await views.locator('.mx-scheduler__cells [role="row"]').count();
  await section('views').getByText('15-minute cells').click();
  await page.waitForTimeout(150);
  const rows15 = await views.locator('.mx-scheduler__cells [role="row"]').count();
  check(
    'a setting bound to a switch changes the view in place: 15-minute cells',
    rows15 === rows * 2 && (await views.locator('.mx-scheduler__date').count()) === 3,
    `${rows} → ${rows15}`,
  );
  await section('views').getByText('All-day panel').click();
  await page.waitForTimeout(150);
  check('…the all-day panel goes', !(await views.locator('.mx-scheduler__all-day').isVisible()));
  // Month by its key (the bar may have put the button into its "more" menu).
  await views.locator('.mx-scheduler__cells [data-cell="0:2"]').click();
  await page.keyboard.press('m');
  await page.waitForTimeout(200);
  const friday = await views.locator('.mx-scheduler__month-cell[data-holiday]').count();
  check('a view of its own and holidays: Fridays marked in the month', friday >= 4, `${friday}`);

  // A data source.
  const source = section('data').locator('.mx-scheduler');
  await source.locator('.mx-scheduler__appointment').first().waitFor({ timeout: 5000 });
  const asked = await section('data').locator('.sched-log').textContent();
  await source.locator('.mx-scheduler__step').nth(1).click();
  await page.waitForTimeout(100);
  const busy = await source.locator('.mx-scheduler__content').getAttribute('aria-busy');
  await page.waitForTimeout(900);
  const askedAgain = await section('data').locator('.sched-log').textContent();
  check(
    'a data source is asked for the days shown, again when the view moves, busy while it loads',
    /startDate/.test(asked) && askedAgain !== asked && busy === 'true',
    `${busy} ${asked.slice(0, 60)}`,
  );

  // Templates.
  const cards = await section('templates').locator('.mx-scheduler__appointment .sched-card').count();
  check('a template draws the appointments', cards > 0, `${cards}`);
  await axe('templates', section('templates').locator('.mx-scheduler'));

  // From code.
  const made = section('code');
  await made.getByRole('button', { name: 'Create' }).click();
  const coded = made.locator('.mx-scheduler');
  await coded.waitFor();
  const turkish = await coded.locator('.mx-scheduler__weekday').first().textContent();
  check('made with new and added from code, in its own locale', (await coded.locator('.mx-scheduler__date').count()) === 5 && /Pzt/.test(turkish), turkish);
  await made.getByRole('button', { name: 'Select the next workday 9:00–10:30' }).click();
  await page.waitForTimeout(150);
  check(
    '…its methods select a time',
    (await coded.locator('[data-cell][aria-selected="true"]').count()) === 3 && /Selected/.test(await made.locator('.sched-log').textContent()),
  );

  // Right to left.
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await page.waitForTimeout(150);
  // The day's first row: no appointment stands over it, so the click reaches the cell.
  await s.locator('.mx-scheduler__cells [data-cell="3:0"]').click();
  await page.keyboard.press('ArrowRight');
  const rtl = await s.evaluate((el) => {
    const a = el.querySelector('.mx-scheduler__date:nth-child(2)').getBoundingClientRect();
    const b = el.querySelector('.mx-scheduler__date:nth-child(3)').getBoundingClientRect();
    return {
      focus: document.activeElement?.dataset.cell,
      order: a.left > b.left,
    };
  });
  check('right to left: the days run from the right, and Right goes to the day before', rtl.focus === '2:0' && rtl.order, JSON.stringify(rtl));
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));
}
