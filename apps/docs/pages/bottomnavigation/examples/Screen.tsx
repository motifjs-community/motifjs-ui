import { reactive } from '@motifx/core';
import { AppBar, BottomNavigation } from '@motifx-community/ui';

const ROWS = Array.from({ length: 30 }, (_, i) => `Message ${i + 1}`);

/** A phone screen: the two bars around a box that scrolls. Scrolling down moves the bottom bar away. */
export default function Screen() {
    const s = reactive({ page: 'mail' });
    return (
        <div class="bn-screen" tabindex="0" style="position: relative; inline-size: min(100%, 390px); block-size: 420px; overflow: auto; border: 1px solid var(--mx-color-stroke-divider)">
            <AppBar title="Messages" navigation="menu" />
            {ROWS.map(row => (
                <p key={row} style="margin: 0; padding: 12px 16px">
                    {row}
                </p>
            ))}
            <BottomNavigation
                class="bn-scroll"
                label="Screens"
                position="sticky"
                hideOnScroll
                x-model={() => s.page}
                items={[
                    { value: 'mail', text: 'Messages', glyph: 'file' },
                    { value: 'calendar', text: 'Calendar', glyph: 'calendar' },
                    { value: 'profile', text: 'Profile', glyph: 'person' }
                ]}
            />
        </div>
    );
}
