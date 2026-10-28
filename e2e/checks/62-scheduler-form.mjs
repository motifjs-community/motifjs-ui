/** Real-browser checks of the Scheduler's form page: items, groups and tabs set up without events, editors of your own, rules, fields for one appointment, a form of your own; mouse and keys, right to left, axe. */
export default async function ({ page, base, check, axeSource }) {
  await page.clock.install({ time: new Date('2026-10-28T07:00:00Z') });
  await page.clock.resume();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + 'scheduler/form', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const section = (id) => page.locator(`section[aria-labelledby="${id}"]`);
  const form = page.locator('.mx-scheduler__form[open]');
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
  /** The labels of the fields that show, in order. */
  const labels = () =>
    form.evaluate((el) =>
      [...el.querySelectorAll('.mx-form-layout__item')]
        .filter((i) => i.checkVisibility() && !i.querySelector('.mx-form-layout__item'))
        .map((i) => (i.querySelector('.mx-recurrence-editor') ? 'Repeat' : (i.querySelector('.mx-field__label > span')?.textContent ?? i.textContent.trim().slice(0, 12)))),
    );
  const open = async (id, text) => {
    const target = section(id).locator('.mx-scheduler__appointment', { hasText: text }).first();
    await target.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await target.dblclick();
    await form.waitFor();
    await page.waitForTimeout(150);
  };

  // Items, a group and tabs, without events.
  await section('declared').locator('.mx-scheduler__appointment').first().waitFor();
  await open('declared', 'Design review');
  const tabs = await form.locator('[role="tab"]').allTextContents();
  const first = await labels();
  check('the form is the subject, then three tabs; the first tab holds the times, the zone row and the recurrence editor', JSON.stringify(tabs) === JSON.stringify(['When', 'Where and who', 'Notes']) && JSON.stringify(first) === JSON.stringify(['Subject', 'Start', 'End', 'Time zone', 'Separate end time zone', 'All day', 'Repeat']), `${tabs} | ${first}`);
  await axe('the form with tabs', form);
  // By the keys: to the tab strip, then along it.
  await form.locator('[role="tab"]').first().focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  const second = await labels();
  const swatches = await form.locator('.mx-scheduler__resource-picker').count();
  check('the arrows move along the tabs: the room and the people pickers', JSON.stringify(second) === JSON.stringify(['Subject', 'Room', 'People']) && swatches === 2, `${second}`);
  await form.locator('.mx-scheduler__resource-picker').first().click();
  const list = page.locator('.mx-popup:popover-open .mx-list');
  await list.waitFor();
  const dots = await list.evaluate((el) => [...el.querySelectorAll('.mx-list__icon .mx-scheduler__resource-swatch')].map((s) => getComputedStyle(s, '::before').backgroundColor));
  check('the room picker lists each room with its colour', dots.length === 3 && dots.every((d) => d !== 'rgba(0, 0, 0, 0)'), JSON.stringify(dots));
  await axe('the room picker', list);
  await page.keyboard.press('Escape');
  // A rule of its own on the subject: two letters do not save; the field says so and has focus.
  await form.locator('[role="tab"]').nth(2).click();
  const subject = form.locator('.mx-text-box input').first();
  await subject.fill('Ab');
  await form.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(250);
  const invalid = await form.evaluate((el) => ({ said: el.textContent.includes('At least three letters.'), focus: document.activeElement === el.querySelector('.mx-text-box input') }));
  check('the subject’s own rule keeps it from saving and the field gets focus', invalid.said && invalid.focus && (await form.count()) === 1, JSON.stringify(invalid));
  await page.keyboard.press('Escape');
  await form.waitFor({ state: 'detached' }).catch(() => {});
  await page.waitForTimeout(200);

  // A failing field on a hidden tab: its tab shows and the field gets focus.
  await open('declared', 'Design review');
  await form.locator('[role="tab"]').first().click();
  await form.locator('.mx-date-box input').nth(1).evaluate((el) => {
    el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await form.locator('[role="tab"]').nth(2).click();
  await form.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(250);
  const shown = await form.locator('[role="tab"][aria-selected="true"]').textContent();
  check('saving with a field on a hidden tab that fails: its tab shows', shown === 'When', shown);
  await form.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(200);

  // Editors of your own: a slider by a function, a row of colours from a template; a rule of the form's own.
  await open('editors', 'Design review');
  const own = await form.evaluate((el) => ({ slider: !!el.querySelector('.mx-slider'), colours: el.querySelectorAll('.sched-colors__swatch').length }));
  check('a slider made by a function and a row of colours from a template', own.slider && own.colours === 5, JSON.stringify(own));
  await form.locator('.sched-colors__swatch').nth(1).click();
  await form.locator('.mx-text-box input').first().fill('Interview');
  await form.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(250);
  check('an interview with one person does not save: the people say why', (await form.textContent()).includes('An interview needs two people.'), '');
  await axe('the form with editors of its own', form);
  await form.locator('.mx-text-box input').first().fill('Design review');
  await form.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(300);
  const colour = await section('editors').locator('.mx-scheduler__appointment', { hasText: 'Design review' }).first().evaluate((el) => el.style.getPropertyValue('--_color'));
  check('the colour chosen in the template is saved to the booking', colour === '#2e7d32', colour);

  // Fields for one appointment: catering only in Cappadocia, guests only with catering; a booking that has begun keeps its room.
  await open('conditional', 'Workshop');
  const before = await labels();
  await form.locator('.mx-switch').filter({ hasText: 'Catering' }).click();
  await page.waitForTimeout(150);
  const after = await labels();
  check('catering shows in Cappadocia, and the guests once it is on', before.includes('Catering') && !before.includes('Guests') && after.includes('Guests'), `${before} → ${after}`);
  await form.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(200);
  await open('conditional', 'Retro');
  const locked = await form.evaluate((el) => ({ room: el.querySelector('.mx-scheduler__resource-picker')?.matches('[data-readonly], [aria-readonly="true"]') || !!el.querySelector('.mx-scheduler__resource-picker [aria-readonly="true"], .mx-scheduler__resource-picker [readonly]'), catering: [...el.querySelectorAll('.mx-form-layout__item')].some((i) => i.checkVisibility() && i.textContent.includes('Catering')), said: el.textContent.includes('It has begun') }));
  check('a booking that has begun keeps its room, and Atlas has no catering', locked.room && !locked.catering && locked.said, JSON.stringify(locked));
  await form.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(200);

  // A form of your own, opened by the keys.
  const ownSection = section('own');
  const target = ownSection.locator('.mx-scheduler__appointment', { hasText: 'Budget' }).first();
  await target.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await target.focus();
  await page.keyboard.press('Enter');
  const quick = page.locator('.mx-form[open]', { hasText: 'Quick edit' });
  await quick.waitFor();
  check('onFormOpening cancels the scheduler’s form and opens its own', (await page.locator('.mx-scheduler__form[open]').count()) === 0, '');
  await quick.locator('.mx-text-box input').first().fill('Budget review');
  await quick.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(300);
  check('…which saves through the scheduler', (await ownSection.locator('.mx-scheduler__appointment', { hasText: 'Budget review' }).count()) === 1, '');

  // Right to left: the form mirrors; a field's label stands at its start.
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await open('declared', 'Design review');
  const rtl = await form.evaluate((el) => {
    const field = el.querySelector('.mx-text-box').getBoundingClientRect();
    const label = el.querySelector('.mx-text-box .mx-field__label').getBoundingClientRect();
    const tabs = [...el.querySelectorAll('[role="tab"]')].map((t) => t.getBoundingClientRect().left);
    return { labelAtStart: Math.abs(field.right - label.right) < 24, tabsRightToLeft: tabs[0] > tabs[1] };
  });
  check('right to left: labels at the start, the tabs from the right', rtl.labelAtStart && rtl.tabsRightToLeft, JSON.stringify(rtl));
  await form.getByRole('button', { name: 'Cancel' }).click();
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));
}
