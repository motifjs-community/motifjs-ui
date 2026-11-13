import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { FileUploader } from './FileUploader';
import type { UploadItem } from './upload-item';

const hosts: Component[] = [];

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
    document.body.innerHTML = '';
    await uiLocale.use('en');
    uiLocale.strings = enStrings;
});

function page(...children: Parameters<typeof mountHost>) {
    const host = mountHost(...children);
    hosts.push(host);
    return host;
}

async function settle() {
    for (let i = 0; i < 4; i++) await tick();
}

const file = (name: string, size: number, type = 'text/plain') => new File([new Uint8Array(size)], name, { type });
const rows = (u: FileUploader) => Array.from(u.element.querySelectorAll<HTMLElement>('.mx-file-uploader__item'));

describe('FileUploader', () => {
    it('takes files within its limits, lists the refused ones with the reason, and gives the value back through x-model', async () => {
        const s = reactive({ files: [] as readonly File[] });
        let up!: FileUploader;
        page(<FileUploader ref={(u: FileUploader) => (up = u)} label="Attachments" accept=".pdf,image/*" maxFileSize={1000} maxFiles={2} x-model={() => s.files} />);
        await settle();
        expect(up.uploadParts.selectPart.element.textContent).toContain(enStrings.fileSelect);
        const notes = file('notes.txt', 10);
        const big = file('big.pdf', 5000, 'application/pdf');
        const a = file('a.pdf', 100, 'application/pdf');
        const b = file('b.png', 100, 'image/png');
        const c = file('c.png', 100, 'image/png');
        up.addFiles([notes, big, a, b, c]);
        await settle();
        expect(s.files).toEqual([a, b]);
        expect(up.items.map(i => `${i.file.name}:${i.status}`)).toEqual(['a.pdf:ready', 'b.png:ready', 'notes.txt:invalid', 'big.pdf:invalid', 'c.png:invalid']);
        expect(up.items[2].message).toBe('notes.txt is not a file type allowed here.');
        expect(up.items[3].message).toContain('big.pdf is larger than');
        expect(up.items[4].message).toBe('At most 2 files.');
        expect(rows(up).map(r => r.dataset.status)).toEqual(['ready', 'ready', 'invalid', 'invalid', 'invalid']);
        expect(rows(up)[0].querySelector('.mx-file-uploader__size')!.textContent).toBe('100 byte');
        up.remove(up.items[0]);
        await settle();
        expect(s.files).toEqual([b]);
        expect(rows(up).length).toBe(4);
    });

    it('uploads with your own function as files come: progress, done, failure, retry, abort', async () => {
        const told: string[] = [];
        let fail = true;
        let release: ((value: unknown) => void) | null = null;
        const up = new FileUploader({
            upload: (f, report, signal) =>
                new Promise((resolve, reject) => {
                    report(0.5);
                    if (fail) {
                        reject(new Error('Server says no'));
                        return;
                    }
                    release = resolve;
                    signal.addEventListener('abort', () => reject(new Error('stopped')));
                }),
            onUploadStarted: e => told.push(`start:${e.file.name}`),
            onProgress: e => told.push(`progress:${e.item.progress}`),
            onUploaded: e => told.push(`done:${String(e.item.response)}`),
            onUploadError: e => told.push(`error:${e.item.message}`),
            onUploadAborted: e => told.push(`aborted:${e.file.name}`)
        });
        page(up);
        await settle();
        expect(up.uploadMode).toBe('instant');
        const doc = file('doc.txt', 10);
        up.addFiles([doc]);
        await settle();
        expect(up.items[0].status).toBe('error');
        expect(rows(up)[0].querySelector('.mx-file-uploader__state')!.textContent).toBe('Server says no');
        fail = false;
        void up.upload(up.items[0]);
        await settle();
        expect(up.items[0].status).toBe('uploading');
        expect(up.isUploading).toBe(true);
        up.abort();
        await settle();
        expect(up.items[0].status).toBe('aborted');
        void up.upload(up.items[0]);
        await settle();
        release!('ok');
        await settle();
        expect(up.items[0].status).toBe('done');
        expect(told).toEqual(['start:doc.txt', 'progress:0.5', 'error:Server says no', 'start:doc.txt', 'progress:0.5', 'aborted:doc.txt', 'start:doc.txt', 'progress:0.5', 'done:ok']);
    });

    it('waits for the Upload button or for code, keeps one file when not multiple, and says its texts in the kit language', async () => {
        const up = new FileUploader({ multiple: false, uploadUrl: '/files', uploadMode: 'button' });
        page(up);
        await settle();
        expect(up.uploadParts.selectPart.element.textContent).toContain(enStrings.fileSelectOne);
        expect(up.uploadParts.uploadPart.element.hidden).toBe(false);
        expect(up.uploadParts.uploadPart.element.textContent).toBe(enStrings.fileUpload);
        up.addFiles([file('one.txt', 1)]);
        up.addFiles([file('two.txt', 1)]);
        await settle();
        expect(up.value.map(f => f.name)).toEqual(['two.txt']);
        expect(up.items[0].status).toBe('ready');
        await uiLocale.use('tr');
        expect(up.uploadParts.uploadPart.element.textContent).not.toBe(enStrings.fileUpload);
        up.uploadMode = 'manual';
        expect(up.uploadParts.uploadPart.element.hidden).toBe(true);
    });

    it('is required like any field, and takes files given as a value', async () => {
        const given = file('given.txt', 3);
        const up = new FileUploader({ required: true });
        page(up);
        await settle();
        expect(await up.validate()).toBe(false);
        up.value = [given];
        await settle();
        expect(up.items.map((i: UploadItem) => i.file)).toEqual([given]);
        expect(await up.validate()).toBe(true);
        up.clear();
        expect(up.items.length).toBe(0);
        expect(up.value).toEqual([]);
    });
});
