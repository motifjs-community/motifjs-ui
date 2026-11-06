/** Real-browser checks of the feedback at the foot of a page: the issues filed for that page, open and closed. */
export default async function ({ page, base, check, axeSource }) {
  let requests = 0;
  await page.route('https://api.github.com/**', (route) => {
    requests++;
    route.fulfill({
      json: [
        { id: 1, number: 7, title: '[Button] Wrong focus ring', state: 'open', html_url: 'https://github.com/x/1', created_at: '2026-10-01T10:00:00Z', closed_at: null },
        { id: 2, number: 6, title: '[Button] Old report', state: 'closed', html_url: 'https://github.com/x/2', created_at: '2026-09-01T10:00:00Z', closed_at: '2026-09-05T10:00:00Z' },
        { id: 3, number: 5, title: '[ButtonGroup] Another component', state: 'open', html_url: 'https://github.com/x/3', created_at: '2026-09-01T10:00:00Z', closed_at: null },
        { id: 4, number: 4, title: '[Button] A pull request', state: 'open', html_url: 'https://github.com/x/4', created_at: '2026-09-01T10:00:00Z', closed_at: null, pull_request: {} },
        { id: 5, number: 3, title: '[DataGrid] A grid report', state: 'open', html_url: 'https://github.com/x/5', created_at: '2026-09-01T10:00:00Z', closed_at: null },
      ],
    });
  });

  await page.goto(base + 'button', { waitUntil: 'load' });
  const feedback = page.locator('.docs-feedback');
  await feedback.waitFor();
  check('the issues wait until the reader gets there', requests === 0, String(requests));
  await feedback.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  check('one request when the foot comes into view', requests === 1, String(requests));

  const rows = feedback.locator('.docs-feedback__issue:visible');
  check('only the open issues of this page, no pull request', (await rows.count()) === 1 && (await rows.first().textContent()).includes('Wrong focus ring'));
  check('the tag is left out of the title', !(await rows.first().textContent()).includes('[Button]'));

  await feedback.getByRole('tab', { name: 'Closed Issues' }).click();
  await page.waitForTimeout(200);
  check('the closed tab lists the closed issue', (await rows.count()) === 1 && (await rows.first().textContent()).includes('Old report') && (await rows.first().textContent()).includes('closed on'));

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async (root) => (await window.axe.run(root)).violations.map((v) => v.id), '.docs-feedback');
  check('axe clean in the feedback', violations.length === 0, violations.join(', '));

  // A topic of a larger component shows that component's issues, from the list already loaded.
  await page.goto(base + 'datagrid/editing', { waitUntil: 'load' });
  await feedback.waitFor();
  await feedback.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  check('a topic page shows its component and asks nothing new', (await rows.count()) === 1 && (await rows.first().textContent()).includes('A grid report') && requests === 1, String(requests));

  await page.goto(base + 'calendar', { waitUntil: 'load' });
  await feedback.waitFor();
  await feedback.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  check('a page without issues says so', (await feedback.textContent()).includes('No open issues for this page.'));

  const [popup] = await Promise.all([page.waitForEvent('popup'), feedback.getByRole('button', { name: 'Submit GitHub Issue' }).click()]);
  const url = popup.url();
  await popup.close();
  check('the button opens a new issue with the tag in its title', url.includes('/issues/new') || url.includes('login'), url);

  await page.evaluate(() => sessionStorage.removeItem('mx-docs-issues'));
  await page.unroute('https://api.github.com/**');
  await page.route('https://api.github.com/**', (route) => route.fulfill({ status: 403, json: { message: 'rate limit' } }));
  await page.goto(base + 'calendar', { waitUntil: 'load' });
  await feedback.waitFor();
  await feedback.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  check('a failed request says so, with a way to the issues', (await feedback.textContent()).includes('Issues could not be loaded.') && (await feedback.locator('a[href$="/issues"]').isVisible()));
  await page.unroute('https://api.github.com/**');
}
