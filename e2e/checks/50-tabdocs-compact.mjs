/** Real-browser checks of the compact bars of dock areas and floating windows (the Dock page): room for the tabs, the count, the thin scrollbar, the title, the one "…" menu. */
export default async function ({ page, base, check, axeSource, box }) {
  /** The room for the tabs of a group, what takes the rest, and the tabs fully in sight. */
  const measure = (g) =>
    g.evaluate((el) => {
      const w = (n) => (n && n.offsetParent ? Math.round(n.getBoundingClientRect().width) : 0);
      const list = el.querySelector('[role="tablist"]');
      const c = list.getBoundingClientRect();
      const tabs = [...el.querySelectorAll('[role="tab"]')].filter((t) => t.offsetParent);
      const seen = tabs.filter((t) => {
        const r = t.getBoundingClientRect();
        return r.left >= c.left - 1 && r.right <= c.right + 1;
      });
      const actions = el.querySelector('.mx-tabdocs__actions');
      return {
        width: w(el),
        room: Math.round(c.width),
        scrolls: [...el.querySelectorAll('.mx-tabdocs__scroll')].reduce((s, b) => s + w(b), 0),
        buttons: [...actions.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.getAttribute('aria-label') || b.title),
        tabs: tabs.length,
        seen: seen.length,
      };
    });
  const axe = async (label) => {
    for (const theme of ['light', 'dark']) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await page.waitForTimeout(150);
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
      check(`${label}: axe clean in ${theme}`, violations.length === 0, violations.join(' ;; '));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  };
  const section = (anchor) => page.locator(`section[aria-labelledby="${anchor}"]`);
  /** Waits for the page to stop scrolling (the docs scroll smoothly). */
  const still = async (loc) => {
    let a = await box(loc);
    for (let i = 0; i < 25; i++) {
      await page.waitForTimeout(60);
      const b = await box(loc);
      if (Math.abs(b.y - a.y) < 0.5) return b;
      a = b;
    }
    return a;
  };

  await page.setViewportSize({ width: 1400, height: 950 });
  await page.goto(base + 'tabdocs/dock', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));

  // A floating window of 418 pixels with three documents.
  const floats = section('windows');
  await floats.scrollIntoViewIfNeeded();
  await floats.getByRole('button', { name: 'Float README.md' }).click();
  await page.waitForTimeout(300);
  const win = page.locator('.mx-tabdocs__window').first();
  for (const name of ['router.ts', 'orders.ts']) {
    const tab = floats.locator('.mx-tabdocs__group').first().getByRole('tab', { name: new RegExp(`^${name.replace('.', '\\.')}`) }).first();
    const t = await tab.boundingBox();
    const strip = await win.locator('[role="tablist"]').first().boundingBox();
    await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
    await page.mouse.down();
    await page.mouse.move(t.x + 30, t.y + 20, { steps: 4 });
    await page.mouse.move(strip.x + strip.width - 4, strip.y + strip.height / 2, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(200);
  }
  await win.evaluate((w) => (w.style.setProperty('--_w', '420px')));
  await page.waitForTimeout(200);
  const wg = win.locator('.mx-tabdocs__group').first();
  const inWindow = await measure(wg);
  console.log('window', JSON.stringify(inWindow));
  check('a floating window keeps most of its bar for the tabs (214 px before)', inWindow.room >= 300 && inWindow.scrolls === 0, JSON.stringify(inWindow));
  check('…all three tabs in sight (1 before)', inWindow.tabs === 3 && inWindow.seen === 3, JSON.stringify(inWindow));
  check('…beside "…" and the close button only', JSON.stringify(inWindow.buttons) === '["Open documents and commands","Close window"]', JSON.stringify(inWindow.buttons));

  // The one "…" menu of the window: its buttons and commands first, then the documents.
  await wg.getByRole('button', { name: /^Open documents and commands/ }).click();
  await page.waitForTimeout(250);
  const popup = page.locator('.mx-tabdocs__popup:popover-open').first();
  const menu = await popup.evaluate((p) => ({
    items: [...p.querySelectorAll('.mx-menu__item')].filter((i) => i.offsetParent).map((i) => i.querySelector('.mx-menu__label').textContent),
    menuFirst: !!(p.querySelector('.mx-menu').compareDocumentPosition(p.querySelector('.mx-tabdocs__list')) & Node.DOCUMENT_POSITION_FOLLOWING),
    options: [...p.querySelectorAll('[role="option"]')].length,
  }));
  check('the window\'s "…" menu: its buttons, Dock back and the commands above the list of documents', JSON.stringify(menu.items) === '["Split right","Maximize window","Dock back","Close all","Close saved","Lock group"]' && menu.menuFirst && menu.options === 3, JSON.stringify(menu));
  check('…focus is in its search box', await page.evaluate(() => !!document.activeElement.closest('.mx-tabdocs__list')));
  await page.keyboard.press('Shift+Tab');
  const reached = await page.evaluate(() => document.activeElement.closest('.mx-menu__item')?.textContent ?? document.activeElement.outerHTML.slice(0, 80));
  check('…Shift+Tab reaches the commands, at the last one', reached.includes('Lock group'), reached);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await wg.getByRole('button', { name: 'Close window' }).click();
  await page.waitForTimeout(250);
  check('…the close button closes the window', (await page.locator('.mx-tabdocs__window').count()) === 0);

  // The left area of the IDE example slid out.
  const ide = section('ide');
  await ide.scrollIntoViewIfNeeded();
  await ide.locator('.mx-tabdocs__autohide-tab').first().click();
  await page.waitForTimeout(500);
  const panel = ide.locator('.mx-tabdocs__area[data-auto-hide] .mx-tabdocs__group').first();
  const slid = await measure(panel);
  console.log('panel', JSON.stringify(slid));
  check('the slid out area keeps more of its bar for the tabs (91 px before)', slid.room >= 130 && slid.scrolls === 0, JSON.stringify(slid));
  check('…both tabs in sight (one cut before)', slid.tabs === 2 && slid.seen === 2, JSON.stringify(slid));
  check('…beside "…" and the pin only', JSON.stringify(slid.buttons) === '["Open documents and commands","Stop auto hiding"]', JSON.stringify(slid.buttons));
  await page.keyboard.press('Escape');

  // The compact bars example: three tools in a narrow area, one alone at the bottom.
  const ex = section('compact');
  await ex.locator('.mx-tabdocs').first().evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await still(ex.locator('.mx-tabdocs').first());
  const left = ex.locator('.mx-tabdocs__area[data-side="left"] .mx-tabdocs__group').first();
  const count = await left.evaluate((g) => ({
    over: g.querySelector('.mx-tabdocs__strip').hasAttribute('data-overflow'),
    count: g.querySelector('.mx-tabdocs__count')?.textContent ?? '',
    name: [...g.querySelectorAll('.mx-tabdocs__actions button')].map((b) => b.title).find((t) => t.startsWith('Open documents')),
  }));
  check('tabs out of sight are counted on the "…" button, also in its name', count.over && /^\+\d$/.test(count.count) && count.name === `Open documents and commands, ${count.count.slice(1)} not in sight`, JSON.stringify(count));
  const strip = left.locator('.mx-tabdocs__strip');
  const look = () =>
    left.evaluate((g) => ({
      bar: g.querySelector('.mx-tabdocs__bar').getBoundingClientRect().height,
      tabs: [...g.querySelectorAll('[role="tab"]')].map((t) => Math.round(t.getBoundingClientRect().top)).join(','),
      opacity: getComputedStyle(g.querySelector('.mx-tabdocs__scrollbar')).opacity,
      thumb: Math.round(g.querySelector('.mx-tabdocs__thumb').getBoundingClientRect().width),
      scroll: Math.round(Math.abs(g.querySelector('.mx-tabdocs__row').scrollLeft)),
    }));
  await page.mouse.move(10, 10);
  await page.waitForTimeout(250);
  const away = await look();
  const sb = await box(strip);
  await page.mouse.move(sb.x + 30, sb.y + sb.height / 2);
  await page.waitForTimeout(300);
  const over = await look();
  check('over the strip a thin scrollbar shows; the bar keeps its height and the tabs stay', away.opacity === '0' && over.opacity === '1' && over.thumb > 0 && over.bar === away.bar && over.tabs === away.tabs, `${JSON.stringify(away)} → ${JSON.stringify(over)}`);
  await left.locator('.mx-tabdocs__row').evaluate((r) => (r.scrollLeft = 0));
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);
  const wheeled = await look();
  check('a plain wheel scrolls the strip sideways', wheeled.scroll > 0, JSON.stringify(wheeled));
  const thumbBox = await box(left.locator('.mx-tabdocs__thumb'));
  await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(thumbBox.x - 40, thumbBox.y + thumbBox.height / 2, { steps: 4 });
  await page.mouse.up();
  const back = await look();
  check('…and dragging the thumb scrolls it back, moving nothing else', back.scroll < wheeled.scroll && (await ex.locator('.mx-tabdocs__window').count()) === 0, JSON.stringify(back));

  // One document as a title: the bottom area, and a floating window with its close button.
  const bottom = ex.locator('.mx-tabdocs__area[data-side="bottom"] .mx-tabdocs__group').first();
  const title = await bottom.evaluate((g) => {
    const t = g.querySelector('[role="tab"]');
    const s = getComputedStyle(t);
    return { title: g.hasAttribute('data-title'), role: t.getAttribute('role'), bg: s.backgroundColor, indicator: getComputedStyle(t, '::after').backgroundColor };
  });
  check('a single document shows as a title (still a tab), without the tab\'s box and indicator', title.title && title.role === 'tab' && title.bg === 'rgba(0, 0, 0, 0)' && title.indicator === 'rgba(0, 0, 0, 0)', JSON.stringify(title));
  await ex.getByRole('button', { name: 'Float README.md' }).click();
  await page.waitForTimeout(300);
  const w2 = page.locator('.mx-tabdocs__window').last();
  const wt = await w2.locator('.mx-tabdocs__group').first().evaluate((g) => ({ title: g.hasAttribute('data-title'), close: !!g.querySelector('[role="tab"] .mx-tabdocs__close')?.offsetParent }));
  check('…a floating window with one document: a title with its close button', wt.title && wt.close, JSON.stringify(wt));
  await axe('with compact bars, a title and a window');
  await w2.locator('[role="tab"] .mx-tabdocs__close').click();
  await page.waitForTimeout(300);
  check('…which closes the document, and the window with it', (await page.locator('.mx-tabdocs__window').count()) === 0 && (await ex.getByRole('tab', { name: /^README\.md/ }).count()) === 0);

  // Every part is a live setting.
  await ex.getByRole('switch', { name: 'Compact bars' }).click();
  await ex.getByRole('switch', { name: 'One document as a title' }).click();
  await page.waitForTimeout(250);
  const full = await measure(left);
  check('compact bars off: the whole toolbar again', full.buttons.some((b) => /^Open documents(,|$)/.test(b)) && !(await bottom.evaluate((g) => g.hasAttribute('data-title'))), JSON.stringify(full.buttons));
  await ex.getByRole('switch', { name: 'Left area: scroll buttons' }).click();
  await page.waitForTimeout(250);
  check('an area\'s own setting wins: scroll buttons in the left area only', (await left.evaluate((g) => g.hasAttribute('data-scroll-buttons'))) && !(await bottom.evaluate((g) => g.hasAttribute('data-scroll-buttons'))));
}
