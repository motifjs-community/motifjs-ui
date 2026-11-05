import { reactive } from '@motifx/core';
import { Draggable, Panel, Stack } from '@motifx-community/ui';

/** Three notes in a room: one moves anywhere inside it, one only sideways, one only by its grip; the keys move the focused one. */
export default function Free() {
    const s = reactive({ told: '' });
    const note = (text: string, grip = false) => (
        <Panel padding="sm" variant="outline" style="inline-size: 150px">
            {grip && <span class="dg-grip">⋮⋮ </span>}
            <span>{text}</span>
        </Panel>
    );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <div class="dg-room" style="position: relative; block-size: 220px; outline: 2px dashed var(--mx-color-stroke-control-strong); outline-offset: -2px">
                <Draggable class="dg-free" boundary="parent" style="position: absolute; left: 16px; top: 16px" onDragEnded={e => (s.told = `free: ${e.x}, ${e.y}`)}>
                    {note('Anywhere in the room')}
                </Draggable>
                <Draggable class="dg-axis" axis="x" boundary="parent" style="position: absolute; left: 16px; top: 100px" onDragEnded={e => (s.told = `sideways: ${e.x}, ${e.y}`)}>
                    {note('Only sideways')}
                </Draggable>
                <Draggable class="dg-handle" handle=".dg-grip" boundary="parent" style="position: absolute; left: 300px; top: 16px" onDragEnded={e => (s.told = `by the grip: ${e.x}, ${e.y}`)}>
                    {note('Only by the grip', true)}
                </Draggable>
            </div>
            <output class="dg-free-told">{() => s.told}</output>
        </Stack>
    );
}
