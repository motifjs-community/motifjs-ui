import { reactive } from '@motifx/core';
import { Button, SpeedDial, Stack } from '@motifx-community/ui';

/** The actions on a whole circle around the button, in the centre of a box; by default just far enough out to keep them apart. */
export default function Circle() {
    const s = reactive({ radius: null as number | null, told: '' });
    const actions = [
        { text: 'Edit', glyph: 'pencil', click: () => (s.told = 'edit') },
        { text: 'Refresh', glyph: 'repeat', click: () => (s.told = 'refresh') },
        { text: 'Delete', glyph: 'trash', click: () => (s.told = 'delete') },
        { text: 'Upload', glyph: 'upload', click: () => (s.told = 'upload') },
        { text: 'Download', glyph: 'download', click: () => (s.told = 'download') }
    ];
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Radius by itself" variant="outline" onclick={() => (s.radius = null)} />
                <Button text="Radius 120" variant="outline" onclick={() => (s.radius = 120)} />
                <output class="sd-circle-told">{() => s.told}</output>
            </Stack>
            <div style="position: relative; inline-size: 100%; block-size: 22rem">
                <SpeedDial class="sd-circle" layout="circle" position="center" relativeTo="parent" radius={() => s.radius} text="Tools" actions={actions} />
            </div>
        </Stack>
    );
}
