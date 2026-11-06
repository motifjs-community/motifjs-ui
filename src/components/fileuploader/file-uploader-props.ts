import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { FilesAddedEventArgs } from './files-added-event-args';
import type { UploadEventArgs } from './upload-event-args';
import type { UploadMode } from './upload-mode';

/**
 * Props of `FileUploader`, in addition to the field props (the value is the accepted files). Each prop is also a
 * settable property.
 */
export interface FileUploaderProps extends FieldProps<readonly File[]> {
    /** Allows several files at once. The default is `true`. */
    multiple?: Bind<boolean>;
    /** The accepted file types, as in `<input type="file">`: `.png,.jpg`, `image/*`, `application/pdf`. */
    accept?: Bind<string>;
    /** Size limits in bytes. A file outside the limits is listed as rejected with the reason. */
    maxFileSize?: Bind<number | null>;
    minFileSize?: Bind<number | null>;
    /** The maximum number of files. */
    maxFiles?: Bind<number | null>;
    /** Allows files to be dropped on the box. The default is `true`. */
    allowDrop?: Bind<boolean>;
    /**
     * When files are uploaded: `instant` (on selection), `button` (an Upload button) or `manual` (`upload()` called
     * programmatically). The default is `instant` with `uploadUrl` or `upload`, and `manual` otherwise.
     */
    uploadMode?: Bind<UploadMode>;
    /** The address files are sent to by the uploader itself, using XMLHttpRequest with progress. */
    uploadUrl?: Bind<string | null>;
    /** The default is `'POST'`. */
    uploadMethod?: Bind<string>;
    uploadHeaders?: Bind<Record<string, string> | null>;
    /** The form field that carries the file. The default is `'file'`. */
    uploadField?: Bind<string>;
    /** Bytes per request. The file is sent in chunks, each with `Content-Range`. By default, it is sent whole. */
    chunkSize?: Bind<number | null>;
    /**
     * A custom upload function used instead of `uploadUrl`. Report progress from 0 to 1 and stop on the signal. The value
     * it resolves to becomes the response.
     */
    upload?: (file: File, report: (fraction: number) => void, signal: AbortSignal) => Promise<unknown>;
    /** The texts of the select button, the drop hint and the Upload button. The kit strings are used when omitted. */
    selectText?: Bind<string>;
    dropText?: Bind<string>;
    uploadText?: Bind<string>;
    /** Shows the list of files below the box. The default is `true`. */
    showFileList?: Bind<boolean>;
    /** Occurs when files are selected or dropped. This event is cancelable. */
    onFilesAdded?: (e: FilesAddedEventArgs) => void;
    onFileRemoved?: (e: UploadEventArgs) => void;
    onUploadStarted?: (e: UploadEventArgs) => void;
    onProgress?: (e: UploadEventArgs) => void;
    onUploaded?: (e: UploadEventArgs) => void;
    onUploadError?: (e: UploadEventArgs) => void;
    onUploadAborted?: (e: UploadEventArgs) => void;
}
