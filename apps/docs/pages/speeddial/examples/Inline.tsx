import { reactive } from '@motifx/core';
import { SpeedDial, Stack } from '@motifx-community/ui';

/** Two speed dials in the flow of the page: one fans up, one fans to the end; a press on an action tells. */
export default function Inline() {
    const s = reactive({ told: '', open: false });
    const actions = [
        { key: 'note', text: 'New note', glyph: 'pencil', click: () => (s.told = 'a new note') },
        { key: 'event', text: 'New event', glyph: 'calendar', click: () => (s.told = 'a new event') },
        { key: 'file', text: 'Upload a file', glyph: 'upload', click: () => (s.told = 'a file to upload') },
        { key: 'locked', text: 'Not yet', glyph: 'lock', enabled: false }
    ];
    return (
        <Stack gap="md" style="inline-size: 100%">
            <div class="sd-row" style="display: flex; align-items: flex-end; gap: 48px; min-block-size: 260px; padding-inline-start: 140px">
                <SpeedDial class="sd-up" position="inline" direction="up" text="New" actions={actions} x-model={() => s.open} />
                <SpeedDial class="sd-end" position="inline" direction="end" text="Share" glyph="person" actions={[{ text: 'Mail', glyph: 'file', click: () => (s.told = 'shared by mail') }, { text: 'Link', glyph: 'pin', click: () => (s.told = 'a link to share') }]} />
            </div>
            <output class="sd-told">{() => `${s.told || 'nothing yet'}${s.open ? ' (open)' : ''}`}</output>
        </Stack>
    );
}
