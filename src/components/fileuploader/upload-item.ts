import type { UploadStatus } from './upload-status';

/** A file in the uploader's list, with its state. */
export interface UploadItem {
    file: File;
    status: UploadStatus;
    /** The progress from 0 to 1 during the upload. */
    progress: number;
    /** The upload result: the response, or the value returned by a custom `upload`. */
    response: unknown;
    /** The reason it failed or was rejected, in the kit language or as worded by the server. */
    message: string;
}
