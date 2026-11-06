import { reactive } from '@motifx/core';
import { BottomNavigation, Stack, Switch } from '@motifx-community/ui';

/** `onSelecting` keeps the page while there are unsaved changes. */
export default function Guarded() {
    const s = reactive({ page: 'edit', dirty: true, told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <Switch label="Unsaved changes" x-model={() => s.dirty} />
            <BottomNavigation
                class="bn-guarded"
                label="Document"
                position="static"
                x-model={() => s.page}
                onSelecting={e => {
                    e.cancel = s.dirty;
                    s.told = s.dirty ? 'Save your changes first.' : '';
                }}
                items={[
                    { value: 'edit', text: 'Edit', glyph: 'pencil' },
                    { value: 'files', text: 'Files', glyph: 'file' },
                    { value: 'share', text: 'Share', glyph: 'upload' }
                ]}
            />
            <output class="bn-guard-told">{() => s.told}</output>
        </Stack>
    );
}
