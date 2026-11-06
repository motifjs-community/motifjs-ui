import type { FileUploader } from './FileUploader';
import type { UploadItem } from './upload-item';

/** Provides data for the events that report a stage of one file's upload. */
export interface UploadEventArgs {
    item: UploadItem;
    file: File;
    /** The error, when the upload failed. */
    error?: unknown;
    source: FileUploader;
}
