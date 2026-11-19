import { reactive } from '@motifx/core';
import { Chip, Sortable, Stack } from '@motifx-community/ui';

/** Chips side by side, moved by their handle only (the dots), with Ctrl + Left / Right on the handle; a drag may be refused. */
export default function Handle() {
    const s = reactive({ tags: ['Design', 'Build', 'Test', 'Ship', 'Locked'], told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Sortable
                label="Tags"
                class="so-tags"
                orientation="horizontal"
                handle=".so-grip"
                items={() => s.tags}
                itemTemplate={tag => {
                    const chip = new Chip({ text: tag });
                    // The handle is a component of the item: `handle` finds it among them and makes it the button.
                    chip.controls.insert(0, <span class="mx-glyph so-grip" data-icon="drag-dots" aria-label={`Move ${tag}`} />);
                    return chip;
                }}
                onDragStarting={e => {
                    if (e.item === 'Locked') {
                        e.cancel = true;
                        s.told = 'Locked stays where it is.';
                    }
                }}
                onReorder={e => {
                    const next = s.tags.slice();
                    next.splice(e.toIndex, 0, ...next.splice(e.fromIndex, 1));
                    s.tags = next;
                    s.told = next.join(', ');
                }}
            />
            <output class="so-tags-told">{() => s.told}</output>
        </Stack>
    );
}
