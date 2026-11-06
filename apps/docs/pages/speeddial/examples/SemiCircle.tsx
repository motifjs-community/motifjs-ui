import { SpeedDial } from '@motifx-community/ui';

const ACTIONS = [
    { text: 'Edit', glyph: 'pencil' },
    { text: 'Refresh', glyph: 'repeat' },
    { text: 'Delete', glyph: 'trash' },
    { text: 'Upload', glyph: 'upload' },
    { text: 'Download', glyph: 'download' }
];

/** A half circle on the middle of each edge of a box: `direction` follows from `position`, into the box. */
export default function SemiCircle() {
    return (
        <div class="sd-semi" style="position: relative; inline-size: 100%; block-size: 26rem">
            <SpeedDial class="sd-semi-top" layout="semi-circle" position="top" relativeTo="parent" text="Tools at the top" actions={ACTIONS} />
            <SpeedDial class="sd-semi-start" layout="semi-circle" position="start" relativeTo="parent" text="Tools at the start" actions={ACTIONS} />
            <SpeedDial class="sd-semi-end" layout="semi-circle" position="end" relativeTo="parent" text="Tools at the end" actions={ACTIONS} />
            <SpeedDial class="sd-semi-bottom" layout="semi-circle" position="bottom" relativeTo="parent" text="Tools at the bottom" actions={ACTIONS} />
        </div>
    );
}
