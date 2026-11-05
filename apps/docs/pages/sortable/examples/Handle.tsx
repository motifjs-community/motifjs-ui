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
                    const grip = document.createElement('span');
                    grip.className = 'mx-glyph so-grip';
                    grip.dataset.icon = 'drag-dots';
                    grip.setAttribute('aria-label', `Move ${tag}`);
                    chip.element.prepend(grip);
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
