import type { EventArgs } from '@motifx/core';
import type { FileUploader } from './FileUploader';
import type { UploadItem } from './upload-item';

/** Files were chosen or dropped. `cancel = true` takes none of them; `refused` lists those the limits turned away. */
export interface FilesAddedEventArgs extends EventArgs {
    files: File[];
    refused: UploadItem[];
    source: FileUploader;
}
