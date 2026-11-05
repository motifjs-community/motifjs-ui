import { reactive } from '@motifx/core';
import { SpeedDial, Stack } from '@motifx-community/ui';

/** With one action shown, the main button does it itself and takes its glyph and name; `extended` shows the name beside the glyph. */
export default function Single() {
    const s = reactive({ saved: 0 });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Stack orientation="horizontal" gap="lg" align="center">
                <SpeedDial class="sd-single" position="inline" actions={[{ text: 'Save', glyph: 'save', click: () => s.saved++ }]} />
                <SpeedDial class="sd-extended" position="inline" extended actions={[{ text: 'Save a copy', glyph: 'save', click: () => s.saved++ }]} />
            </Stack>
            <output class="sd-single-told">{() => `saved ${s.saved} times`}</output>
        </Stack>
    );
}
