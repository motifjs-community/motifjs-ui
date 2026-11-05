import type { UploadStatus } from './upload-status';

/** A file in the uploader's list, with what happened to it. */
export interface UploadItem {
    file: File;
    status: UploadStatus;
    /** 0 to 1 while uploading. */
    progress: number;
    /** What the upload answered (the response, or what your `upload` returned). */
    response: unknown;
    /** Why it failed or was refused, in the kit's language or the server's words. */
    message: string;
}
