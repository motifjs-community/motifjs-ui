import { reactive } from '@motifx/core';
import { Button, SpeedDial, Stack } from '@motifx-community/ui';

/** Tooltips on the actions: the speed dial's options for all, a text or options of an action's own, none on one. */
export default function Tooltips() {
    const s = reactive({ on: true });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Button class="sd-tips-toggle" text="Tooltips" variant="outline" toggle x-model={() => s.on} />
            <div style="min-block-size: 5rem; padding-block-start: 2rem">
                <SpeedDial
                    class="sd-tips"
                    position="inline"
                    direction="end"
                    text="Edit"
                    closeOnAction={false}
                    showLabels={false}
                    tooltip={() => (s.on ? { placement: 'top', delay: 100 } : false)}
                    actions={[
                        { text: 'Edit', glyph: 'pencil' },
                        { text: 'Upload', glyph: 'upload', tooltip: 'Upload a new version, up to 20 MB' },
                        { text: 'Delete', glyph: 'trash', tooltip: { text: 'Kept in the bin for 30 days', placement: 'bottom' } },
                        { text: 'Save', glyph: 'save', tooltip: false }
                    ]}
                />
            </div>
        </Stack>
    );
}
