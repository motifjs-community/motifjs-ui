import { reactive } from '@motifx/core';
import { Stack, TileView } from '@motifx-community/ui';

/** Tiles along the rows, any number of them chosen: a press, Ctrl and a press, Space; the keys walk the grid. */
export default function Selection() {
    const s = reactive({ chosen: ['tea'] as string | number | null | readonly (string | number)[] });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <TileView
                class="tv-pick"
                label="Snacks"
                direction="vertical"
                selectionMode="multiple"
                baseItemWidth={110}
                baseItemHeight={70}
                x-model={() => s.chosen}
                items={[
                    { key: 'tea', text: 'Tea' },
                    { key: 'coffee', text: 'Coffee' },
                    { key: 'water', text: 'Water', enabled: false },
                    { key: 'cake', text: 'Cake', widthRatio: 2 },
                    { key: 'fruit', text: 'Fruit' },
                    { key: 'nuts', text: 'Nuts' }
                ]}
            />
            <output class="tv-pick-told">{() => `chosen: ${JSON.stringify(s.chosen)}`}</output>
        </Stack>
    );
}
