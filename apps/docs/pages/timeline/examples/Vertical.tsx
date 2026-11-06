import { reactive } from '@motifx/core';
import { Button, Stack, Timeline } from '@motifx-community/ui';

/** A project shown vertically, with a marker per event colored by its tone. Cards can alternate sides or collapse. */
export default function Vertical() {
    const s = reactive({ alternate: false, collapsible: false, told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Take turns" variant="outline" toggle x-model={() => s.alternate} />
                <Button text="Fold the cards" variant="outline" toggle x-model={() => s.collapsible} />
                <output class="tl-told">{() => s.told}</output>
            </Stack>
            <Timeline
                class="tl-project"
                label="The project"
                alternate={() => s.alternate}
                collapsible={() => s.collapsible}
                onItemClick={e => (s.told = `pressed: ${(e.item as { title: string }).title}`)}
                items={[
                    { date: '2026-01-12', title: 'Kick-off', description: 'The team met and the scope was agreed.', glyph: 'calendar' },
                    { date: '2026-02-20', title: 'Design signed off', description: 'Five languages, every state measured.', tone: 'info', glyph: 'pencil' },
                    { date: '2026-04-03', title: 'Beta', description: 'The first users came in; two slow screens were found.', tone: 'accent', glyph: 'person' },
                    { date: '2026-05-15', title: 'Slow screens fixed', description: 'The grid draws only what is in view.', tone: 'caution' },
                    { date: '2026-06-30', title: 'Shipped', description: 'Version one, on time.', tone: 'success', glyph: 'check' }
                ]}
            />
        </Stack>
    );
}
