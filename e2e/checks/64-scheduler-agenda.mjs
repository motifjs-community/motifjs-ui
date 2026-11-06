import { designLanguages } from '../languages.mjs';

/** Real-browser checks of the Scheduler's agenda page: the days and their rows, its length, the keys and the pointer, the tooltip and the form, groups, templates, the empty text, right to left, every language, axe. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.clock.install({ time: new Date(2026, 9, 28, 8, 0) });
  await page.clock.resume();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + 'scheduler/agenda', { waitUntil: 'load' });
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

  // The coming week: a day for each date with appointments, each with its rows in time order.
  const main = section('agenda');
  const s = main.locator('.mx-scheduler');
  await s.locator('[role="option"]').first().waitFor();
  const days = await s.evaluate((el) =>
    [...el.querySelectorAll('.mx-scheduler__agenda-group')].map((g) => ({
      label: g.getAttribute('aria-label'),
      rows: [...g.querySelectorAll('[role="option"]')].map((o) => o.textContent.trim()),
    })),
  );
  check('the agenda: days with appointments only, each with its rows', days.length > 0 && days.length <= 7 && days.every((d) => d.rows.length > 0) && /^Wednesday/.test(days[0].label), JSON.stringify(days.map((d) => [d.label, d.rows.length])));
  const whole = days.flatMap((d) => d.rows).some((r) => /All day/.test(r));
  check('one that takes the day says so', whole, JSON.stringify(days[0].rows));
  const lined = await s.evaluate((el) => {
    const times = [...el.querySelectorAll('.mx-scheduler__agenda-time')].map((t) => t.getBoundingClientRect().left);
    const texts = [...el.querySelectorAll('.mx-scheduler__agenda-text')].map((t) => t.getBoundingClientRect().left);
    return { times: Math.max(...times) - Math.min(...times), texts: Math.max(...texts) - Math.min(...texts) };
  });
  check('the times and the texts line up in their columns', lined.times <= 0.5 && lined.texts <= 0.5, JSON.stringify(lined));

  // Its length: three days.
  await main.locator('.mx-number-box input, input').first().fill('3');
  await main.locator('.mx-number-box input, input').first().press('Enter');
  await page.waitForTimeout(250);
  const title = await s.locator('.mx-scheduler__title').first().textContent();
  const three = await s.locator('.mx-scheduler__agenda-group').count();
  check('agendaDuration: three days shown', /28\s*–\s*30/.test(title) && three <= 3 && three > 0, `${title}; ${three}`);

  // The keys: Down moves to the next row (it is the selected one), Space shows the tooltip, Enter the form.
  const rows = s.locator('[role="option"]');
  await rows.first().focus();
  await page.keyboard.press('ArrowDown');
  const second = await page.evaluate(() => document.activeElement?.dataset.piece);
  const selected = await s.locator('[role="option"][aria-selected="true"]').evaluateAll((els) => els.map((e) => e.dataset.piece));
  check('Down moves to the next row, and selects it', second === (await rows.nth(1).getAttribute('data-piece')) && selected.length === 1 && selected[0] === second, `${second}; ${JSON.stringify(selected)}`);
  await page.keyboard.press('End');
  const last = await page.evaluate(() => document.activeElement?.dataset.piece);
  check('End goes to the last row', last === (await rows.last().getAttribute('data-piece')), last);
  await page.keyboard.press('Home');
  await page.keyboard.press(' ');
  const tip = page.locator('.mx-scheduler__tooltip-popup:popover-open');
  await tip.waitFor();
  check('Space shows the tooltip', /Team standup|Conference|Code freeze|Workshop|Design review/.test(await tip.textContent()), await tip.textContent());
  await axe('the agenda’s tooltip', tip);
  await page.keyboard.press('Escape');
  await rows.first().focus();
  await page.keyboard.press('Enter');
  const form = page.locator('.mx-scheduler__form');
  await form.waitFor();
  check('Enter opens the form', await form.isVisible());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // The pointer: a click shows the tooltip of that row.
  await rows.nth(1).click();
  await tip.waitFor();
  check('a click on a row shows its tooltip and selects it', (await rows.nth(1).getAttribute('aria-selected')) === 'true');
  await page.keyboard.press('Escape');
  await axe('the agenda', main);

  // Nothing in the days shown: the list goes and the text says so.
  for (let i = 0; i < 12 && (await s.locator('[role="option"]').count()); i++) {
    await s.locator('.mx-scheduler__step').nth(1).click();
    await page.waitForTimeout(150);
  }
  const empty = await s.evaluate((el) => ({ text: el.querySelector('.mx-scheduler__agenda-empty:not([hidden])')?.textContent.trim() ?? '', list: !!el.querySelector('[role="listbox"]:not([hidden])') }));
  check('days with nothing: "No appointments" and no list', empty.text === 'No appointments' && !empty.list, JSON.stringify(empty));
  await axe('the empty agenda', main);

  // By resource: each team's days under its name.
  const grouped = section('groups');
  const g = grouped.locator('.mx-scheduler');
  await g.scrollIntoViewIfNeeded();
  await g.locator('[role="option"]').first().waitFor();
  const teams = await g.evaluate((el) => [...el.querySelectorAll('.mx-scheduler__agenda-resource:not([hidden])')].map((h) => h.textContent.trim()));
  const named = await g.locator('.mx-scheduler__agenda-group').first().getAttribute('aria-label');
  check('by resource: each team, its days under it; a day names its team', JSON.stringify(teams) === JSON.stringify(['Field service', 'Workshop', 'Support desk']) && /^Field service, Wednesday/.test(named), `${JSON.stringify(teams)}; ${named}`);
  await axe('the agenda by resource', grouped);

  // Templates: the row's own content, the tooltip's own content and its button.
  const templates = section('templates');
  const t = templates.locator('.mx-scheduler');
  await t.scrollIntoViewIfNeeded();
  await t.locator('[role="option"] .sched-agenda-row').first().waitFor();
  const row = t.locator('[role="option"]').first();
  const own = await row.evaluate((el) => ({ text: el.querySelector('.sched-agenda-row').textContent, role: el.getAttribute('role'), dot: !!el.querySelector('.mx-scheduler__agenda-dot') }));
  check('a row template draws the row (the person after the job); the row stays an option', /Ana Silva|Ben|Cem|Dana|Emil|Fatma|Gus/.test(own.text) && own.role === 'option' && !own.dot, JSON.stringify(own));
  await row.click();
  const ownTip = page.locator('.mx-scheduler__tooltip-popup:popover-open .sched-tip');
  await ownTip.waitFor();
  await ownTip.getByRole('button', { name: 'Open' }).click();
  await form.waitFor();
  check('the tooltip of its own opens the form', await form.isVisible());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await axe('agenda templates', templates);

  // Right to left: the time stands on the right of the text.
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await page.waitForTimeout(200);
  const rtl = await g.evaluate((el) => {
    const r = el.querySelector('[role="option"]');
    return r.querySelector('.mx-scheduler__agenda-time').getBoundingClientRect().left > r.querySelector('.mx-scheduler__agenda-text').getBoundingClientRect().left;
  });
  check('right to left: the time on the right, the text on its left', rtl);
  await axe('the agenda right to left', grouped);
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));

  // Every language: the colour mark (where drawn) and the day's number stand in the middle of their line.
  const marks = [];
  for (const designLanguage of designLanguages) {
    await page.evaluate((i) => (document.documentElement.dataset.designLanguage = i), designLanguage);
    await page.waitForTimeout(200);
    marks.push(
      await g.evaluate((el, i) => {
        const row = el.querySelector('[role="option"]');
        const mid = (n) => {
          const r = n.getBoundingClientRect();
          return r.top + r.height / 2;
        };
        const dot = row.querySelector('.mx-scheduler__agenda-dot');
        const text = row.querySelector('.mx-scheduler__agenda-text');
        const day = el.querySelector('.mx-scheduler__agenda-day');
        const number = day.querySelector('.mx-scheduler__day-number');
        const date = day.querySelector('.mx-scheduler__agenda-date');
        const drawn = getComputedStyle(dot).display !== 'none';
        return { i, dot: drawn ? Math.abs(mid(dot) - mid(text)) : null, day: Math.abs(mid(number) - mid(date)) };
      }, designLanguage),
    );
  }
  await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));
  check('in every language the colour mark and the day’s number stand in the middle of their line', marks.every((m) => (m.dot === null || m.dot <= 0.5) && m.day <= 0.5), JSON.stringify(marks));
}
