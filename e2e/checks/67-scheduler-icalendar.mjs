/**
 * Real-browser checks of the Scheduler's iCalendar page: exporting the days shown and all of them (RFC 5545: lines
 * folded at 75 octets, CRLF, VTIMEZONE, RRULE, EXDATE, RECURRENCE-ID) and downloading the file; reading a
 * file in (a Windows zone by its VTIMEZONE, a day left out, an all-day event, DURATION) by the pointer and the keys,
 * and again (changing, not adding); printing (print emulation: the bar left out, nothing scrolled, the colours kept,
 * `print()` printing it alone); right to left; axe in light and dark.
 */
export default async function ({ page, base, check, axeSource }) {
  await page.clock.install({ time: new Date(2026, 9, 28, 8, 0) });
  await page.clock.resume();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + 'scheduler/icalendar', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => (m.type() === 'error' || (m.type() === 'warning' && /\[motifjs\]|MJX\d/.test(m.text()))) && errors.push(m.text()));
  const section = (id) => page.locator(`section[aria-labelledby="${id}"]`);
  const axe = async (label, scope) => {
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await page.waitForTimeout(150);
      await page.addScriptTag({ content: axeSource });
      const violations = await scope.evaluate(async (el) => (await window.axe.run(el)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
      check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  };

  // Export.
  const ex = section('export');
  await ex.locator('.mx-scheduler__appointment').first().waitFor();
  await ex.getByRole('button', { name: 'Export the days shown' }).click();
  const shown = await ex.locator('textarea').inputValue();
  await ex.getByRole('button', { name: 'Export all' }).click();
  const all = await ex.locator('textarea').inputValue();
  const raw = await page.evaluate(async () => {
    const a = document.querySelector('section[aria-labelledby="export"] a[download]');
    return { href: a?.getAttribute('href') ?? '', name: a?.getAttribute('download'), text: a ? await (await fetch(a.href)).text() : '' };
  });
  const lines = raw.text.split('\r\n');
  check('the file is CRLF lines of 75 octets at most, a VCALENDAR', raw.text.endsWith('END:VCALENDAR\r\n') && !/[^\r]\n/.test(raw.text) && lines.every((l) => new TextEncoder().encode(l).length <= 75), lines.find((l) => new TextEncoder().encode(l).length > 75) ?? '');
  check('the download link carries it as a file', raw.href.startsWith('blob:') && raw.name === 'team-calendar.ics');
  check('a series with its rule and its left-out days, the one moved apart under its UID and RECURRENCE-ID, a VTIMEZONE', /RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR/.test(all) && /EXDATE;TZID=/.test(all) && /RECURRENCE-ID;TZID=/.test(all) && /BEGIN:VTIMEZONE/.test(all) && /DTSTART;VALUE=DATE:/.test(all), all.slice(0, 200));
  const count = (t) => (t.match(/BEGIN:VEVENT/g) ?? []).length;
  check('the days shown are fewer than all', count(shown) > 0 && count(shown) <= count(all), `${count(shown)} / ${count(all)}`);
  await axe('the export example', ex);

  // Import, by the keys.
  const im = section('read');
  const out = im.locator('output');
  await im.getByRole('button', { name: 'Read in' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  check('reading the file in adds its three events', /^3 added, 0 changed/.test(await out.textContent()), await out.textContent());
  const boxes = await im.locator('.mx-scheduler__appointment').evaluateAll((els) => els.map((e) => e.textContent.trim()));
  const sync = boxes.filter((t) => /Sync with Berlin/.test(t));
  const expected = await page.evaluate(() => {
    // 10:00 in Berlin on this Monday, on the browser's clock.
    const today = new Date();
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
    const wall = Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate(), 10);
    const berlin = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    const parts = Object.fromEntries(berlin.formatToParts(new Date(wall)).map((p) => [p.type, p.value]));
    const offset = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute) - wall;
    return new Intl.DateTimeFormat(document.documentElement.lang || 'en', { hour: 'numeric', minute: '2-digit' }).format(new Date(wall - offset));
  });
  check('the series in its zone (its VTIMEZONE) at its time on this clock, the day left out missing', sync.length === 2 && sync.every((t) => t.includes(expected.replace(/\s/g, ' ').split(' ')[0])), `${expected}: ${JSON.stringify(sync)}`);
  check('the all-day event and the one with a DURATION', boxes.some((t) => /Team offsite/.test(t)) && boxes.some((t) => /Call with the customer/.test(t)), JSON.stringify(boxes));
  await im.getByRole('button', { name: 'Read in' }).click();
  await page.waitForTimeout(500);
  check('reading it in again changes them, adding none', /^0 added, 3 changed/.test(await out.textContent()), await out.textContent());
  await axe('the import example', im);

  // Print.
  const pr = section('print');
  const ps = pr.locator('.mx-scheduler');
  await ps.locator('.mx-scheduler__appointment').first().waitFor();
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.waitForTimeout(300);
  const paper = await ps.evaluate((el) => {
    const scroll = el.querySelector('.mx-scheduler__scroll');
    return {
      printing: el.hasAttribute('data-printing'),
      bar: !!el.querySelector('.mx-scheduler__bar') && getComputedStyle(el.querySelector('.mx-scheduler__bar')).display !== 'none',
      clipped: scroll ? scroll.scrollHeight - scroll.clientHeight : -1,
      colours: getComputedStyle(el).printColorAdjust,
      now: [...el.querySelectorAll('.mx-scheduler__now')].some((n) => n.getClientRects().length > 0),
      height: Math.round(el.getBoundingClientRect().height),
    };
  });
  check('on paper: printing, the bar left out, every hour shown (nothing scrolled), the colours kept, no now line', paper.printing && !paper.bar && paper.clipped <= 1 && paper.colours === 'exact' && !paper.now, JSON.stringify(paper));
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await page.emulateMedia({ media: 'screen' });
  await page.waitForTimeout(300);
  const back = await ps.evaluate((el) => ({ printing: el.hasAttribute('data-printing'), bar: !!el.querySelector('.mx-scheduler__bar') }));
  check('after printing it is as it was', !back.printing && back.bar, JSON.stringify(back));
  check('onPrinted says the dialog closed', /closed/.test(await pr.locator('output').textContent()), await pr.locator('output').textContent());
  // print(): only this scheduler, marked while the dialog is open.
  const alone = await page.evaluate(async () => {
    let seen = null;
    const real = window.print;
    window.print = () => {
      const el = document.querySelector('section[aria-labelledby="print"] .mx-scheduler');
      seen = { page: document.documentElement.hasAttribute('data-mx-print-one'), one: el.hasAttribute('data-print-one'), printing: el.hasAttribute('data-printing') };
    };
    [...document.querySelectorAll('section[aria-labelledby="print"] button')].find((b) => b.textContent.trim() === 'Print').click();
    await new Promise((r) => setTimeout(r, 300));
    window.print = real;
    return { seen, after: document.documentElement.hasAttribute('data-mx-print-one') };
  });
  check('print() marks the page and the scheduler while the dialog is open, and clears them after', !!alone.seen && alone.seen.page && alone.seen.one && alone.seen.printing && !alone.after, JSON.stringify(alone));
  // A timeline on paper: built whole.
  await ps.locator('.mx-scheduler__view-button', { hasText: 'Timeline week' }).click();
  await page.waitForTimeout(300);
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.waitForTimeout(400);
  const line = await ps.evaluate((el) => {
    const scroll = el.querySelector('.mx-scheduler__scroll');
    return { clipped: scroll.scrollHeight - scroll.clientHeight, rows: el.querySelectorAll('.mx-scheduler__line').length };
  });
  check('a timeline on paper shows all its rows, nothing scrolled down', line.clipped <= 1 && line.rows >= 1, JSON.stringify(line));
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await page.emulateMedia({ media: 'screen' });

  // Right to left.
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await page.waitForTimeout(250);
  await axe('the imported scheduler right to left', im);
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));
  check('no errors or MotifJS warnings', errors.length === 0, errors.slice(0, 3).join(' | '));
}
