/** Real-browser checks of the app page. */
export default async function ({ page, base, check }) {
  await page.goto(base, { waitUntil: 'load' });
  await page.evaluate(() => (window.__sameDocument = true));
  await page.locator('.docs-sidebar a', { hasText: 'TextBox' }).click();
  await page.waitForURL(/\/textbox$/);
  await page.locator('section[aria-labelledby="mask"]').waitFor();
  check('a menu link opens the page in the same document', await page.evaluate(() => window.__sameDocument === true));
  check('…with its title, heading and menu mark', (await page.title()) === 'TextBox · MotifJS UI' && (await page.locator('h1').textContent()) === 'TextBox' && (await page.locator('.docs-sidebar a[aria-current="page"]').textContent()) === 'TextBox');
  check('…its sections on the right, from the page itself', (await page.locator('.docs-rail__sections a').first().textContent()) === 'Import' && (await page.locator('.docs-rail__sections a').count()) > 10);
  check('…and focus at the top of the new page', await page.evaluate(() => document.activeElement?.id === 'content'));
  await page.goBack();
  await page.waitForURL(base);
  check('Back returns to the previous page', (await page.locator('h1').textContent()) === '@motifx-community/ui' && (await page.locator('.docs-rail__sections a').count()) === 4);
  await page.goto(base + 'no-such-page', { waitUntil: 'load' });
  check('an unknown address shows the not-found page inside the frame', (await page.locator('h1').textContent()) === 'Page not found' && (await page.locator('.docs-sidebar').count()) === 1);

  await page.goto(base, { waitUntil: 'load' });
  const chooseTheme = async (name) => {
    await page.getByRole('button', { name: 'Theme', exact: true }).click();
    await page.getByRole('menuitemcheckbox', { name, exact: true }).click();
  };
  await chooseTheme('Dark');
  check('theme menu sets data-theme', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
  await page.getByRole('button', { name: 'Theme', exact: true }).click();
  check('…and checks the chosen theme', (await page.getByRole('menuitemcheckbox', { name: 'Dark', exact: true }).getAttribute('aria-checked')) === 'true');
  await page.keyboard.press('Escape');
  const canvasDark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await chooseTheme('Light');
  const canvasLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('theme actually repaints the canvas', canvasDark !== canvasLight, `${canvasDark} vs ${canvasLight}`);
  const compact = page.getByRole('button', { name: 'Compact', exact: true });
  const heightBefore = (await compact.boundingBox()).height;
  await compact.click();
  const heightAfter = (await compact.boundingBox()).height;
  check('compact density shrinks controls', heightAfter < heightBefore, `${heightBefore} → ${heightAfter}`);
  await compact.click();

  await page.goto(base + 'button', { waitUntil: 'load' });
  const current = page.locator('.docs-sidebar a[aria-current="page"]');
  check('the side menu marks the page', (await current.textContent()) === 'Button');
  const toggleCard = page.locator('section[aria-labelledby="toggle"]');
  check('an example keeps its code closed at first', !(await toggleCard.locator('pre').isVisible()));
  await toggleCard.getByRole('button', { name: 'Show code' }).click();
  check('…and Show code opens it', (await toggleCard.locator('pre').isVisible()) && (await toggleCard.getByRole('button', { name: 'Hide code' }).count()) === 1);
  await page.locator('.docs-filter input').fill('key');
  check('the filter keeps the matching pages', (await page.locator('.docs-sidebar li:visible').allTextContents()).join() === 'Keyboard and focus');
  await page.locator('.docs-filter input').fill('');
  await page.getByRole('button', { name: 'Foundations', exact: true }).click();
  check('a group closes from its title', !(await page.locator('.docs-sidebar a', { hasText: 'Control' }).isVisible()));
  await page.getByRole('button', { name: 'Foundations', exact: true }).click();
  await page.locator('#menu').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.waitForTimeout(150);
  const reading = await page.locator('.docs-rail a[aria-current="location"]').textContent();
  check('the sections on the right follow the scroll', reading === 'Menu', reading);
  check('the side menu stays in place while the page scrolls', (await page.locator('.docs-sidebar').evaluate((el) => el.getBoundingClientRect().top)) > 0);
  await page.setViewportSize({ width: 700, height: 900 });
  const sidebar = page.locator('.docs-sidebar');
  check('narrow: the side menu is a closed drawer', !(await sidebar.isVisible()));
  await page.getByRole('button', { name: 'Menu' }).click();
  check('…that the menu button opens', await sidebar.isVisible());
  await page.keyboard.press('Escape');
  check('…and Escape closes, focus back on the button', !(await sidebar.isVisible()) && (await page.getByRole('button', { name: 'Menu' }).evaluate((el) => document.activeElement === el)));
  await page.setViewportSize({ width: 1280, height: 900 });
}
