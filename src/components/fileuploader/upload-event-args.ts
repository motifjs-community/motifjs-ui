import type { FileUploader } from './FileUploader';
import type { UploadItem } from './upload-item';

/** Something happened to one file of the uploader. */
export interface UploadEventArgs {
    item: UploadItem;
    file: File;
    /** What went wrong, when it did. */
    error?: unknown;
    source: FileUploader;
}
