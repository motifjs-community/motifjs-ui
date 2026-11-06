import { designLanguages, designLanguageThemes } from '../languages.mjs';
import { sweepBox, sweepColours } from '../scheduler-ink-sweep.mjs';

/** Real-browser checks of the Scheduler's resources page: groups and their heads, moving between groups by mouse and by keys, availability, a data source of resources, right to left, axe. */
export default async function ({ page, base, check, axeSource, box }) {
  // A fixed day: Wednesday 28 October 2026 (the clock runs on: a drag tells its end from a click by the time).
  await page.clock.install({ time: new Date('2026-10-28T07:00:00Z') });
  await page.clock.resume();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + 'scheduler/resources', { waitUntil: 'load' });
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

  // Resources colour the bookings; the tooltip names them.
  const plain = section('resources').locator('.mx-scheduler');
  await plain.locator('.mx-scheduler__appointment').first().waitFor();
  const colours = async () => plain.locator('.mx-scheduler__appointment', { hasText: 'Team standup' }).first().evaluate((el) => el.style.getPropertyValue('--_color'));
  const byRoom = await colours();
  await section('resources').getByRole('radio', { name: 'People' }).click();
  await page.waitForTimeout(150);
  check('the colour comes from the kind marked to colour, and follows the choice', byRoom === '#1565c0' && (await colours()) === '#ad1457', `${byRoom} → ${await colours()}`);
  await plain.locator('.mx-scheduler__appointment', { hasText: 'Team standup' }).first().click();
  const tip = page.locator('.mx-scheduler__tooltip-popup:popover-open');
  await tip.waitFor();
  const tipText = await tip.textContent();
  check('the tooltip names the room and the people', /Room\s*Atlas/.test(tipText) && /People\s*Ana Silva\s*Ben Okafor/.test(tipText), tipText);
  await axe('the tooltip with its resources', tip);
  await page.keyboard.press('Escape');

  // Nested groups: a room over its people, a cell named by its group.
  const groups = section('groups');
  const g = groups.locator('.mx-scheduler');
  await g.scrollIntoViewIfNeeded();
  const heads = await g.evaluate((el) => [...el.querySelectorAll('.mx-scheduler__groups')].map((row) => [...row.querySelectorAll('.mx-scheduler__group-head')].map((h) => h.textContent.trim())));
  check(
    'the heads: the rooms over their own people',
    JSON.stringify(heads) === JSON.stringify([['Atlas', 'Bosphorus', 'Cappadocia'], ['Ana Silva', 'Ben Okafor', 'Cem Yılmaz', 'Dana Ivanova']]),
    JSON.stringify(heads),
  );
  const atlas = await box(g.locator('.mx-scheduler__group-head', { hasText: 'Atlas' }));
  const ana = await box(g.locator('.mx-scheduler__group-head', { hasText: 'Ana Silva' }));
  const ben = await box(g.locator('.mx-scheduler__group-head', { hasText: 'Ben Okafor' }));
  check('a room’s head spans its people’s columns', Math.abs(atlas.left - ana.left) < 0.5 && Math.abs(atlas.right - ben.right) < 0.5, JSON.stringify({ atlas, ana, ben }));
  const label = await g.locator('.mx-scheduler__cells [data-cell="1:2"]').getAttribute('aria-label');
  check('a cell reads its group before its time', /^Atlas, Ben Okafor, Wednesday/.test(label), label);

  // The divider: every language draws it or leaves it out; drawn, it is centred on the edge of the group's column.
  const dividers = [];
  for (const designLanguage of designLanguages) {
    await page.evaluate((i) => (document.documentElement.dataset.designLanguage = i), designLanguage);
    await page.waitForTimeout(150);
    dividers.push(
      await g.evaluate((el, i) => {
        const cell = el.querySelector('.mx-scheduler__cells .mx-scheduler__cell[data-edge="outer"]');
        const line = getComputedStyle(cell, '::before');
        if (line.display === 'none' || parseFloat(line.width) === 0) return { i, drawn: false };
        // Its centre: where it stands, moved by its translate (a share of its width), half its width on.
        const r = cell.getBoundingClientRect();
        const width = parseFloat(line.width);
        const shift = line.translate.split(' ')[0];
        const moved = shift.endsWith('%') ? (parseFloat(shift) / 100) * width : parseFloat(shift) || 0;
        const centre = r.left + parseFloat(line.left) + moved + width / 2;
        return { i, drawn: true, width, off: Math.abs(centre - r.left) };
      }, designLanguage),
    );
  }
  await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));
  check('the group divider is drawn centred on the column edge, or not at all', dividers.every((d) => !d.drawn || d.off <= 0.5), JSON.stringify(dividers));

  // A drag by the mouse to another person: only that person changes.
  const standup = g.locator('.mx-scheduler__appointment', { hasText: 'Design review' }).first();
  await standup.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const from = await box(standup);
  const target = await box(g.locator('.mx-scheduler__cells [data-cell="1:4"]'));
  await page.mouse.move(from.left + from.width / 2, from.top + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.left + from.width / 2 + 6, from.top + from.height / 2 + 4, { steps: 2 });
  await page.mouse.move(target.left + target.width / 2, from.top + from.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const moved = await g.locator('.mx-scheduler__appointment', { hasText: 'Design review' }).evaluateAll((els) => els.map((e) => e.style.getPropertyValue('--_column')));
  check('dragged to Ben, the booking leaves Ana for Ben', JSON.stringify(moved) === JSON.stringify(['1']), JSON.stringify(moved));

  // By the keys: Alt + Shift + the arrow to the next group, Enter saves. Dana is in Cappadocia: the room goes with her.
  const supplierColumns = () => g.locator('.mx-scheduler__appointment', { hasText: 'Supplier call' }).evaluateAll((els) => els.map((e) => e.style.getPropertyValue('--_column')));
  const beforeKeys = await supplierColumns();
  await g.locator('.mx-scheduler__appointment', { hasText: 'Supplier call' }).first().focus();
  await page.keyboard.press('Alt+Shift+ArrowRight');
  const said = await g.locator('.mx-scheduler__live').textContent();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const afterKeys = await supplierColumns();
  check(
    'Alt + Shift + Right moves a booking to the next group (and its room with it); it says where',
    JSON.stringify(beforeKeys) === JSON.stringify(['2']) && JSON.stringify(afterKeys) === JSON.stringify(['3']) && /Cappadocia, Dana Ivanova/.test(said),
    `${JSON.stringify(beforeKeys)} → ${JSON.stringify(afterKeys)}; ${said}`,
  );

  // By date: the dates over the groups; the month by group.
  await groups.locator('.mx-switch').first().click();
  await groups.locator('.mx-scheduler__view-button', { hasText: 'Work week' }).click();
  await page.waitForTimeout(250);
  const byDate = await g.evaluate((el) => {
    const head = el.querySelector('.mx-scheduler__head');
    const dates = head.querySelector('.mx-scheduler__dates').getBoundingClientRect();
    const rows = head.querySelector('.mx-scheduler__group-rows').getBoundingClientRect();
    return { dates: el.querySelectorAll('.mx-scheduler__date').length, below: rows.top >= dates.bottom - 0.5, columns: el.querySelectorAll('.mx-scheduler__cells .mx-scheduler__row:first-child > .mx-scheduler__cell').length };
  });
  check('by date: five dates over the groups, 4 people a day', byDate.dates === 5 && byDate.below && byDate.columns === 20, JSON.stringify(byDate));
  await axe('the groups by date', groups);
  await groups.locator('.mx-switch').first().click();
  await groups.locator('.mx-scheduler__view-button', { hasText: 'Month' }).click();
  await page.waitForTimeout(250);
  const month = await g.evaluate((el) => ({
    weekdays: el.querySelectorAll('.mx-scheduler__weekday-name').length,
    perWeek: el.querySelector('.mx-scheduler__week-row').children.length,
  }));
  check('the month by group: every person has a week of their own', month.weekdays === 28 && month.perWeek === 28, JSON.stringify(month));
  await axe('the month by group', groups);

  // Every language and theme: the heads, the boxes in their resources' colours and the blocked cells read (axe contrast).
  const low = [];
  await page.addScriptTag({ content: axeSource });
  for (const designLanguage of designLanguages) {
    for (const theme of designLanguageThemes[designLanguage].themes) {
      await page.evaluate(([i, t]) => {
        document.documentElement.dataset.designLanguage = i;
        document.documentElement.dataset.theme = t;
      }, [designLanguage, theme]);
      await page.waitForTimeout(100);
      for (const id of ['groups', 'availability']) {
        const found = await section(id).evaluate(async (el) => (await window.axe.run(el, { runOnly: ['color-contrast'] })).violations.flatMap((v) => v.nodes.map((n) => n.target.join(' '))));
        if (found.length) low.push(`${designLanguage} ${theme} ${id}: ${found.slice(0, 2).join(' | ')}`);
      }
    }
  }
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-design-language');
    document.documentElement.removeAttribute('data-theme');
  });
  check('in every language and theme the heads and the boxes read on their fills (axe contrast)', low.length === 0, low.join(' ;; '));

  // The head template.
  const own = await section('header').locator('.sched-person').count();
  check('a template draws each person’s head', own === 4, String(own));

  // Availability: lunch is blocked, a drag there shows it may not go and leaves the booking.
  const avail = section('availability').locator('.mx-scheduler');
  await avail.scrollIntoViewIfNeeded();
  await avail.locator('.mx-scheduler__scroll').evaluate((el) => (el.scrollTop = 0));
  const blocked = await avail.evaluate((el) => {
    const cells = [...el.querySelectorAll('.mx-scheduler__cells .mx-scheduler__cell[data-blocked]')];
    return { count: cells.length, lunch: cells.filter((c) => /not available: Lunch/.test(c.getAttribute('aria-label'))).length, closed: cells.filter((c) => /Closed for cleaning/.test(c.getAttribute('aria-label'))).length };
  });
  check('lunch is blocked in every room, Cappadocia’s Thursday whole, and the cells say so', blocked.lunch === 12 && blocked.closed === 20, JSON.stringify(blocked));
  const supplier = avail.locator('.mx-scheduler__appointment', { hasText: 'Supplier call' }).first();
  const s0 = await box(supplier);
  const lunch = await box(avail.locator('.mx-scheduler__cells [data-cell="2:8"]'));
  await page.mouse.move(s0.left + 10, s0.top + s0.height / 2);
  await page.mouse.down();
  await page.mouse.move(s0.left + 16, s0.top + s0.height / 2 + 6, { steps: 2 });
  await page.mouse.move(lunch.left + 10, lunch.top + 4, { steps: 10 });
  const over = await avail.evaluate((el) => {
    const draft = el.querySelector('.mx-scheduler__appointment[data-draft]');
    const mark = draft?.querySelector('.mx-scheduler__drop-mark');
    return { invalid: draft?.dataset.invalid ?? '', mark: !!mark && !mark.hidden };
  });
  const log = await section('availability').locator('.sched-log').textContent();
  await page.mouse.up();
  await page.waitForTimeout(250);
  const stayed = await box(avail.locator('.mx-scheduler__appointment', { hasText: 'Supplier call' }).first());
  check('dragged over lunch, the box shows it may not go there and goes back', over.invalid === 'true' && over.mark && /Not free/.test(log) && Math.abs(stayed.top - s0.top) < 1, JSON.stringify({ over, log, s0: s0.top, stayed: stayed.top }));
  const marks = [];
  for (const designLanguage of designLanguages) {
    await page.evaluate((i) => (document.documentElement.dataset.designLanguage = i), designLanguage);
    await page.waitForTimeout(100);
    marks.push(await avail.evaluate((el) => [...el.querySelectorAll('.mx-scheduler__drop-mark')].map((m) => getComputedStyle(m).display !== 'none')));
  }
  await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));
  check('no mark shows on a box that may go where it is', marks.every((m) => m.every((shown) => !shown)), JSON.stringify(marks));
  await axe('availability', section('availability'));

  // A data source of rooms: filtered, the groups follow and the bookings are asked for the rooms shown.
  const fromSource = section('data');
  const fs = fromSource.locator('.mx-scheduler');
  await fs.scrollIntoViewIfNeeded();
  await fs.locator('.mx-scheduler__group-head').first().waitFor();
  await page.waitForTimeout(900);
  const roomsBefore = await fs.locator('.mx-scheduler__group-head').count();
  await fromSource.getByText('Only Atlas and Bosphorus').click();
  await page.waitForTimeout(1600);
  const roomsAfter = await fs.locator('.mx-scheduler__group-head').count();
  const asked = await fromSource.locator('.sched-log').textContent();
  check('the rooms follow their data source, and the bookings are asked for those rooms', roomsBefore === 3 && roomsAfter === 2 && /"value":\[1,2\]/.test(asked), `${roomsBefore} → ${roomsAfter}: ${asked}`);

  // Right to left: the groups run from the right.
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await page.waitForTimeout(200);
  await groups.locator('.mx-scheduler__view-button', { hasText: 'Day' }).click();
  await page.waitForTimeout(200);
  const rtl = await g.evaluate((el) => {
    const [a, b] = [...el.querySelectorAll('.mx-scheduler__groups:first-child .mx-scheduler__group-head')].map((h) => h.getBoundingClientRect().left);
    return { first: a, second: b };
  });
  check('right to left, the first group stands on the right', rtl.first > rtl.second, JSON.stringify(rtl));
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));

  // Any colour reads: 24 hues at 5 lightnesses, 6 greys and the docs' colours, on a box, a bar and a chip, at rest,
  // focused, open, past, under the pointer and open under it, in every language and theme (title and time, 4.5:1).
  await g.locator('.mx-scheduler__cell[tabindex="0"]').first().focus();
  await page.keyboard.press('m');
  await page.waitForTimeout(200);
  const sweep = sweepColours(['', '#1565c0', '#2e7d32', '#6a1b9a', '#ad1457', '#ef6c00', '#00838f', '#455a64', '#7c4dff', '#c62828']);
  const kinds = {
    box: 'section[aria-labelledby="resources"] .mx-scheduler__appointment[data-kind="timed"]:not([data-short])',
    bar: 'section[aria-labelledby="resources"] .mx-scheduler__appointment[data-kind="bar"]',
    chip: 'section[aria-labelledby="groups"] .mx-scheduler__appointment[data-kind="chip"]',
  };
  const unread = [];
  let least = Infinity;
  for (const designLanguage of designLanguages) {
    for (const theme of designLanguageThemes[designLanguage].themes) {
      await page.evaluate(([i, t]) => {
        document.documentElement.dataset.designLanguage = i;
        document.documentElement.dataset.theme = t;
      }, [designLanguage, theme]);
      await page.waitForTimeout(100);
      for (const [kind, selector] of Object.entries(kinds)) {
        const worst = await sweepBox(page, selector, sweep);
        for (const part of ['title', 'time']) {
          least = Math.min(least, worst[part].ratio);
          if (worst[part].ratio < 4.5) unread.push(`${designLanguage} ${theme} ${kind} ${part}: ${worst[part].ratio.toFixed(2)} on ${worst[part].colour} (${worst[part].state})`);
        }
      }
    }
  }
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-design-language');
    document.documentElement.removeAttribute('data-theme');
  });
  check(`a box's title and time read on any colour, in every language, theme and state (least ${least.toFixed(2)}:1)`, unread.length === 0, unread.join(' ;; '));
}
