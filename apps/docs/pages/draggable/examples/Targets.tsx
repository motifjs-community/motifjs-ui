import { reactive } from '@motifx/core';
import { Draggable, DropTarget, Stack } from '@motifx-community/ui';

const FRUIT = ['Apple', 'Pear', 'Plum'];

/** Copies of the chips go to the bowls of their group; the small bowl refuses a third, and the data moves in `onDropped`. */
export default function Targets() {
    const s = reactive({ big: [] as string[], small: [] as string[], told: '' });
    const bowl = (name: 'big' | 'small', limit: number) => (
        <DropTarget
            class={`dg-bowl dg-bowl-${name}`}
            group="fruit"
            grow
            style="flex-basis: 0; min-block-size: 96px; padding: 12px; border: 1px solid var(--mx-color-stroke-divider); border-radius: var(--mx-radius-md)"
            onDragEntering={e => (e.cancel = s[name].length >= limit)}
            onDropped={e => {
                s[name].push(e.data as string);
                s.told = `${e.data} went to the ${name} bowl`;
            }}
        >
            <strong>{name === 'big' ? 'Big bowl' : 'Small bowl, two at most'}</strong>
            <div class="dg-bowl-list">{() => s[name].join(', ') || 'empty'}</div>
        </DropTarget>
    );
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" gap="sm" wrap>
                {FRUIT.map(fruit => (
                    <Draggable class="dg-chip" clone group="fruit" data={fruit} style="padding: 6px 12px; border-radius: var(--mx-radius-full); border: 1px solid var(--mx-color-stroke-control-strong)">
                        {fruit}
                    </Draggable>
                ))}
            </Stack>
            <Stack orientation="horizontal" gap="md">
                {bowl('big', 99)}
                {bowl('small', 2)}
            </Stack>
            <output class="dg-bowls-told">{() => s.told}</output>
        </Stack>
    );
}
