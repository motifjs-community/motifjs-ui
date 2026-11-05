import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { FilesAddedEventArgs } from './files-added-event-args';
import type { UploadEventArgs } from './upload-event-args';
import type { UploadMode } from './upload-mode';

/** Props of `FileUploader`: the field props (the value the files taken) plus its own. Each one is also a settable property. */
export interface FileUploaderProps extends FieldProps<readonly File[]> {
    /** Several files at once. Default `true`. */
    multiple?: Bind<boolean>;
    /** What may be chosen, as for an `<input type="file">`: `.png,.jpg`, `image/*`, `application/pdf`. */
    accept?: Bind<string>;
    /** Bytes. A file outside is listed as refused, with the reason. */
    maxFileSize?: Bind<number | null>;
    minFileSize?: Bind<number | null>;
    /** How many files may be taken in all. */
    maxFiles?: Bind<number | null>;
    /** Files may be dropped on the box. Default `true`. */
    allowDrop?: Bind<boolean>;
    /** When files are uploaded: `instant` (as chosen), `button` (an Upload button), `manual` (`upload()` from code). Default `instant` with `uploadUrl` or `upload`, else `manual`. */
    uploadMode?: Bind<UploadMode>;
    /** Where files are sent, by the uploader itself (XMLHttpRequest, with progress). */
    uploadUrl?: Bind<string | null>;
    /** Default `'POST'`. */
    uploadMethod?: Bind<string>;
    uploadHeaders?: Bind<Record<string, string> | null>;
    /** The form field the file is sent in. Default `'file'`. */
    uploadField?: Bind<string>;
    /** Bytes per request; the file goes in pieces, each with its `Content-Range`. Default: the whole file at once. */
    chunkSize?: Bind<number | null>;
    /** Your own upload instead of `uploadUrl`: report progress (0 to 1) and stop on the signal; what it resolves to is the response. */
    upload?: (file: File, report: (fraction: number) => void, signal: AbortSignal) => Promise<unknown>;
    /** The texts: the select button, the drop hint, the Upload button; the kit's when not given. */
    selectText?: Bind<string>;
    dropText?: Bind<string>;
    uploadText?: Bind<string>;
    /** The list of files under the box. Default `true`. */
    showFileList?: Bind<boolean>;
    /** Files were chosen or dropped; cancelable. */
    onFilesAdded?: (e: FilesAddedEventArgs) => void;
    onFileRemoved?: (e: UploadEventArgs) => void;
    onUploadStarted?: (e: UploadEventArgs) => void;
    onProgress?: (e: UploadEventArgs) => void;
    onUploaded?: (e: UploadEventArgs) => void;
    onUploadError?: (e: UploadEventArgs) => void;
    onUploadAborted?: (e: UploadEventArgs) => void;
}
