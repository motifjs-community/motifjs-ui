/** Real-browser checks of the language page: a switch loads the pack and every control follows. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'language', { waitUntil: 'load' });
    const inUse = async (locale) => page.waitForFunction((l) => document.querySelector('.lang-locale')?.textContent === l, locale, { timeout: 3000 }).catch(() => {});

    // A switch: the pack is loaded, then the controls write Turkish.
    const sw = page.locator('section[aria-labelledby="switch"]');
    await sw.getByRole('button', { name: 'Türkçe' }).waitFor();
    const pager = sw.locator('.mx-pagination');
    check('the pager writes English', (await pager.textContent()).includes('Page 1 of 10'));
    await sw.getByRole('button', { name: 'Türkçe' }).click();
    await inUse('tr');
    check('the locale in use is told', (await sw.locator('.lang-locale').textContent()) === 'tr');
    check('the pager writes Turkish', (await pager.textContent()).includes('Sayfa 1 / 10'), await pager.textContent());
    check('the date box is named in Turkish', (await sw.getByRole('button', { name: 'Tarih seç' }).count()) === 1);
    await sw.getByRole('button', { name: 'English' }).click();
    await inUse('en');
    check('and English again', (await pager.textContent()).includes('Page 1 of 10'));

    // A pack of your own: German for what it has, English for the rest.
    const packs = page.locator('section[aria-labelledby="packs"]');
    await packs.getByRole('button', { name: 'Deutsch' }).click();
    await packs.getByRole('combobox', { name: 'Empty list' }).click();
    const empty = page.locator('.mx-list__empty');
    await empty.waitFor();
    check('the own pack names the empty list', (await empty.textContent()) === 'Keine Einträge', await empty.textContent());
    await page.keyboard.press('Escape');
    await packs.getByRole('button', { name: 'English' }).click();
    await inUse('en');

    // The app's translations lead, the kit follows.
    const connect = page.locator('section[aria-labelledby="connect"]');
    await connect.getByRole('button', { name: 'Türkçe' }).click();
    await page.waitForFunction(() => document.querySelector('.lang-greeting')?.textContent === 'Merhaba Ada', null, { timeout: 3000 }).catch(() => {});
    check('the app text switched', (await connect.locator('.lang-greeting').textContent()) === 'Merhaba Ada');
    await connect.getByRole('button', { name: 'Temizle' }).waitFor({ timeout: 3000 }).catch(() => {});
    check('the kit followed: the clear button is named in Turkish', (await connect.getByRole('button', { name: 'Temizle' }).count()) === 1);
    await connect.getByRole('button', { name: 'English' }).click();
    await inUse('en');

    // Own texts drawn on the event, the kit's plural text filled in.
    const own = page.locator('section[aria-labelledby="own-texts"]');
    check('the plural text is filled', (await own.locator('.lang-records').textContent()) === '3 records');
    await own.getByRole('button', { name: 'Türkçe' }).click();
    await page.waitForFunction(() => document.querySelector('.lang-own-title')?.textContent === 'Siparişler', null, { timeout: 3000 }).catch(() => {});
    check('own texts follow the kit', (await own.locator('.lang-own-title').textContent()) === 'Siparişler' && (await own.locator('.lang-records').textContent()) === '3 kayıt');
    await own.getByRole('button', { name: 'English' }).click();
    await inUse('en');

    // A control's own locale is its own.
    const formats = page.locator('section[aria-labelledby="formats"]');
    const german = await formats.getByRole('spinbutton', { name: 'Betrag' }).inputValue();
    check('a German number box writes German', german.includes('98.765,43'), german);

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
