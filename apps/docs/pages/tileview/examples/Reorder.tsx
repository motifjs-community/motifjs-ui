import { reactive } from '@motifx/core';
import { Stack, TileView } from '@motifx-community/ui';

/** Drag a tile to another place, or move it with Ctrl and an arrow key; the data is reordered in `onReordered`. */
export default function Reorder() {
    const s = reactive({ tiles: [{ text: 'Plan' }, { text: 'Design', widthRatio: 2 }, { text: 'Build' }, { text: 'Test' }, { text: 'Ship', heightRatio: 2 }, { text: 'Rest' }] });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <TileView
                class="tv-order"
                label="Steps"
                direction="vertical"
                allowReorder
                baseItemWidth={100}
                baseItemHeight={70}
                items={() => s.tiles}
                onReordered={e => s.tiles.splice(e.toIndex, 0, ...s.tiles.splice(e.fromIndex, 1))}
            />
            <output class="tv-order-told">{() => s.tiles.map(t => t.text).join(', ')}</output>
        </Stack>
    );
}
