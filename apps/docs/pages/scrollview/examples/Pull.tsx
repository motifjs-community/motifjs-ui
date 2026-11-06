import { reactive } from '@motifx/core';
import { Panel, ScrollView, Stack } from '@motifx-community/ui';

/** Pulled down from the top, the list requests new items and shows the panel until the promise settles. */
export default function Pull() {
    const s = reactive({ notes: ['Welcome aboard', 'Your plan was renewed', 'A new comment on "Roadmap"'], count: 0 });
    const reload = () =>
        new Promise<void>(resolve =>
            setTimeout(() => {
                s.count++;
                s.notes = [`Fresh note ${s.count}`, ...s.notes];
                resolve();
            }, 1200)
        );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <span>Drag the list down from its top (a finger, or the mouse) and let go.</span>
            <ScrollView label="Notes" class="sv-notes" pullToRefresh onPullDown={e => (e.promise = reload())} style="block-size: 12rem">
                {s.notes.map(note => (
                    <Panel key={note} variant="outline" padding="sm">
                        {note}
                    </Panel>
                ))}
            </ScrollView>
        </Stack>
    );
}
