import { reactive } from '@motifx/core';
import { BottomNavigation, ButtonGroup, Stack } from '@motifx-community/ui';

const ITEMS = [
    { value: 'home', text: 'Home', glyph: 'star' },
    { value: 'search', text: 'Search', glyph: 'search' },
    { value: 'alarms', text: 'Alarms', glyph: 'clock' },
    { value: 'locked', text: 'Locked', glyph: 'lock', enabled: false }
];

/** `labelMode`: a label out of view stays as the accessible name of the item. */
export default function Labels() {
    const s = reactive({ mode: 'active' as 'always' | 'active' | 'never', page: 'home' });
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <ButtonGroup
                label="Label mode"
                x-model={() => s.mode}
                items={[
                    { value: 'always', text: 'Always' },
                    { value: 'active', text: 'Active' },
                    { value: 'never', text: 'Never' }
                ]}
            />
            <BottomNavigation class="bn-labels" label="Sections" position="static" labelMode={() => s.mode} x-model={() => s.page} items={ITEMS} />
        </Stack>
    );
}
