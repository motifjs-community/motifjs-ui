/** Real-browser checks of the window page: top layer, inert page, geometry, keys and focus. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'window', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const ways = page.locator('section[aria-labelledby="ways"]');

  // A modeless form from JSX: the page stays usable, Tab leaves it, the close button writes false.
  const findButton = ways.getByRole('button', { name: 'Find…' });
  await findButton.click();
  const find = page.locator('dialog.win-find');
  await find.waitFor({ state: 'visible' });
  check('a modeless form is open but not modal', await find.evaluate((el) => el.open && !el.matches(':modal') && !el.hasAttribute('aria-modal')));
  check('…named by its title', (await page.getByRole('dialog', { name: 'Find' }).count()) === 1);
  check('focus goes to its first field', await find.getByLabel('Find what').evaluate((el) => document.activeElement === el));
  await page.keyboard.type('motif');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  check('Enter in the field clicks the accept button and closes it', !(await find.evaluate((el) => el.open)) && (await page.locator('.win-found').textContent()) === 'Searched for “motif”.');
  check('focus goes back to the button that opened it', await findButton.evaluate((el) => document.activeElement === el));
  await findButton.click();
  await find.waitFor({ state: 'visible' });
  const usable = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent === 'Rename… (class, modal)');
    b.focus();
    return document.activeElement === b;
  });
  check('the page stays usable under a modeless form', usable);
  await find.getByRole('button', { name: 'Close', exact: true }).first().click();
  await page.waitForTimeout(50);
  check('the close button hides it (x-model false), the form stays in the page', (await page.locator('dialog.win-find').count()) === 1 && !(await find.evaluate((el) => el.open)));

  // A modal form from code: top layer, inert page, Tab cycles, Escape cancels, focus returns.
  const renameButton = ways.getByRole('button', { name: 'Rename… (class, modal)' });
  await renameButton.click();
  const rename = page.getByRole('dialog', { name: 'Rename' });
  await rename.waitFor();
  check('showDialog opens a modal form in the top layer', await rename.evaluate((el) => el.matches(':modal') && el.getAttribute('aria-modal') === 'true'));
  const outside = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent === 'Find…');
    btn.focus();
    return document.activeElement === btn;
  });
  check('the page under a modal form is inert', !outside);
  const field = rename.getByLabel('New name');
  check('focus starts in the first field', await field.evaluate((el) => document.activeElement === el));
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  check('Tab stays inside a modal form', await rename.evaluate((el) => el.contains(document.activeElement)));
  await field.focus();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  check('Escape clicks the cancel button', (await page.locator('.win-renamed').textContent()) === 'Kept the old name.' && (await page.getByRole('dialog', { name: 'Rename' }).count()) === 0);
  check('…the form is disposed and focus is back on its opener', await renameButton.evaluate((el) => document.activeElement === el));

  // Moving and resizing.
  const frame = page.locator('section[aria-labelledby="frame"]');
  await frame.getByRole('button', { name: 'Open notes' }).click();
  const notes = page.locator('dialog.win-notes');
  await notes.waitFor({ state: 'visible' });
  await page.waitForTimeout(250);
  const start = await box(notes);
  const view = await page.evaluate(() => ({ w: document.documentElement.clientWidth, h: document.documentElement.clientHeight }));
  check('it opens in the middle of the viewport', Math.abs(start.left + start.width / 2 - view.w / 2) < 2 && Math.abs(start.top + start.height / 2 - view.h / 2) < 2, JSON.stringify(start));
  const bar = notes.locator('.mx-form__bar');
  const barBox = await box(bar);
  await page.mouse.move(barBox.left + 30, barBox.top + barBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(barBox.left + 30 - 120, barBox.top + barBox.height / 2 - 60, { steps: 5 });
  await page.mouse.up();
  const moved = await box(notes);
  check('dragging the title bar moves it', Math.abs(moved.left - (start.left - 120)) < 2 && Math.abs(moved.top - (start.top - 60)) < 2, `${start.left},${start.top} → ${moved.left},${moved.top}`);
  await page.mouse.move(moved.left + 30, moved.top + 10);
  await page.mouse.down();
  await page.mouse.move(-500, -500, { steps: 5 });
  await page.mouse.up();
  const clamped = await box(notes);
  check('…and keeps it inside the viewport', clamped.left === 0 && clamped.top === 0, JSON.stringify(clamped));
  const corner = await box(notes.locator('.mx-form__resize[data-edge="bottom-end"]'));
  await page.mouse.move(corner.left + corner.width / 2, corner.top + corner.height / 2);
  await page.mouse.down();
  await page.mouse.move(corner.left + corner.width / 2 + 100, corner.top + corner.height / 2 + 80, { steps: 5 });
  await page.mouse.up();
  const grown = await box(notes);
  check('the corner resizes it', Math.abs(grown.width - clamped.width - 100) < 3 && Math.abs(grown.height - clamped.height - 80) < 3, `${clamped.width}x${clamped.height} → ${grown.width}x${grown.height}`);
  const edge = await box(notes.locator('.mx-form__resize[data-edge="end"]'));
  await page.mouse.move(edge.left + edge.width / 2, edge.top + edge.height / 2);
  await page.mouse.down();
  await page.mouse.move(edge.left - 2000, edge.top + edge.height / 2, { steps: 5 });
  await page.mouse.up();
  const minWidth = await notes.evaluate((el) => parseFloat(getComputedStyle(el).minInlineSize));
  check('…not below the minimum width', Math.abs((await box(notes)).width - minWidth) < 2, `${(await box(notes)).width} vs ${minWidth}`);

  // Maximize, minimize to the strip, restore.
  await bar.dblclick({ position: { x: 40, y: 10 } });
  await page.waitForTimeout(50);
  const max = await box(notes);
  check('double-clicking the title bar maximizes it to the viewport', max.left === 0 && max.top === 0 && Math.abs(max.width - view.w) < 1 && Math.abs(max.height - view.h) < 1, JSON.stringify(max));
  await notes.getByRole('button', { name: 'Restore' }).click();
  check('Restore brings back its size', Math.abs((await box(notes)).width - minWidth) < 2);
  await notes.getByRole('button', { name: 'Minimize' }).click();
  await page.waitForTimeout(400);
  const chip = frame.locator('.mx-form-chip');
  check('minimize leaves a chip in the strip and hides the form', (await chip.count()) === 1 && !(await notes.isVisible()));
  check('…with focus on the chip', await chip.evaluate((el) => document.activeElement === el));
  await chip.click();
  check('the chip brings it back', (await notes.isVisible()) && (await chip.count()) === 0);

  // Modeless windows stack; the clicked one comes to the front.
  const modalCard = page.locator('section[aria-labelledby="modal"]');
  await modalCard.getByRole('button', { name: 'Open a window' }).click();
  await modalCard.getByRole('button', { name: 'Open a window' }).click({ force: true });
  const w1 = page.getByRole('dialog', { name: 'Window 1' });
  const w2 = page.getByRole('dialog', { name: 'Window 2' });
  const z = (loc) => loc.evaluate((el) => Number(getComputedStyle(el).zIndex));
  check('the last window is on top', (await z(w2)) > (await z(w1)) && (await w2.getAttribute('data-active')) !== null);
  await w1.locator('.mx-form__bar').click({ position: { x: 20, y: 10 } });
  check('clicking a window brings it to the front and makes it active', (await z(w1)) > (await z(w2)) && (await w1.getAttribute('data-active')) !== null);
  await w1.getByRole('button', { name: 'Close' }).click();
  await w2.getByRole('button', { name: 'Close' }).click();
  await notes.getByRole('button', { name: 'Close' }).click();

  // Nested modal forms: the one below is blocked.
  await modalCard.getByRole('button', { name: 'Open nested modal forms' }).click();
  const level1 = page.getByRole('dialog', { name: 'Level 1' });
  await level1.getByRole('button', { name: 'Open level 2' }).click();
  const level2 = page.getByRole('dialog', { name: 'Level 2' });
  await level2.waitFor();
  const lowerInert = await level1.locator('button', { hasText: 'Open level 2' }).evaluate((el) => {
    el.focus();
    return document.activeElement !== el;
  });
  check('a modal from a modal blocks the one below', lowerInert && (await level2.evaluate((el) => el.matches(':modal'))));
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with nested modal forms open', violations.length === 0, violations.join(', '));
  await page.keyboard.press('Escape');
  check('Escape closes the top one and focus goes back to the one below', (await level2.count()) === 0 && (await level1.getByRole('button', { name: 'Open level 2' }).evaluate((el) => document.activeElement === el)));
  await page.keyboard.press('Escape');
  check('…then the first', (await level1.count()) === 0);

  // onClosing keeps a form with changes open.
  const events = page.locator('section[aria-labelledby="events"]');
  await events.getByRole('button', { name: 'Open' }).click();
  const ev = page.locator('dialog.win-events');
  const opened = await page.locator('.win-log').textContent();
  check('onLoaded, onActivate and onShown arrive in order', opened === 'loaded · activate · shown', opened);
  await ev.getByRole('button', { name: 'No changes' }).click();
  await ev.getByRole('button', { name: 'Close', exact: true }).click();
  check('onClosing can keep it open', await ev.evaluate((el) => el.open));
  await ev.getByRole('button', { name: 'Has changes: close is kept' }).click();
  await ev.getByRole('button', { name: 'Close', exact: true }).click();
  const closedLog = await page.locator('.win-log').textContent();
  check('…then it closes: onClosing (user), onDeactivate, onClosed', !(await ev.evaluate((el) => el.open)) && closedLog.endsWith('closing (user) · deactivate · closed: cancel'), closedLog);

  // Message boxes.
  const message = page.locator('section[aria-labelledby="message"]');
  await message.getByRole('button', { name: 'Confirm delete' }).click();
  const alert = page.getByRole('alertdialog', { name: 'Delete file' });
  await alert.waitFor();
  check('a danger box is an alert dialog described by its text', (await alert.getAttribute('aria-describedby')) !== null && (await alert.evaluate((el) => document.getElementById(el.getAttribute('aria-describedby')).textContent.startsWith('Delete'))));
  check('…and starts on its safe button', await alert.getByRole('button', { name: 'Cancel' }).evaluate((el) => document.activeElement === el));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(50);
  check('confirm resolves false on Escape', (await page.locator('.win-answer').textContent()) === 'Answer: false');
  await message.getByRole('button', { name: 'Yes / No / Cancel' }).click();
  await page.getByRole('alertdialog', { name: 'Unsaved changes' }).getByRole('button', { name: 'No' }).click();
  await page.waitForTimeout(50);
  check('messageBox resolves with the button pressed', (await page.locator('.win-answer').textContent()) === 'Answer: no');

  // Tab leaves a modeless form for the page.
  await page.locator('section[aria-labelledby="ways"]').getByRole('button', { name: 'Find…' }).click();
  const findAgain = page.locator('dialog.win-find');
  await findAgain.locator('.mx-form__footer button').last().focus();
  await page.keyboard.press('Tab');
  check('Tab from the last control of a modeless form goes on to the page', await findAgain.evaluate((el) => !!document.activeElement && !el.contains(document.activeElement) && document.activeElement !== document.body));
  await findAgain.getByRole('button', { name: 'Close', exact: true }).first().click();

  // Right to left: the form moves with the pointer, its place counted from the right edge.
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await page.locator('section[aria-labelledby="frame"]').getByRole('button', { name: 'Open notes' }).click();
  const rtlNotes = page.locator('dialog.win-notes');
  await page.waitForTimeout(250);
  const r0 = await box(rtlNotes);
  const rb = await box(rtlNotes.locator('.mx-form__bar'));
  await page.mouse.move(rb.right - 120, rb.top + 10);
  await page.mouse.down();
  await page.mouse.move(rb.right - 220, rb.top + 40, { steps: 5 });
  await page.mouse.up();
  const r1 = await box(rtlNotes);
  check('in RTL dragging moves it with the pointer', Math.abs(r1.left - (r0.left - 100)) < 2 && Math.abs(r1.top - (r0.top + 30)) < 2, `${r0.left},${r0.top} → ${r1.left},${r1.top}`);
  check('…and its place is written from the start (right) edge', await rtlNotes.evaluate((el, right) => Math.abs(parseFloat(el.style.getPropertyValue('--_mx-x')) - right) < 2, (await page.evaluate(() => document.documentElement.clientWidth)) - r1.right));
  await rtlNotes.getByRole('button', { name: 'Close' }).click();
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));
}
