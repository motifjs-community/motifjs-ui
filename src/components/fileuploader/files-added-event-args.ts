import type { EventArgs } from '@motifx/core';
import type { FileUploader } from './FileUploader';
import type { UploadItem } from './upload-item';

/**
 * Provides data for the event that occurs when files are selected or dropped. Set `cancel = true` to accept none.
 * `refused` lists the files the limits rejected.
 */
export interface FilesAddedEventArgs extends EventArgs {
    files: File[];
    refused: UploadItem[];
    source: FileUploader;
}
