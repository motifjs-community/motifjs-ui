/** Real-browser checks of the tooltip page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'tooltip', { waitUntil: 'load' });
  const open = page.locator('.mx-tooltip:popover-open');
  const openCount = () => open.count();
  const away = async () => {
    await page.mouse.move(5, 890);
    await page.waitForTimeout(400);
  };

  const ways = page.locator('section[aria-labelledby="ways"]');
  const save = ways.getByRole('button', { name: 'Save', exact: true });
  await save.hover();
  await page.waitForTimeout(250);
  check('nothing shows before the delay', (await openCount()) === 0);
  await page.waitForTimeout(450);
  check('hovering shows the tooltip after the delay', (await openCount()) === 1 && (await open.textContent()) === 'Save the file (Ctrl+S)');
  const [tipBox, saveBox] = [await box(open), await box(save)];
  check('it sits above its target, centered', tipBox.bottom <= saveBox.top && Math.abs(tipBox.left + tipBox.width / 2 - (saveBox.left + saveBox.width / 2)) < 2, JSON.stringify({ tip: tipBox.bottom, target: saveBox.top }));
  const id = await open.getAttribute('id');
  check('the target is described by it while it shows', (await save.getAttribute('aria-describedby')) === id && (await open.getAttribute('role')) === 'tooltip');
  await page.mouse.move(tipBox.left + tipBox.width / 2, saveBox.top - 2, { steps: 4 });
  await page.mouse.move(tipBox.left + tipBox.width / 2, tipBox.top + tipBox.height / 2, { steps: 4 });
  await page.waitForTimeout(500);
  check('the pointer can move onto it without closing it', (await openCount()) === 1);
  await away();
  check('leaving closes it and drops the description', (await openCount()) === 0 && (await save.getAttribute('aria-describedby')) === null);

  const toolbar = page.locator('section[aria-labelledby="icon"]');
  await toolbar.scrollIntoViewIfNeeded();
  await toolbar.getByRole('button', { name: 'Bold' }).hover();
  await page.waitForTimeout(700);
  const first = await open.allTextContents();
  await toolbar.getByRole('button', { name: 'Italic' }).hover();
  const next = await open.allTextContents();
  check('the next tooltip shows at once, and only one is open', first[0] === 'Bold (Ctrl+B)' && next.length === 1 && next[0] === 'Italic (Ctrl+I)', `${first} → ${next}`);
  await away();

  await page.keyboard.press('Shift');
  await toolbar.getByRole('button', { name: 'Link' }).focus();
  check('keyboard focus shows it at once', (await openCount()) === 1 && (await open.textContent()) === 'Insert a link (Ctrl+K)');
  await page.keyboard.press('Escape');
  check('Escape hides it and focus stays', (await openCount()) === 0 && (await toolbar.getByRole('button', { name: 'Link' }).evaluate((el) => document.activeElement === el)));
  await page.keyboard.press('Shift+Tab');
  check('Tab to another target shows its tooltip', (await open.textContent()) === 'Italic (Ctrl+I)');
  await page.keyboard.press('Shift+Tab');
  check('focus leaving hides the one before', (await openCount()) === 1 && (await open.textContent()) === 'Bold (Ctrl+B)');
  await page.locator('body').click({ position: { x: 5, y: 890 } });

  await save.click();
  await page.waitForTimeout(700);
  check('a click does not bring it up while the pointer stays', (await openCount()) === 0);
  await away();

  const field = page.locator('section[aria-labelledby="field"]');
  await page.keyboard.press('Shift');
  await field.getByLabel('Email').focus();
  const fieldTip = await open.getAttribute('id');
  check('on a TextBox, its input is described while the tooltip shows', (await openCount()) === 1 && ((await field.getByLabel('Email').getAttribute('aria-describedby')) ?? '').split(' ').includes(fieldTip));
  // Measured once its entry animation has ended: while it slides in, it is not where it lands.
  await open.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished.catch(() => undefined))));
  const [fieldBox, inputBox] = [await box(open), await box(field.locator('.mx-field'))];
  check('placement end puts it after the field', fieldBox.left >= inputBox.right - 1);
  await page.keyboard.press('Escape');
  await page.locator('body').click({ position: { x: 5, y: 890 } });

  const placement = page.locator('section[aria-labelledby="placement"]');
  await placement.getByRole('button', { name: 'bottom', exact: true }).click();
  const target = placement.getByRole('button', { name: 'Hover or focus me' });
  await target.hover();
  await page.waitForTimeout(700);
  const [below, targetBox] = [await box(open), await box(target)];
  check('placement bottom puts it below', (await open.getAttribute('data-side')) === 'bottom' && below.top >= targetBox.bottom, `${await open.textContent()}`);
  await away();
  await placement.getByRole('button', { name: 'top', exact: true }).click();
  await target.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().top - 4));
  await page.waitForTimeout(100);
  await page.keyboard.press('Shift');
  await target.focus();
  check('with no room above it opens below', (await openCount()) === 1 && (await open.getAttribute('data-side')) === 'bottom');
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(200);
  check('scrolling closes it', (await openCount()) === 0);
  await page.locator('body').click({ position: { x: 5, y: 890 } });
  await placement.getByRole('button', { name: 'end', exact: true }).click();
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await target.scrollIntoViewIfNeeded();
  await target.hover();
  await page.waitForTimeout(700);
  const [rtlTip, rtlTarget] = [await box(open), await box(target)];
  check('end is to the left in a right-to-left page', rtlTip.right <= rtlTarget.left + 1);
  await page.evaluate(() => document.documentElement.removeAttribute('dir'));
  await away();

  const showOn = page.locator('section[aria-labelledby="show-on"]');
  await showOn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await showOn.getByRole('button', { name: 'Show it' }).click();
  check('a manual tooltip opens programmatically', (await openCount()) === 1 && (await open.textContent()) === 'Shown programmatically');
  await page.waitForTimeout(400);
  check('…and stays while the pointer is elsewhere', (await openCount()) === 1);
  await showOn.getByRole('button', { name: 'Hide it' }).click();
  check('…and closes programmatically', (await openCount()) === 0);

  const many = page.locator('section[aria-labelledby="many"]');
  const before = await page.locator('.mx-tooltip').count();
  await many.getByRole('button', { name: '1A' }).hover();
  await page.waitForTimeout(700);
  check('addTooltip makes one tooltip on first use', (await page.locator('.mx-tooltip').count()) === before + 1 && (await open.textContent()) === 'Row 1, seat A: window, extra legroom');
  await many.getByRole('button', { name: '1B' }).hover();
  check('…and the next seat shows at once', (await open.textContent()) === 'Row 1, seat B: aisle, extra legroom' && (await openCount()) === 1);

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean with a tooltip open', violations.length === 0, violations.join(', '));
  await away();
}
