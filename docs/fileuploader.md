# FileUploader

> Editors · @motifx-community/ui 0.1.0-beta.11

Lets users select files with a button or drop them on the box. Files are listed with their size and status, and can upload automatically, on a button click or programmatically, with progress, cancel, retry and remove for each file. Files that exceed the limits are listed with the reason.

## Import

```tsx
import { FileUploader } from '@motifx-community/ui';
```

## Selecting, dropping and uploading

`upload` is your own function for sending a file. Report progress, stop on the signal, and resolve to the response. Alternatively, with `uploadUrl`, the uploader sends the file itself, either in one request or in chunks (`chunkSize`).

```tsx
import { reactive } from '@motifx/core';
import { FileUploader, Stack } from '@motifx-community/ui';

// Simulates a server: takes two seconds per megabyte, reports progress and stops on the signal.
const send = (file: File, report: (fraction: number) => void, signal: AbortSignal) =>
    new Promise<string>((resolve, reject) => {
        const steps = 20;
        const wait = Math.max(600, Math.min(4000, (file.size / 1_000_000) * 2000)) / steps;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            report(step / steps);
            if (step === steps) {
                clearInterval(timer);
                resolve(`id-${file.name}`);
            }
        }, wait);
        signal.addEventListener('abort', () => {
            clearInterval(timer);
            reject(new Error('stopped'));
        });
    });

/** Selected or dropped files upload immediately through a custom function, and each row shows progress, cancel, retry and remove. */
export default function Basic() {
    const s = reactive({ files: [] as readonly File[], told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <FileUploader
                label="Attachments"
                helpText="Any files; a stand-in server takes them."
                upload={send}
                x-model={() => s.files}
                onUploaded={e => (s.told = `${e.file.name} is up as ${String(e.item.response)}.`)}
                onUploadAborted={e => (s.told = `${e.file.name} was stopped.`)}
            />
            <output class="fu-told">{() => s.told || `${s.files.length} file(s) taken`}</output>
        </Stack>
    );
}
```

## Limits

```tsx
import { reactive } from '@motifx/core';
import { FileUploader, Stack } from '@motifx-community/ui';

/** Only pictures and PDFs, up to 2 MB each and three in all; a file outside is listed with the reason. */
export default function Limits() {
    const s = reactive({ files: [] as readonly File[], refused: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <FileUploader
                label="Documents"
                accept=".pdf,image/*"
                maxFileSize={2_000_000}
                maxFiles={3}
                required
                x-model={() => s.files}
                onFilesAdded={e => (s.refused = e.refused.length ? e.refused.map(r => r.message).join(' ') : '')}
            />
            <output class="fu-refused">{() => s.refused}</output>
        </Stack>
    );
}
```

## Upload modes

```tsx
import { reactive } from '@motifx/core';
import { Button, FileUploader, Stack } from '@motifx-community/ui';

const quick = (file: File, report: (fraction: number) => void) =>
    new Promise<void>(resolve => {
        let step = 0;
        const timer = setInterval(() => {
            report(++step / 10);
            if (step === 10) {
                clearInterval(timer);
                resolve();
            }
        }, 120);
    });

/** An Upload button sends the selected files, or nothing is sent until code requests it. One file only, with no dropping. */
export default function Modes() {
    const s = reactive({ one: [] as readonly File[] });
    let manual!: FileUploader;
    return (
        <Stack gap="md" style="inline-size: 100%">
            <FileUploader label="Photo" multiple={false} allowDrop={false} accept="image/*" upload={quick} uploadMode="button" x-model={() => s.one} />
            <Stack orientation="horizontal" wrap align="center">
                <FileUploader ref={(u: FileUploader) => (manual = u)} label="Logs" accept=".log,.txt" upload={quick} uploadMode="manual" />
                <Button text="Send the logs" variant="outline" onclick={() => void manual.upload()} />
            </Stack>
        </Stack>
    );
}
```

## Uploading to a server

The uploader posts a form with the file in `uploadField` (`file` by default) to `uploadUrl`, using `uploadHeaders`. A 2xx response becomes the item's `response`, and JSON is parsed. With `chunkSize`, each chunk carries `Content-Range` and the `chunkIndex` and `chunkCount` fields.

```tsx
<FileUploader
  label="Attachments"
  uploadUrl="/api/files"
  uploadHeaders={{ Authorization: 'Bearer ' + token }}
  chunkSize={1_000_000}
  onUploaded={(e) => this.attachments.push(e.item.response as Attachment)}
/>
```

## Behavior

