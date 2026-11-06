import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Limits from './examples/Limits';
import Modes from './examples/Modes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['value', '`Bind<readonly File[]>`', '`[]`', 'The files taken (the refused ones are not in it). `x-model` binds it two-way.'],
    ['multiple', '`Bind<boolean>`', '`true`', 'Several files at once; `false` keeps one, the newest.'],
    ['accept', '`Bind<string>`', "`''`", 'What may be chosen, as for `<input type=\"file\">`: `.png,.jpg`, `image/*`, `application/pdf`.'],
    ['maxFileSize, minFileSize', '`Bind<number | null>`', '`null`', 'Bytes. A file outside is listed as refused, with the reason.'],
    ['maxFiles', '`Bind<number | null>`', '`null`', 'How many files may be taken in all.'],
    ['allowDrop', '`Bind<boolean>`', '`true`', 'Files may be dropped on the box.'],
    ['uploadMode', '`Bind<UploadMode>`', '`instant` / `manual`', '`instant`: as chosen; `button`: an Upload button; `manual`: `upload()` programmatically. Default `instant` with `uploadUrl` or `upload`, else `manual`.'],
    ['uploadUrl, uploadMethod, uploadHeaders, uploadField', '`Bind<string | null>`, …', '`null`, `POST`, `null`, `file`', 'Where and how the uploader itself sends a file (XMLHttpRequest, with progress), as a form with the file in `uploadField`.'],
    ['chunkSize', '`Bind<number | null>`', '`null`', 'Bytes per request: the file goes in pieces, each with its `Content-Range` and `chunkIndex` / `chunkCount` fields; the last answer is the response.'],
    ['upload', '`(file, report, signal) => Promise<unknown>`', '—', 'Your own upload instead of `uploadUrl`: call `report(0…1)` as it goes, stop on `signal`; what it resolves to is the response.'],
    ['selectText, dropText, uploadText', '`Bind<string>`', 'the kit’s', 'The button, the hint beside it, the Upload button.'],
    ['showFileList', '`Bind<boolean>`', '`true`', 'The list of files under the box.'],
    ['label, helpText, required, rules, readOnly, size, variant…', '', '', 'Field props shared by all editors.']
];

const MEMBERS = [
    ['items', 'read-only', 'Every file in the list with what happened to it: `file`, `status` (`ready`, `uploading`, `done`, `error`, `aborted`, `invalid`), `progress`, `response`, `message`.'],
    ['isUploading', 'read-only', 'An upload is running.'],
    ['openDialog()', '`void`', 'Opens the browser’s file dialog, as the button does.'],
    ['addFiles(files)', '`void`', 'Takes files as if chosen: the limits apply, `onFilesAdded` is asked, uploads start as the mode says.'],
    ['upload(item?)', '`Promise<void>`', 'Uploads the files waiting, or one of them; what `manual` mode calls.'],
    ['abort(item?), remove(item), clear()', '`void`', 'Stops an upload (the file stays, cancelled); takes a file out; takes every file out.'],
    ['onFilesAdded', 'event', 'Files were chosen or dropped (`files`, `refused`); `cancel = true` takes none.'],
    ['onFileRemoved, onUploadStarted, onProgress, onUploaded, onUploadError, onUploadAborted', 'event', 'One file’s way through: each with `item` and `file`, a failure with `error`.'],
    ['onValueChanged', 'event', 'The files taken changed.']
];

const BEHAVIOUR = [
    ['Choosing', 'The button opens the file dialog; files may be dropped on the box too, which lights up while they are over it.'],
    ['Refusing', 'A file outside `accept`, the sizes or `maxFiles` is listed as refused with the reason, and is not in the value.'],
    ['Uploading', 'As chosen, on the Upload button, or programmatically. A row shows the progress and a Cancel button meanwhile; afterwards “Uploaded”, or the failure with Retry. The server’s answer is the item’s `response` (JSON parsed).'],
    ['Chunks', 'With `chunkSize` the file goes in pieces, each a request with `Content-Range: bytes start-end/total`; progress runs over the whole.'],
    ['Removing', 'Each row has a remove button; a running upload is stopped first.']
];

const A11Y = [
    ['Button', 'The select button is the field’s control: the label marks it, Space and Enter open the dialog.'],
    ['List', 'A list of rows: the name, the size and the state as text; the progress bar named after the file; the buttons named “Cancel the upload of …”, “Retry”, “Remove …”.'],
    ['Messages', 'The reasons a file was refused and the failures speak in the kit language, or in the server’s words.']
];

const HOOKS = [
    ['.mx-file-uploader', 'The field. `data-dragover` while files are over it.'],
    ['.mx-file-uploader__select, .mx-file-uploader__drop, .mx-file-uploader__upload', 'The select button, the hint, the Upload button.'],
    ['.mx-file-uploader__list, .mx-file-uploader__item', 'The list and each row. `data-status` on the row.'],
    ['.mx-file-uploader__icon, __name, __size, __state, __progress, __actions, __action', 'The parts of a row.']
];

const TOKENS = [
    ['file-uploader.over, .select, .upload, .hint, .list, .item, .icon, .name, .size, .state', 'Units: the box with files over it, the two buttons (`hover`, `pressed`, `focus`, `disabled`), the hint, the list, a row per status, the file glyph, the texts.'],
    ['file-uploader.field, .action', 'Places: the field’s box as a drop zone (a dashed frame, its corners, its padding); the row’s buttons.'],
    ['file-uploader.box-gap, .button-gap, .item-gap', 'The spaces in the box, in a button and in a row.']
];

export default function FileUploaderPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Files chosen with a button or dropped on the box, listed with their size and what happens to them: uploaded as they come, on a button or programmatically, with progress, cancel, retry and remove on each. Files outside the limits are listed with the reason." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { FileUploader } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Choosing, dropping, uploading">
                <p>
                    <Rich text="`upload` is your own way to send a file: report progress, stop on the signal, resolve to the response. With `uploadUrl` instead, the uploader sends the file itself, in one piece or in chunks (`chunkSize`)." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="limits" title="Limits">
                <Example stack files={code('Limits.tsx')}>
                    <Limits />
                </Example>
            </Section>

            <Section anchor="modes" title="When files go up">
                <Example stack files={code('Modes.tsx')}>
                    <Modes />
                </Example>
            </Section>

            <Section anchor="server" title="Sending to a server">
                <p>
                    <Rich text="The uploader posts a form with the file in `uploadField` (`file` by default) to `uploadUrl`, with `uploadHeaders`; a 2xx answer is the item’s `response`, JSON parsed when it is JSON. With `chunkSize` each piece carries `Content-Range` and the fields `chunkIndex` and `chunkCount`." />
                </p>
                <Code
                    code={`
<FileUploader
  label="Attachments"
  uploadUrl="/api/files"
  uploadHeaders={{ Authorization: 'Bearer ' + token }}
  chunkSize={1_000_000}
  onUploaded={(e) => this.attachments.push(e.item.response as Attachment)}
/>
`}
                />
            </Section>

            <Section anchor="behaviour" title="Behavior">
                <ApiTable head={['Topic', 'Details']} rows={BEHAVIOUR} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
