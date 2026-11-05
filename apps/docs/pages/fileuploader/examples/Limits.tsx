import { reactive } from '@motifx/core';
import { FileUploader, Stack } from '@motifx-community/ui';

/** Only pictures and PDFs, up to 2 MB each and three in all; a file outside is listed with the reason. */
export default function Limits() {
    const s = reactive({ files: [] as readonly File[], refused: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <FileUploader
                label="Documents"
                accept=".pdf,image/*"
                maxFileSize={2_000_000}
                maxFiles={3}
                required
                x-model={() => s.files}
                onFilesAdded={e => (s.refused = e.refused.length ? e.refused.map(r => r.message).join(' ') : '')}
            />
            <output class="fu-refused">{() => s.refused}</output>
        </Stack>
    );
}
