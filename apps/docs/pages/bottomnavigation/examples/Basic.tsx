import { reactive } from '@motifx/core';
import { BottomNavigation, Stack } from '@motifx-community/ui';

/** Three destinations bound to a value, with a count on one of them. */
export default function Basic() {
    const s = reactive({ page: 'home', unread: 3 });
    return (
        <Stack gap="md" style="inline-size: 100%; max-inline-size: 420px">
            <BottomNavigation
                class="bn-basic"
                position="static"
                x-model={() => s.page}
                items={[
                    { value: 'home', text: 'Home', glyph: 'star', activeGlyph: 'star-filled' },
                    { value: 'inbox', text: 'Inbox', glyph: 'file', badge: () => s.unread },
                    { value: 'calendar', text: 'Calendar', glyph: 'calendar' },
                    { value: 'profile', text: 'Profile', glyph: 'person', dot: true }
                ]}
            />
            <output class="bn-told">{() => `Page: ${s.page}`}</output>
        </Stack>
    );
}
