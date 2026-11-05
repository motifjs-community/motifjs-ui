/** Real-browser checks of the Scheduler's editing page: drag, Escape, a copy, the edges, the all-day panel, the keys, Delete, the tooltip and the form, saving to a server, a form of one's own, rules, scrolling, code, axe. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'scheduler/editing', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const section = (id) => page.locator(`section[aria-labelledby="${id}"]`);
  const editing = section('editing');
  const s = editing.locator('.mx-scheduler');
  await s.locator('.mx-scheduler__appointment').first().waitFor();
  await s.scrollIntoViewIfNeeded();
  const lines = () => editing.locator('.sched-events li').allTextContents();
  /** Whether the log has a line like this (the drop and the save come one after the other). */
  const logged = async (pattern) => (await lines()).some((line) => pattern.test(line));
  const dayOf = (locator) => locator.evaluate((el) => el.style.getPropertyValue('--_column'));
  /** A cell of the hours with nothing over its middle, on screen. */
  const freeCell = (scope) =>
    scope.evaluate((el) => {
      const scroller = el.querySelector('.mx-scheduler__scroll').getBoundingClientRect();
      for (const cell of el.querySelectorAll('.mx-scheduler__cells [data-cell]')) {
        const r = cell.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        if (y < scroller.top + 4 || y > scroller.bottom - 4 || x < scroller.left || x > scroller.right) continue;
        if (document.elementFromPoint(x, y) === cell) return { x, y };
      }
      return null;
    });
  const boxOf = (scope, text) => scope.locator('.mx-scheduler__appointment', { hasText: text }).first();
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
  // The cells' size, and which way a day further is (today may be the last day of the week).
  const geometry = async (scope) =>
    scope.evaluate((el) => {
      const cell = el.querySelector('.mx-scheduler__cells [data-cell="0:0"]').getBoundingClientRect();
      const days = el.querySelectorAll('.mx-scheduler__date').length;
      const today = [...el.querySelectorAll('.mx-scheduler__date')].findIndex((d) => d.hasAttribute('data-today'));
      return { w: cell.width, h: cell.height, way: today < days - 1 ? 1 : -1 };
    });
  // The morning, where the appointments of today are.
  await s.locator('.mx-scheduler__scroll').evaluate((el) => (el.scrollTop = 0));
  const g = await geometry(s);
  const drag = async (from, to, { ctrl = false, hold = false } = {}) => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    if (ctrl) await page.keyboard.down('Control');
    await page.mouse.move(from.x + 6, from.y + 6, { steps: 2 });
    await page.mouse.move(to.x, to.y, { steps: 10 });
    await page.waitForTimeout(80);
    if (hold) return;
    await page.mouse.up();
    if (ctrl) await page.keyboard.up('Control');
    await page.waitForTimeout(250);
  };

  // Move: a day and an hour.
  const review = boxOf(s, 'Design review');
  const a = await box(review);
  const dayBefore = Number(await dayOf(review));
  const from = { x: a.left + a.width / 2, y: a.top + a.height / 2 };
  await drag(from, { x: from.x + g.way * g.w, y: from.y + g.h * 2 }, { hold: true });
  const during = await s.locator('.mx-scheduler__appointment[data-draft]').count();
  await page.mouse.up();
  await page.waitForTimeout(250);
  const b = await box(review);
  const dayAfter = Number(await dayOf(review));
  check(
    "dragged, the appointment's own box goes where it would go, then stays there",
    during === 1 && dayAfter === dayBefore + g.way && Math.abs(b.top - a.top - g.h * 2) < 3,
    `day ${dayBefore} → ${dayAfter}, ${b.top - a.top}`,
  );
  check(
    '…and the drop is reported, then the save',
    (await logged(/^Moved Design review/)) && (await logged(/^Saved Design review/)),
    (await lines()).join(' | '),
  );

  // Escape takes it back.
  const c = await box(review);
  await drag({ x: c.left + c.width / 2, y: c.top + c.height / 2 }, { x: c.left + c.width / 2, y: c.top + c.height / 2 + g.h * 4 }, { hold: true });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await page.waitForTimeout(200);
  const d = await box(review);
  check('Escape while dragging takes it back', Math.abs(d.top - c.top) < 2 && (await s.locator('[data-draft]').count()) === 0, `${d.top - c.top}`);

  // Ctrl drops a copy.
  const before = await s.locator('.mx-scheduler__appointment', { hasText: 'Design review' }).count();
  await drag({ x: d.left + d.width / 2, y: d.top + d.height / 2 }, { x: d.left + d.width / 2, y: d.top + d.height / 2 + g.h * 6 }, { ctrl: true });
  const after = await s.locator('.mx-scheduler__appointment', { hasText: 'Design review' }).count();
  check(
    'Ctrl drops a copy, the appointment stays',
    after === before + 1 && (await logged(/^Copied Design review/)) && (await logged(/^Added Design review/)),
    `${before} → ${after}: ${(await lines()).join(' | ')}`,
  );

  // The end edge (an hour long: a short one is drawn taller than its time).
  const lunch = boxOf(s, 'Lunch with Ana');
  const e = await box(lunch);
  await drag({ x: e.left + e.width / 2, y: e.bottom - 2 }, { x: e.left + e.width / 2, y: e.bottom + g.h - 4 });
  const f = await box(lunch);
  check(
    'pulling the end edge makes it longer by the step',
    Math.abs(f.height - e.height - g.h) < 3 && (await logged(/^Lunch with Ana now/)),
    `${e.height} → ${f.height}`,
  );

  // Onto the all-day panel.
  const l = await box(lunch);
  const allDay = await box(s.locator('.mx-scheduler__all-day-cell').first());
  await drag({ x: l.left + l.width / 2, y: l.top + l.height / 2 }, { x: l.left + l.width / 2, y: allDay.top + allDay.height / 2 });
  check(
    'dropped on the all-day panel it becomes a bar there',
    (await s.locator('.mx-scheduler__bars .mx-scheduler__appointment', { hasText: 'Lunch with Ana' }).count()) === 1,
  );
  await axe('after the drags', s);

  // The keys.
  await boxOf(s, 'Team standup').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  check('the arrows move a focused appointment, Enter saves it', await logged(/^Moved Team standup .*\(keys\)$/), (await lines()).join(' | '));
  const focused = await page.evaluate(() => document.activeElement?.textContent ?? '');
  check('…and focus stays on it', focused.includes('Team standup'), focused);

  // The tooltip, then the form from it.
  await boxOf(s, 'Release planning').click();
  const tip = page.locator('.mx-scheduler__tooltip-popup:popover-open');
  await tip.waitFor();
  check(
    'a click shows the tooltip: text, time, Edit, Delete',
    /Release planning/.test(await tip.textContent()) && (await tip.getByRole('button').count()) === 2,
  );
  await axe('the tooltip', tip);
  await tip.getByRole('button', { name: 'Edit' }).click();
  const form = page.locator('dialog.mx-scheduler__form[open]');
  await form.waitFor();
  const title = form.locator('input').first();
  check('Edit opens the form with the appointment in it', (await title.inputValue()) === 'Release planning');
  await axe('the form', form);
  await title.fill('Release planning (v2)');
  await form.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(250);
  check(
    'Save writes it back',
    (await s.locator('.mx-scheduler__appointment', { hasText: 'Release planning (v2)' }).count()) === 1 && (await logged(/^Saved Release planning \(v2\)/)),
  );

  // A new one from the cells.
  const free = await freeCell(s);
  await page.mouse.dblclick(free.x, free.y);
  await form.waitFor();
  check('a double click on a cell opens the form for a new appointment at its time', /New appointment/.test(await form.textContent()));
  await form.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(150);
  check('…a title is required', (await form.count()) === 1);
  await form.locator('input').first().fill('Gym');
  await form.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(250);
  check('…then it is added', (await s.locator('.mx-scheduler__appointment', { hasText: 'Gym' }).count()) === 1 && (await logged(/^Added Gym/)));

  // Delete asks first.
  await boxOf(s, 'Gym').focus();
  await page.keyboard.press('Delete');
  const question = page.locator('dialog[open]', { hasText: 'Delete "Gym"?' });
  await question.waitFor();
  await question.getByRole('button', { name: 'OK' }).click();
  await page.waitForTimeout(250);
  check('Delete asks, then deletes', (await s.locator('.mx-scheduler__appointment', { hasText: 'Gym' }).count()) === 0 && (await logged(/^Deleted Gym/)));

  // Switches.
  await editing.getByText('Drag', { exact: true }).click();
  await page.waitForTimeout(100);
  check('turning dragging off: no appointment can be taken', (await s.locator('.mx-scheduler__appointment[data-draggable]').count()) === 0);
  await editing.getByText('Drag', { exact: true }).click();

  // Scrolling near the edge.
  const scroller = s.locator('.mx-scheduler__scroll');
  await scroller.evaluate((el) => (el.scrollTop = 0));
  const sc = await box(scroller);
  const top = await box(boxOf(s, 'Release planning'));
  await drag({ x: top.left + top.width / 2, y: top.top + top.height / 2 }, { x: top.left + top.width / 2, y: sc.bottom - 8 }, { hold: true });
  await page.waitForTimeout(500);
  const scrolled = await scroller.evaluate((el) => el.scrollTop);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  check('near the bottom edge the view scrolls while dragging', scrolled > 20, `${scrolled}`);

  // The month.
  await s.locator('.mx-scheduler__cells [data-cell="0:2"]').click();
  await page.keyboard.press('m');
  await page.waitForTimeout(250);
  const chip = s.locator('.mx-scheduler__appointment[data-kind="chip"]').first();
  const chipText = (await chip.locator('.mx-scheduler__appointment-text').textContent()).trim();
  const ch = await box(chip);
  const day = await box(s.locator('.mx-scheduler__month-cell').first());
  await drag(
    { x: ch.left + 10, y: ch.top + ch.height / 2 },
    { x: ch.left + 10 + day.width * (ch.left + day.width * 1.5 < (await box(s)).right ? 1 : -1), y: ch.top + ch.height / 2 },
  );
  check('in the month an appointment moves by days', await logged(new RegExp(`^Moved ${chipText.replace(/[()]/g, '.')}`)), (await lines()).join(' | '));

  // Saving to a server.
  const saving = section('saving');
  const server = saving.locator('.mx-scheduler');
  await server.locator('.mx-scheduler__appointment').first().waitFor({ timeout: 5000 });
  await server.scrollIntoViewIfNeeded();
  await server.locator('.mx-scheduler__scroll').evaluate((el) => (el.scrollTop = 0));
  const gs = await geometry(server);
  const move = async () => {
    const item = server.locator('.mx-scheduler__appointment', { hasText: 'Design review' }).first();
    const r = await box(item);
    const y = r.top + r.height / 2;
    await page.mouse.move(r.left + r.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(r.left + r.width / 2, y + 6, { steps: 2 });
    await page.mouse.move(r.left + r.width / 2, y + gs.h * 2, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(150);
    const waiting = await item.evaluate((el) => el.hasAttribute('data-saving'));
    await page.waitForTimeout(1300);
    return { waiting, moved: (await box(item)).top - r.top, said: await saving.locator('.sched-log').textContent() };
  };
  const first = await move();
  check(
    'a change waits for the server: it stays where it was put, locked',
    first.waiting && Math.abs(first.moved - gs.h * 2) < 3 && /^Saved/.test(first.said),
    JSON.stringify(first),
  );
  await move();
  const third = await move();
  check('a change the server refuses goes back, and is told', Math.abs(third.moved) < 3 && /^Not saved/.test(third.said), JSON.stringify(third));

  // A form of one's own.
  const custom = section('form').locator('.mx-scheduler');
  await custom.scrollIntoViewIfNeeded();
  await custom.locator('.mx-scheduler__scroll').evaluate((el) => (el.scrollTop = 0));
  await boxOf(custom, 'Design review').dblclick();
  await form.waitFor();
  const own = await form.evaluate((el) => ({
    title: el.querySelector('.mx-form__title, [class*="title"]')?.textContent,
    room: !!el.textContent.includes('Room'),
    description: el.textContent.includes('Description'),
  }));
  check(
    'onFormOpening adds a field and takes one away',
    own.room && !own.description && /Edit Design review/.test(await form.textContent()),
    JSON.stringify(own),
  );
  await form.getByRole('button', { name: 'Cancel' }).click();

  // Rules.
  const rules = section('rules');
  const ruled = rules.locator('.mx-scheduler');
  await ruled.scrollIntoViewIfNeeded();
  await ruled.locator('.mx-scheduler__scroll').evaluate((el) => (el.scrollTop = 0));
  const gr = await geometry(ruled);
  const standup2 = boxOf(ruled, 'Team standup');
  const r0 = await box(standup2);
  // From 9:00 to 12:00: over lunch.
  await drag({ x: r0.left + r0.width / 2, y: r0.top + r0.height / 2 }, { x: r0.left + r0.width / 2, y: r0.top + r0.height / 2 + gr.h * 6 }, { hold: true });
  const invalid = await ruled.locator('.mx-scheduler__appointment[data-invalid]').count();
  await page.mouse.up();
  await page.waitForTimeout(200);
  const r1 = await box(standup2);
  check(
    'a place an event forbids shows so, and the drop does nothing',
    invalid === 1 && Math.abs(r1.top - r0.top) < 2 && (await rules.locator('.sched-log').textContent()) === 'Not over lunch.',
    `${invalid} ${r1.top - r0.top}`,
  );
  check('an appointment locked by its own field cannot be taken', !(await boxOf(ruled, 'Lunch with Ana').evaluate((el) => el.hasAttribute('data-draggable'))));

  // Programmatically.
  const code = section('code');
  await code.getByRole('button', { name: 'Add tomorrow 11:00' }).click();
  await page.waitForTimeout(150);
  await code.getByRole('button', { name: 'An hour later' }).click();
  await page.waitForTimeout(150);
  const said = await code.locator('.sched-log').textContent();
  await code.getByRole('button', { name: 'Delete it' }).click();
  await page.waitForTimeout(150);
  check('add, change and delete programmatically', said === 'Moved an hour later' && (await code.locator('.sched-log').textContent()) === 'Deleted', said);
  await code.getByRole('button', { name: 'New in the form' }).click();
  await form.waitFor();
  check('showAppointmentForm opens the form at the time given', /3:00|15:00/.test(await form.locator('input').nth(1).inputValue()));
  await page.keyboard.press('Escape');
}
