import { reactive } from '@motifx/core';
import { Button, Stack, TileView } from '@motifx-community/ui';

const ROOMS = [
    { name: 'Kitchen', temp: 21 },
    { name: 'Lounge', temp: 23 },
    { name: 'Study', temp: 19 },
    { name: 'Bedroom', temp: 18 }
];

/** Any content on a tile: a room each, with its own button. A click on the tile itself is also reported. */
export default function Content() {
    const s = reactive({ told: '' });
    const room = (r: (typeof ROOMS)[number]) => (
        <Stack class="tv-room" gap="xs" justify="center" style="block-size: 100%">
            <strong>{r.name}</strong>
            <span class="tv-room-temp">{r.temp} °C</span>
            <Button text="Warmer" variant="outline" size="sm" onclick={() => (s.told = `${r.name}: warmer`)} />
        </Stack>
    );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <TileView class="tv-rooms" label="Rooms" direction="vertical" baseItemWidth={150} baseItemHeight={120} items={ROOMS.map(r => ({ key: r.name, content: () => room(r) }))} onItemClick={e => (s.told = `${(e.item as { key: string }).key} pressed`)} />
            <output class="tv-rooms-told">{() => s.told}</output>
        </Stack>
    );
}
