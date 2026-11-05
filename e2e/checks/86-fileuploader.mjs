/** Real-browser checks of the file uploader page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'fileuploader', { waitUntil: 'load' });
    const ways = page.locator('section[aria-labelledby="ways"]');
    const select = ways.getByRole('button', { name: /Attachments Select files/ });
    await select.waitFor();
    check('the select button is the field’s control, with the drop hint beside it', (await ways.locator('.mx-file-uploader__drop').textContent()) === 'or drop them here');

    // Files set on the hidden input are taken and go up: progress, then done.
    const input = ways.locator('input[type="file"]');
    await input.setInputFiles([
        { name: 'report.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(300_000) },
        { name: 'photo.png', mimeType: 'image/png', buffer: Buffer.alloc(120_000) }
    ]);
    const rows = ways.locator('.mx-file-uploader__item');
    await rows.first().waitFor();
    check('two rows with the names and sizes', (await rows.count()) === 2 && (await rows.nth(0).locator('.mx-file-uploader__name').textContent()) === 'report.pdf' && (await rows.nth(0).locator('.mx-file-uploader__size').textContent()) === '300 kB');
    check('an upload runs with its progress bar', (await rows.nth(0).getAttribute('data-status')) === 'uploading' && (await rows.nth(0).getByRole('progressbar').count()) === 1);
    await rows.nth(0).getByRole('button', { name: 'Cancel the upload of report.pdf' }).click();
    await page.waitForTimeout(100);
    check('Cancel stops it and offers Retry', (await rows.nth(0).getAttribute('data-status')) === 'aborted' && (await rows.nth(0).getByRole('button', { name: 'Retry' }).count()) === 1);
    await page.waitForFunction(() => document.querySelectorAll('section[aria-labelledby="ways"] .mx-file-uploader__item[data-status="done"]').length === 1, null, { timeout: 8000 }).catch(() => {});
    check('the other one finishes', (await rows.nth(1).getAttribute('data-status')) === 'done' && (await rows.nth(1).locator('.mx-file-uploader__state').textContent()) === 'Uploaded');
    check('x-model counts the files taken', (await ways.locator('.fu-told').textContent()).includes('photo.png is up as id-photo.png'));
    await rows.nth(1).getByRole('button', { name: 'Remove photo.png' }).click();
    await page.waitForTimeout(100);
    check('Remove takes the row out', (await rows.count()) === 1);

    // Limits: refused files are listed with the reason.
    const limits = page.locator('section[aria-labelledby="limits"]');
    await limits.locator('input[type="file"]').setInputFiles([
        { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.alloc(10) },
        { name: 'huge.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(3_000_000) },
        { name: 'ok.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(1000) }
    ]);
    await limits.locator('.mx-file-uploader__item').first().waitFor();
    const statuses = await limits.locator('.mx-file-uploader__item').evaluateAll(els => els.map(el => el.dataset.status));
    check('the type and the size refuse two, one is taken', statuses.join() === 'ready,invalid,invalid', statuses.join());
    check('the reasons are told', (await limits.locator('.fu-refused').textContent()).includes('notes.txt is not a file type allowed here.') && (await limits.locator('.fu-refused').textContent()).includes('huge.pdf is larger than 2 MB.'));

    // Modes: one file, no drop hint, an Upload button that sends it.
    const modes = page.locator('section[aria-labelledby="modes"]');
    const photo = modes.locator('.mx-file-uploader').first();
    check('one file only: the hint is gone and the button says so', (await photo.getByRole('button', { name: /Photo Select a file/ }).count()) === 1 && (await photo.locator('.mx-file-uploader__drop').isHidden()));
    await photo.locator('input[type="file"]').setInputFiles([{ name: 'me.png', mimeType: 'image/png', buffer: Buffer.alloc(100) }]);
    await photo.locator('.mx-file-uploader__item').first().waitFor();
    check('with the button mode nothing goes up by itself', (await photo.locator('.mx-file-uploader__item').getAttribute('data-status')) === 'ready');
    await photo.getByRole('button', { name: 'Upload' }).click();
    await page.waitForFunction(() => document.querySelector('section[aria-labelledby="modes"] .mx-file-uploader__item')?.dataset.status === 'done', null, { timeout: 5000 }).catch(() => {});
    check('the Upload button sends it', (await photo.locator('.mx-file-uploader__item').getAttribute('data-status')) === 'done');

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
