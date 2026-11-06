import { SpeedDial } from '@motifx-community/ui';

const ACTIONS = [
    { text: 'Edit', glyph: 'pencil' },
    { text: 'Refresh', glyph: 'repeat' },
    { text: 'Delete', glyph: 'trash' },
    { text: 'Upload', glyph: 'upload' },
    { text: 'Download', glyph: 'download' }
];

/** A quarter circle in each corner of a box: `direction` follows from `position`, into the box. */
export default function QuarterCircle() {
    return (
        <div class="sd-quarter" style="position: relative; inline-size: 100%; block-size: 26rem">
            <SpeedDial class="sd-quarter-top-start" layout="quarter-circle" position="top-start" relativeTo="parent" text="Tools, top start" actions={ACTIONS} />
            <SpeedDial class="sd-quarter-top-end" layout="quarter-circle" position="top-end" relativeTo="parent" text="Tools, top end" actions={ACTIONS} />
            <SpeedDial class="sd-quarter-bottom-start" layout="quarter-circle" position="bottom-start" relativeTo="parent" text="Tools, bottom start" actions={ACTIONS} />
            <SpeedDial class="sd-quarter-bottom-end" layout="quarter-circle" position="bottom-end" relativeTo="parent" text="Tools, bottom end" actions={ACTIONS} />
        </div>
    );
}
