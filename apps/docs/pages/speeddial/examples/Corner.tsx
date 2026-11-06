import { reactive } from '@motifx/core';
import { Button, SpeedDial, Stack } from '@motifx-community/ui';

/** A speed dial fixed to a corner of the viewport, shown while the switch is on; the corner and the fan's way can change. */
export default function Corner() {
    const s = reactive({ on: false, position: 'bottom-end' as 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start', told: '' });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button class="sd-corner-toggle" text="In the corner" variant="outline" toggle x-model={() => s.on} />
                <Button text="Bottom end" variant="outline" onclick={() => (s.position = 'bottom-end')} />
                <Button text="Bottom start" variant="outline" onclick={() => (s.position = 'bottom-start')} />
                <Button text="Top end" variant="outline" onclick={() => (s.position = 'top-end')} />
                <output class="sd-corner-told">{() => s.told}</output>
            </Stack>
            <SpeedDial
                class="sd-corner"
                visible={() => s.on}
                position={() => s.position}
                text="Create"
                actions={[
                    { text: 'Document', glyph: 'file', click: () => (s.told = 'a document') },
                    { text: 'Folder', glyph: 'columns', click: () => (s.told = 'a folder') },
                    { text: 'Upload', glyph: 'upload', click: () => (s.told = 'an upload') }
                ]}
            />
        </Stack>
    );
}
