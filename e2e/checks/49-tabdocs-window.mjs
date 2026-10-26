/** Real-browser checks of the TabDocumentManager's New windows page: a real `window.open` window, what moves into it and what works there. */
export default async function ({ page, base, check, axeSource, box }) {
  const titlesIn = (scope) => scope.locator('[role="tab"] .mx-tabdocs__title').allTextContents();
  const open = async (anchor) => {
    await page.goto(base + 'tabdocs/windows', { waitUntil: 'load' });
    const m = page.locator(`section[aria-labelledby="${anchor}"] .mx-tabdocs`).first();
    await m.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(250);
    return m;
  };
  const section = (anchor) => page.locator(`section[aria-labelledby="${anchor}"]`);
  /** Clicks `button` and takes the window it opens. */
  const windowFrom = async (button) => {
    const [popup] = await Promise.all([page.waitForEvent('popup'), button.click()]);
    popup.on('pageerror', (e) => check(`no error in the new window: ${e}`, false));
    popup.on('console', (msg) => {
      if (msg.type() === 'error' || (msg.type() === 'warning' && /\[motifjs\]|MJX\d/.test(msg.text()))) check(`no console error in the new window: ${msg.text()}`, false);
    });
    await popup.waitForTimeout(400);
    return popup;
  };
  const axe = async (target, label) => {
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await target.waitForTimeout(200);
      await target.addScriptTag({ content: axeSource });
      const violations = await target.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
      check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  };

  // The move: a typed name, a chosen city and a scrolled grid stay as they were.
  let m = await open('move');
  const s = section('move');
  await m.getByRole('tab', { name: /^Customer/ }).click();
  await m.getByRole('textbox', { name: 'Name' }).fill('Ada Byron');
  await m.getByRole('combobox', { name: 'City' }).click();
  await page.getByRole('option', { name: 'İzmir' }).click();
  await m.getByRole('tab', { name: /^Orders/ }).click();
  await page.waitForTimeout(150);
  await m.locator('.mx-data-grid__viewport').evaluate((el) => (el.scrollTop = 420));
  await page.waitForTimeout(150);
  await m.getByRole('tab', { name: /^Customer/ }).click();
  let popup = await windowFrom(s.getByRole('button', { name: 'Move its group' }));
  check('the group moved into a new window: its tabs there, none left here', JSON.stringify(await titlesIn(popup)) === JSON.stringify(['Customer', 'Orders', 'Notes']) && (await titlesIn(m)).length === 0, JSON.stringify(await titlesIn(popup)));
  check('…the window is as large as the group was', Math.abs(popup.viewportSize().width - (await box(m)).width) <= 40, JSON.stringify(popup.viewportSize()));
  check('…its title is the active document\'s', (await popup.title()).startsWith('Customer'), await popup.title());
  check('…the typed text and the chosen city are still there', (await popup.getByRole('textbox', { name: 'Name' }).inputValue()) === 'Ada Byron' && (await popup.getByRole('combobox', { name: 'City' }).textContent()).includes('İzmir'));
  await popup.getByRole('tab', { name: /^Orders/ }).click();
  await popup.waitForTimeout(200);
  const scrolled = await popup.locator('.mx-data-grid__viewport').evaluate((el) => el.scrollTop);
  check('…and the grid is still scrolled where it was', Math.abs(scrolled - 420) <= 2, String(scrolled));
  await popup.getByRole('tab', { name: /^Customer/ }).click();
  check('…the page\'s state shows it, unchanged', (await s.locator('output').textContent()).includes('Customer: Ada Byron, İzmir'), await s.locator('output').textContent());

  // The look follows the page: the theme, the language, a sheet added later.
  const looks = () => popup.evaluate(() => ({ theme: document.documentElement.dataset.theme ?? '', identity: document.documentElement.dataset.identity ?? '', bg: getComputedStyle(document.querySelector('.mx-tabdocs__page')).backgroundColor }));
  const pageBg = () => m.evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));
  await popup.waitForTimeout(150);
  let look = await looks();
  check('the theme changed here changes in the new window', look.theme === 'dark' && look.bg === (await pageBg()), JSON.stringify(look));
  await page.evaluate(() => (document.documentElement.dataset.identity = 'material'));
  await popup.waitForTimeout(150);
  look = await looks();
  check('…so does the design language', look.identity === 'material' && look.bg === (await pageBg()), JSON.stringify(look));
  await page.evaluate(() => {
    const sheet = document.createElement('style');
    sheet.id = 'probe-sheet';
    sheet.textContent = '.mx-tabdocs__page { outline: 3px solid rgb(1, 2, 3); }';
    document.head.append(sheet);
  });
  await popup.waitForTimeout(150);
  check('…and a style sheet the page adds later', (await popup.evaluate(() => getComputedStyle(document.querySelector('.mx-tabdocs__page')).outlineColor)) === 'rgb(1, 2, 3)');
  await page.evaluate(() => {
    document.getElementById('probe-sheet').remove();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-identity');
  });

  // The look, state by state, the same as in the page in every language and theme.
  {
    const COMBOS = [['tactile', 'light'], ['tactile', 'dark'], ['tactile', 'high-contrast'], ['lounge', 'dark'], ['material', 'light'], ['material', 'dark'], ['fluent', 'light'], ['fluent', 'dark'], ['lilac', 'light'], ['lilac', 'dark']];
    const measure = (root) => {
      const cs = (el) => {
        const c = getComputedStyle(el);
        return [c.color, c.backgroundColor, c.borderBottomColor, c.borderBottomWidth, c.fontSize, c.fontWeight, c.blockSize, c.borderRadius, c.outlineColor, c.outlineWidth, c.boxShadow].join('|');
      };
      const tabs = [...root.querySelectorAll('[role="tab"]')];
      const active = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
      const rest = tabs.find((t) => t !== active);
      const group = root.querySelector('.mx-tabdocs__group');
      return { active: cs(active), rest: cs(rest), bar: cs(group.querySelector('.mx-tabdocs__bar')), group: cs(group) };
    };
    // A second manager on the page, with the same tabs, to compare with.
    const other = page.locator('section[aria-labelledby="layout"] .mx-tabdocs').first();
    await other.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const differences = [];
    for (const [identity, theme] of COMBOS) {
      await page.evaluate(([i, t]) => {
        document.documentElement.dataset.identity = i;
        document.documentElement.dataset.theme = t;
      }, [identity, theme]);
      // At rest in both: no focus, no pointer on a tab.
      await popup.evaluate(() => document.activeElement?.blur());
      await popup.mouse.move(popup.viewportSize().width - 4, popup.viewportSize().height - 4);
      await page.mouse.move(4, 4);
      // Colours glide to a new theme (the motion tokens): measured once both have settled.
      let here;
      let there;
      for (let i = 0; i < 6; i++) {
        await popup.waitForTimeout(150);
        here = await other.evaluate(measure);
        there = await popup.evaluate(`(${measure.toString()})(document.querySelector('.mx-tabdocs__page'))`);
        if (JSON.stringify(here) === JSON.stringify(there)) break;
      }
      for (const key of Object.keys(here)) if (here[key] !== there[key]) differences.push(`${identity}/${theme} ${key}: ${here[key]} ≠ ${there[key]}`);
      // Under the pointer (forced through the devtools protocol: a popup Chrome runs headless keeps no
      // hover of its own) and with keyboard focus, the same as in the page too.
      const states = async (target, rootSelector) => {
        await target.bringToFront();
        const cdp = await target.context().newCDPSession(target);
        await cdp.send('DOM.enable');
        await cdp.send('CSS.enable');
        const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: false });
        const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `${rootSelector} [role="tab"][aria-selected="false"]` });
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] });
        await target.keyboard.press('Shift');
        await target.evaluate((sel) => document.querySelector(`${sel} [role="tab"][aria-selected="true"]`).focus(), rootSelector);
        await target.waitForTimeout(350);
        const seen = await target.evaluate((sel) => {
          const cs = (el) => {
            const c = getComputedStyle(el);
            return [c.color, c.backgroundColor, c.borderRadius, c.outlineStyle, c.outlineColor, c.outlineWidth, c.outlineOffset, c.boxShadow].join('|');
          };
          const focused = document.activeElement;
          return { hover: cs(document.querySelector(`${sel} [role="tab"][aria-selected="false"]`)), focus: focused?.matches(':focus-visible') ? cs(focused) : 'no focus-visible' };
        }, rootSelector);
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
        await cdp.detach();
        return seen;
      };
      const pageStates = await states(page, 'section[aria-labelledby="layout"] .mx-tabdocs');
      const windowStates = await states(popup, '.mx-tabdocs__page');
      for (const key of Object.keys(pageStates)) if (pageStates[key] !== windowStates[key]) differences.push(`${identity}/${theme} ${key}: ${pageStates[key]} ≠ ${windowStates[key]}`);
      await popup.evaluate(() => document.activeElement?.blur());
      await other.evaluate(() => document.activeElement?.blur());
    }
    await popup.bringToFront();
    await page.evaluate(() => {
      document.documentElement.removeAttribute('data-identity');
      document.documentElement.removeAttribute('data-theme');
    });
    check(`the new window looks as the page in ${COMBOS.length} languages and themes (tabs at rest, active, under the pointer and focused; the strip; the group)`, differences.length === 0, differences.slice(0, 4).join(' ;; '));
  }
  // Keys there: the roving tab stop and the manager's keys.
  await popup.getByRole('tab', { name: /^Customer/ }).focus();
  await popup.keyboard.press('ArrowRight');
  const roving = await popup.evaluate(() => [document.activeElement.textContent.includes('Orders'), [...document.querySelectorAll('[role="tab"]')].map((t) => t.tabIndex).join(',')]);
  check('the arrows move along the strip in the new window, one tab stop', roving[0] && roving[1] === '-1,0,-1', JSON.stringify(roving));

  // A context menu there, in its own top layer.
  await popup.getByRole('tab', { name: /^Notes/ }).click({ button: 'right' });
  await popup.waitForTimeout(150);
  const menu = await popup.evaluate(() => {
    const p = [...document.querySelectorAll('.mx-popup')].find((x) => x.matches(':popover-open'));
    return p ? [...p.querySelectorAll('.mx-menu__label')].map((l) => l.textContent) : null;
  });
  check('the tab menu opens in the new window, with "Move back to main window"', !!menu && menu.includes('Pin') && menu.includes('Move back to main window'), JSON.stringify(menu));
  await popup.getByRole('menuitem', { name: 'Pin' }).click();
  check('…its commands work there', await popup.getByRole('tab', { name: /^Notes/ }).evaluate((t) => t.hasAttribute('data-pinned')));

  // A tooltip there.
  const tip = await box(popup.getByRole('tab', { name: /^Customer/ }));
  await popup.mouse.move(tip.x + tip.width / 2, tip.y + tip.height / 2);
  await popup.waitForTimeout(1000);
  const tips = await popup.evaluate(() => [...document.querySelectorAll('.mx-tooltip')].filter((t) => t.matches(':popover-open')).map((t) => t.textContent));
  check('a tab\'s tooltip shows in the new window', tips.includes('Customer: Ada Byron'), JSON.stringify(tips));
  await popup.mouse.move(5, 300);

  // A drop-down list there, a while after the move: the page's nodes may have that window's classes by now (a browser makes a new wrapper for a node it collected).
  await popup.getByRole('tab', { name: /^Customer/ }).click();
  await popup.getByRole('combobox', { name: 'City' }).click();
  await popup.waitForTimeout(150);
  const listOpen = await popup.evaluate(() => [...document.querySelectorAll('.mx-popup')].some((p) => p.matches(':popover-open') && p.querySelector('[role="option"]')));
  await popup.getByRole('option', { name: 'Ankara' }).click();
  check('a DropDown opens its list in the new window, and the choice is made', listOpen && (await s.locator('output').textContent()).includes('Ankara'));

  // A dialog from the content there.
  await popup.getByRole('button', { name: 'Clear…' }).click();
  await popup.waitForTimeout(200);
  const dialog = await popup.evaluate(() => !!document.querySelector('dialog[open]')?.matches(':modal'));
  check('a dialog the content opens shows in the new window, modal there', dialog && !(await page.evaluate(() => !!document.querySelector('dialog[open]'))));
  await popup.keyboard.press('Escape');

  // Drag in the window: a reorder, then a split by the content's edge.
  {
    const a = await box(popup.getByRole('tab', { name: /^Orders/ }));
    const c = await box(popup.getByRole('tab', { name: /^Customer/ }));
    await popup.mouse.move(c.x + 20, c.y + c.height / 2);
    await popup.mouse.down();
    await popup.mouse.move(c.x + 40, c.y + c.height / 2, { steps: 3 });
    await popup.mouse.move(a.right - 4, a.y + a.height / 2, { steps: 8 });
    await popup.waitForTimeout(150);
    const ghost = await popup.evaluate(() => !!document.querySelector('.mx-tabdocs__ghost'));
    await popup.mouse.up();
    await popup.waitForTimeout(200);
    check('a tab dragged in the new window: the picture follows there and the strip reorders', ghost && JSON.stringify(await titlesIn(popup)) === JSON.stringify(['Notes', 'Orders', 'Customer']), JSON.stringify(await titlesIn(popup)));
    const panels = await box(popup.locator('.mx-tabdocs__panels').first());
    const o = await box(popup.getByRole('tab', { name: /^Orders/ }));
    await popup.mouse.move(o.x + 20, o.y + o.height / 2);
    await popup.mouse.down();
    await popup.mouse.move(o.x + 40, o.y + 12, { steps: 3 });
    await popup.mouse.move(panels.right - 20, panels.y + panels.height / 2, { steps: 8 });
    await popup.waitForTimeout(150);
    const area = await popup.evaluate(() => !document.querySelector('.mx-tabdocs__drop')?.hidden);
    await popup.mouse.up();
    await popup.waitForTimeout(250);
    check('…dropped on the right edge of the content, a new group splits off there', area && (await popup.locator('.mx-tabdocs__group').count()) === 2);
    // The splitter there, by the keys.
    const sash = popup.locator('.mx-tabdocs__sash').first();
    await sash.focus();
    const before = await sash.getAttribute('aria-valuenow');
    await popup.keyboard.press('ArrowLeft');
    check('…and its splitter moves by the keys', (await sash.getAttribute('aria-valuenow')) !== before, `${before} → ${await sash.getAttribute('aria-valuenow')}`);
  }

  await axe(popup, 'the new window');

  // Back: dragged past the window's edge, a tab comes back to the main window.
  {
    const t = await box(popup.getByRole('tab', { name: /^Orders/ }));
    await popup.mouse.move(t.x + 20, t.y + t.height / 2);
    await popup.mouse.down();
    await popup.mouse.move(t.x + 40, t.y + t.height / 2, { steps: 3 });
    await popup.mouse.move(-200, t.y + 200, { steps: 8 });
    await popup.waitForTimeout(150);
    await popup.mouse.up();
    await popup.waitForTimeout(300);
    check('a tab dragged past the new window\'s edge comes back to the main window', (await titlesIn(m)).includes('Orders') && !(await titlesIn(popup)).includes('Orders'), JSON.stringify(await titlesIn(m)));
  }
  // The key there, Ctrl+K then Shift+D, brings the active document back.
  await popup.getByRole('tab', { name: /^Customer/ }).click();
  await popup.keyboard.press('Control+K');
  await popup.keyboard.press('Shift+D');
  await page.waitForTimeout(300);
  check('Ctrl+K, Shift+D in the new window brings its active document back', (await titlesIn(m)).includes('Customer'), JSON.stringify(await titlesIn(m)));
  // Closing the window brings the rest back.
  await popup.close();
  await page.waitForTimeout(300);
  check('closing the new window brings its documents back', JSON.stringify((await titlesIn(m)).sort()) === JSON.stringify(['Customer', 'Notes', 'Orders']), JSON.stringify(await titlesIn(m)));
  check('…still in the state they were in', (await s.locator('output').textContent()).includes('Every document is in this window. Customer: Ada Byron, Ankara'), await s.locator('output').textContent());

  // A single document, by the menu, and back by the button.
  await m.getByRole('tab', { name: /^Notes/ }).click({ button: 'right' });
  popup = await windowFrom(page.getByRole('menuitem', { name: 'Move into new window' }));
  check('"Move into new window" on the tab menu moves the document', JSON.stringify(await titlesIn(popup)) === JSON.stringify(['Notes']));
  await s.getByRole('button', { name: 'Bring everything back' }).click();
  await page.waitForTimeout(300);
  check('"Bring everything back" (moveToMainWindow): back, and the window closes', popup.isClosed() && (await titlesIn(m)).includes('Notes'));

  // Blocked: a floating window instead.
  m = await open('closing');
  const c = section('closing');
  await c.getByRole('switch', { name: 'The browser blocks new windows' }).click();
  await m.getByRole('tab', { name: /^Notes/ }).click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Move into new window' }).click();
  await page.waitForTimeout(250);
  const log = await c.locator('.td-log li').allTextContents();
  check('a blocked window: onError, and a floating window opens instead', (await m.locator('.mx-tabdocs__window').count()) === 1 && log.some((l) => l.includes('error: windowBlocked, fallback float')), JSON.stringify(log));
  await c.getByRole('switch', { name: 'The browser blocks new windows' }).click();

  // Closed with "close": a document with unsaved changes is asked about, in the main window.
  await c.getByRole('switch', { name: 'Documents come back when the window closes' }).click();
  await m.getByRole('tab', { name: /^Draft/ }).click({ button: 'right' });
  popup = await windowFrom(page.getByRole('menuitem', { name: 'Move into new window' }));
  await popup.close();
  await page.waitForTimeout(300);
  const asked = await page.evaluate(() => document.querySelector('dialog[open]')?.textContent ?? '');
  check('closing it with "close": the unsaved document is asked about here', asked.includes('unsaved changes'), asked);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('…and stays open (back here) when the answer is no', (await titlesIn(m)).includes('Draft'));

  // Save and reload with a window.
  m = await open('layout');
  const l = section('layout');
  popup = await windowFrom(l.getByRole('button', { name: 'Move To do into a new window' }));
  await l.getByRole('button', { name: 'Save layout' }).click();
  const json = JSON.parse(await l.locator('pre.td-json').textContent());
  check('saveLayout writes the window (version 3: its place on the screen, its layout, where it came from)', json.version === 3 && json.browserWindows?.length === 1 && json.browserWindows[0].root.documents[0].title === 'To do' && typeof json.browserWindows[0].rect.x === 'number' && json.browserWindows[0].home === 0, JSON.stringify(json.browserWindows));
  await l.getByRole('button', { name: 'Restore layout' }).click();
  await page.waitForTimeout(300);
  check('restored as floating windows (the default); the old window closes', popup.isClosed() && (await m.locator('.mx-tabdocs__window').count()) === 1);
  await l.getByRole('radio', { name: 'As windows again' }).click();
  popup = await windowFrom(l.getByRole('button', { name: 'Restore layout' }));
  check('restored as windows again, from the click', JSON.stringify(await titlesIn(popup)) === JSON.stringify(['To do']) && (await m.locator('.mx-tabdocs__window').count()) === 0);
  await l.getByRole('radio', { name: 'In this window' }).click();
  await l.getByRole('button', { name: 'Restore layout' }).click();
  await page.waitForTimeout(300);
  check('restored in the main window: its group joins the documents', popup.isClosed() && (await titlesIn(m)).includes('To do') && (await m.locator('.mx-tabdocs__group').count()) === 2);
  await page.reload({ waitUntil: 'load' });
  check('the page reloads clean', (await page.locator('.mx-tabdocs__window').count()) === 0);
}
