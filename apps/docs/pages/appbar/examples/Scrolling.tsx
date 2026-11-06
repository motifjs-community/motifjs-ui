import { reactive } from '@motifx/core';
import { AppBar, ButtonGroup, Stack } from '@motifx-community/ui';

const ROWS = Array.from({ length: 30 }, (_, i) => `Order ${i + 1}`);

/** The bar sticks to the top of the box that scrolls. `lift` raises it over the content, `hide` moves it away. */
export default function Scrolling() {
    const s = reactive({ behavior: 'lift' as 'none' | 'lift' | 'hide' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <ButtonGroup
                label="Scroll behavior"
                x-model={() => s.behavior}
                items={[
                    { value: 'none', text: 'None' },
                    { value: 'lift', text: 'Lift' },
                    { value: 'hide', text: 'Hide' }
                ]}
            />
            <div class="ab-scroll" tabindex="0" style="block-size: 260px; overflow: auto; border: 1px solid var(--mx-color-stroke-divider)">
                <AppBar class="ab-scrolling" title="Orders" navigation="menu" scrollBehavior={() => s.behavior} />
                {ROWS.map(row => (
                    <p key={row} style="margin: 0; padding: 12px 16px">
                        {row}
                    </p>
                ))}
            </div>
        </Stack>
    );
}
