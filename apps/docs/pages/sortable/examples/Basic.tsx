import { reactive } from '@motifx/core';
import { Panel, Sortable, Stack } from '@motifx-community/ui';

/** Rows reordered by dragging, or with Ctrl + arrow key on the focused row. The application reorders its data in the event. */
export default function Basic() {
    const s = reactive({ steps: ['Collect the order', 'Pack it', 'Print the label', 'Hand it over'], told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Sortable
                label="Steps"
                class="so-steps"
                onReorder={e => {
                    const next = s.steps.slice();
                    next.splice(e.toIndex, 0, ...next.splice(e.fromIndex, 1));
                    s.steps = next;
                    s.told = `"${next[e.toIndex]}" is step ${e.toIndex + 1} now`;
                }}
            >
                <Panel variant="outline" padding="sm">
                    Collect the order
                </Panel>
                <Panel variant="outline" padding="sm">
                    Pack it
                </Panel>
                <Panel variant="outline" padding="sm">
                    Print the label
                </Panel>
                <Panel variant="outline" padding="sm">
                    Hand it over
                </Panel>
            </Sortable>
            <output class="so-told">{() => s.told || `Order: ${s.steps.join(' → ')}`}</output>
        </Stack>
    );
}
