/**
 * Real-browser checks of the Scheduler's big data page: 1,000 resources × 10,000 appointments in a
 * timeline week and 200 groups in a week. Only what is in view is built; the first show, the frame
 * rate while scrolling both ways and while dragging, and the elements built are measured against
 * limits; the keys reach the last row; axe.
 */
export default async function ({ page, base, check, axeSource }) {
  await page.clock.install({ time: new Date(2026, 9, 28, 10, 0) });
  await page.clock.resume();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + 'scheduler/big-data', { waitUntil: 'load' });
  const section = (id) => page.locator(`section[aria-labelledby="${id}"]`);
  const numbers = {};

  // The first show: from the view's button to the frame after its first appointments are on the page.
  const show = (scheduler, text) =>
    scheduler.locator('.mx-scheduler__view-button', { hasText: text }).first().evaluate(async (el) => {
      const start = performance.now();
      el.click();
      await new Promise((done) => {
        const look = () => {
          if (el.closest('.mx-scheduler').querySelector('.mx-scheduler__scroll .mx-scheduler__appointment')) requestAnimationFrame(() => requestAnimationFrame(done));
          else requestAnimationFrame(look);
        };
        look();
      });
      return Math.round(performance.now() - start);
    });
  // Frames while it scrolls a step a frame: the frame rate and the slowest frame.
  const scrolling = (scroller, dx, dy, steps) =>
    scroller.evaluate(
      (el, [dx, dy, steps]) =>
        new Promise((done) => {
          const times = [];
          const step = (t) => {
            times.push(t);
            el.scrollLeft += dx;
            el.scrollTop += dy;
            if (times.length < steps) requestAnimationFrame(step);
            else {
              const gaps = times.slice(1).map((x, i) => x - times[i]);
              done({ fps: Math.round(((times.length - 1) / (times[times.length - 1] - times[0])) * 1000), worst: Math.round(Math.max(...gaps)) });
            }
          };
          requestAnimationFrame(step);
        }),
      [dx, dy, steps],
    );
  const dragging = async (scheduler) => {
    const target = scheduler.locator('.mx-scheduler__scroll .mx-scheduler__appointment').nth(1);
    await target.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
    await page.waitForTimeout(200);
    const r = await target.boundingBox();
    await page.evaluate(() => {
      window.__frames = [];
      const run = (window.__run = (window.__run ?? 0) + 1);
      const tick = (t) => {
        if (window.__run !== run) return;
        window.__frames.push(t);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await page.mouse.down();
    for (let i = 0; i < 50; i++) await page.mouse.move(r.x + r.width / 2 + i * 4, r.y + r.height / 2 + i * 2);
    const result = await page.evaluate(() => {
      window.__run++;
      const f = window.__frames;
      const gaps = f.slice(1).map((t, i) => t - f[i]);
      return { fps: Math.round(((f.length - 1) / (f[f.length - 1] - f[0])) * 1000), worst: Math.round(Math.max(...gaps)) };
    });
    await page.keyboard.press('Escape');
    await page.mouse.up();
    return result;
  };

  // 1,000 resources × 10,000 appointments.
  const timeline = section('timeline');
  const t = timeline.locator('.mx-scheduler');
  await t.locator('.mx-scheduler__line .mx-scheduler__appointment').first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(500);
  await show(t, 'Timeline day');
  await page.waitForTimeout(500);
  numbers.timelineFirstShow = await show(t, 'Timeline week');
  await page.waitForTimeout(500);
  const built = await t.evaluate((el) => ({
    elements: el.querySelectorAll('*').length,
    rows: el.querySelectorAll('.mx-scheduler__line').length,
    cells: el.querySelectorAll('.mx-scheduler__line [data-cell]').length,
    boxes: el.querySelectorAll('.mx-scheduler__line .mx-scheduler__appointment').length,
  }));
  numbers.timelineElements = built.elements;
  check('the timeline week of 1,000 rows shows in under 2.5 s', numbers.timelineFirstShow < 2500, `${numbers.timelineFirstShow} ms`);
  check('only what is in view is built: under 60 rows and 3,000 elements', built.rows < 60 && built.elements < 3000 && built.boxes > 0, JSON.stringify(built));
  const scroller = t.locator('.mx-scheduler__line-scroll');
  numbers.timelineDown = await scrolling(scroller, 0, 60, 120);
  numbers.timelineUp = await scrolling(scroller, 0, -60, 120);
  numbers.timelineAlong = await scrolling(scroller, 40, 0, 120);
  numbers.timelineBack = await scrolling(scroller, -40, 0, 120);
  const after = await t.evaluate((el) => el.querySelectorAll('*').length);
  for (const way of ['Down', 'Up', 'Along', 'Back']) check(`scrolling ${way.toLowerCase()}: 30 fps or more`, numbers[`timeline${way}`].fps >= 30, JSON.stringify(numbers[`timeline${way}`]));
  check('scrolling builds no more than it drops', after < 3000, String(after));
  numbers.timelineDrag = await dragging(t);
  check('dragging: 30 fps or more', numbers.timelineDrag.fps >= 30, JSON.stringify(numbers.timelineDrag));

  // The keys reach the last row: Ctrl + End brings it into view and focuses its last cell.
  await scroller.evaluate((el) => (el.scrollTop = 0));
  await page.waitForTimeout(200);
  await t.locator('.mx-scheduler__line [data-cell]').first().click();
  await page.keyboard.press('Control+End');
  await page.waitForTimeout(400);
  const end = await page.evaluate(() => ({
    cell: document.activeElement?.dataset.cell,
    row: document.activeElement?.closest('.mx-scheduler__line')?.querySelector('.mx-scheduler__resource')?.textContent.trim(),
  }));
  check('Ctrl + End goes to the last cell of the last row (Line 1000), built as it comes', end.row === 'Line 1000' && end.cell === `${999 * 7 + 6}:23`, JSON.stringify(end));
  for (const theme of ['light', 'dark']) {
    await page.evaluate((th) => (document.documentElement.dataset.theme = th), theme);
    await page.waitForTimeout(150);
    await page.addScriptTag({ content: axeSource });
    const violations = await timeline.evaluate(async (el) => (await window.axe.run(el)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
    check(`the big timeline: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
  }
  await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));

  // 200 groups in a week: 1,400 columns.
  const groups = section('groups');
  const w = groups.locator('.mx-scheduler');
  await w.scrollIntoViewIfNeeded();
  await w.locator('.mx-scheduler__layer .mx-scheduler__appointment').first().waitFor({ timeout: 30000 });
  await show(w, 'Day');
  await page.waitForTimeout(500);
  numbers.weekFirstShow = await show(w, 'Week');
  await page.waitForTimeout(500);
  const columns = await w.evaluate((el) => ({ elements: el.querySelectorAll('*').length, built: new Set([...el.querySelectorAll('.mx-scheduler__cells [data-cell]')].map((c) => c.dataset.cell.split(':')[0])).size }));
  numbers.weekElements = columns.elements;
  check('the week of 200 groups shows in under 3 s', numbers.weekFirstShow < 3000, `${numbers.weekFirstShow} ms`);
  check('only the columns in view (and a screen each side) are built, of 1,400', columns.built < 80 && columns.elements < 6000, JSON.stringify(columns));
  const body = w.locator('.mx-scheduler__scroll');
  numbers.weekAlong = await scrolling(body, 40, 0, 120);
  numbers.weekBack = await scrolling(body, -40, 0, 120);
  numbers.weekDown = await scrolling(body, 0, 20, 60);
  for (const way of ['Along', 'Back', 'Down']) check(`the week, scrolling ${way.toLowerCase()}: 30 fps or more`, numbers[`week${way}`].fps >= 30, JSON.stringify(numbers[`week${way}`]));
  numbers.weekDrag = await dragging(w);
  check('the week, dragging: 25 fps or more', numbers.weekDrag.fps >= 25, JSON.stringify(numbers.weekDrag));
  for (const theme of ['light', 'dark']) {
    await page.evaluate((th) => (document.documentElement.dataset.theme = th), theme);
    await page.waitForTimeout(150);
    await page.addScriptTag({ content: axeSource });
    const violations = await groups.evaluate(async (el) => (await window.axe.run(el)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
    check(`the week of 200 groups: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
  }
  await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  console.log(`scheduler big data: ${JSON.stringify(numbers)}`);
}
