/** Where a file stands: chosen and waiting, being uploaded, uploaded, failed, canceled, or refused (its type, size or count). */
export type UploadStatus = 'ready' | 'uploading' | 'done' | 'error' | 'aborted' | 'invalid';
