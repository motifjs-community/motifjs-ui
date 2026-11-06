/** The state of a file: waiting, uploading, uploaded, failed, canceled, or rejected (its type, size or count). */
export type UploadStatus = 'ready' | 'uploading' | 'done' | 'error' | 'aborted' | 'invalid';