| Topic | Details |
| --- | --- |
| `Choosing` | The button opens the file dialog. Files can also be dropped on the box, which is highlighted while they are over it. |
| `Refusing` | A file that does not meet `accept`, the size limits or `maxFiles` is listed as rejected with the reason, and is not added to the value. |
| `Uploading` | Uploads start on selection, on the Upload button, or programmatically. Each row shows progress and a Cancel button during the upload, then “Uploaded” or the failure with Retry. The server response is available as the item's `response`, with JSON parsed. |
| `Chunks` | With `chunkSize`, the file is sent in chunks, each in a request with `Content-Range: bytes start-end/total`, and progress covers the whole file. |
| `Removing chips` | Each row has a remove button. A running upload is stopped first. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Button` | The select button is the field's control. The label is associated with it, and Space and Enter open the dialog. |
| `List` | A list of rows with the name, size and status as text, a progress bar named after the file, and buttons named “Cancel the upload of …”, “Retry” and “Remove …”. |
| `Messages` | Rejection reasons and failures use the kit language or the server's message. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-file-uploader` | The field. `data-dragover` while files are over it. |
| `.mx-file-uploader__select, .mx-file-uploader__drop, .mx-file-uploader__upload` | The select button, the hint and the Upload button. |
| `.mx-file-uploader__list, .mx-file-uploader__item` | The list and each row. `data-status` on the row. |
| `.mx-file-uploader__icon, __name, __size, __state, __progress, __actions, __action` | The parts of a row. |

### Component tokens

| Token | Description |
| --- | --- |
| `file-uploader.over, .select, .upload, .hint, .list, .item, .icon, .name, .size, .state` | Units: the box with files over it, the two buttons (`hover`, `pressed`, `focus`, `disabled`), the hint, the list, a row per status, the file glyph and the text. |
| `file-uploader.field, .action` | Places: the field box as a drop zone (a dashed frame, its corners and its padding) and the row buttons. |
| `file-uploader.box-gap, .button-gap, .item-gap` | The spacing in the box, in a button and in a row. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<readonly File[]>` | `[]` | The accepted files, excluding rejected ones. `x-model` provides two-way binding. |
| `multiple` | `Bind<boolean>` | `true` | Allows several files at once. `false` keeps only the most recent one. |
| `accept` | `Bind<string>` | `''` | The accepted file types, as in `<input type="file">`: `.png,.jpg`, `image/*`, `application/pdf`. |
| `maxFileSize, minFileSize` | `Bind<number \| null>` | `null` | Size limits in bytes. A file outside the limits is listed as rejected with the reason. |
| `maxFiles` | `Bind<number \| null>` | `null` | The maximum number of files. |
| `allowDrop` | `Bind<boolean>` | `true` | Allows files to be dropped on the box. |
| `uploadMode` | `Bind<UploadMode>` | `instant` / `manual` | `instant` uploads on selection, `button` adds an Upload button, and `manual` uses `upload()` programmatically. The default is `instant` with `uploadUrl` or `upload`, and `manual` otherwise. |
| `uploadUrl, uploadMethod, uploadHeaders, uploadField` | `Bind<string \| null>`, … | `null`, `POST`, `null`, `file` | Where and how the uploader sends a file itself, using XMLHttpRequest with progress, as a form with the file in `uploadField`. |
| `chunkSize` | `Bind<number \| null>` | `null` | Bytes per request. The file is sent in chunks, each with `Content-Range` and the `chunkIndex` and `chunkCount` fields, and the last response is used. |
| `upload` | `(file, report, signal) => Promise<unknown>` | — | A custom upload function used instead of `uploadUrl`. Call `report(0…1)` to report progress and stop on `signal`. The value it resolves to becomes the response. |
| `selectText, dropText, uploadText` | `Bind<string>` | Kit default | The button, the hint next to it and the Upload button. |
| `showFileList` | `Bind<boolean>` | `true` | The list of files below the box. |
| `label, helpText, required, rules, readOnly, size, variant…` |  |  | Field props shared by all editors. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `items` | read-only | Every file in the list with its state: `file`, `status` (`ready`, `uploading`, `done`, `error`, `aborted`, `invalid`), `progress`, `response` and `message`. |
| `isUploading` | read-only | Indicates that an upload is running. |
| `openDialog()` | `void` | Opens the browser's file dialog, the same as the button. |
| `addFiles(files)` | `void` | Adds files as if the user selected them. The limits apply, `onFilesAdded` is raised, and uploads start according to the mode. |
| `upload(item?)` | `Promise<void>` | Uploads the waiting files, or one of them. This is what `manual` mode calls. |
| `abort(item?), remove(item), clear()` | `void` | Stops an upload (the file remains, marked as canceled), removes a file, or removes all files. |
| `onFilesAdded` | event | Occurs when files are selected or dropped (`files`, `refused`). Set `cancel = true` to accept none. |
| `onFileRemoved, onUploadStarted, onProgress, onUploaded, onUploadError, onUploadAborted` | event | Reports each stage of a file's upload, with `item` and `file`, and `error` on failure. |
| `onValueChanged` | event | Occurs when the accepted files change. |

## Feedback

Loading issues…
