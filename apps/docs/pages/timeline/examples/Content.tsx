import { reactive } from '@motifx/core';
import { Button, Stack, Timeline } from '@motifx-community/ui';

/** Any content in a card: a button to act on the event, an icon of your own in the dot. */
export default function Content() {
    const s = reactive({ told: '' });
    const act = (what: string) => (
        <Stack orientation="horizontal" gap="sm">
            <Button text={what} variant="outline" size="sm" onclick={() => (s.told = `${what} pressed`)} />
        </Stack>
    );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Timeline
                class="tl-orders"
                label="An order"
                items={[
                    { date: '2026-11-02T09:15:00', title: 'Order placed', description: 'Three items, paid by card.', tone: 'info', content: () => act('See the invoice') },
                    { date: '2026-11-03T14:40:00', title: 'Packed', tone: 'accent', glyph: 'columns' },
                    { date: '2026-11-04T08:00:00', title: 'On its way', description: 'Handed to the courier.', content: () => act('Track it') },
                    { date: '2026-11-05T16:25:00', title: 'Delivered', tone: 'success', glyph: 'check', content: () => act('Rate it') }
                ]}
                dateFormat={{ dateStyle: 'medium', timeStyle: 'short' }}
            />
            <output class="tl-orders-told">{() => s.told}</output>
        </Stack>
    );
}
