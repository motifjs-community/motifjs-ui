import { reactive } from '@motifx/core';
import { Button, Stack, Stepper } from '@motifx-community/ui';

const pencil = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path d="M11.5 2.5l2 2L5 13H3v-2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>';
    return svg;
};

/** Completed and failed steps told by the items, an optional step, a disabled one, an icon in place of the number. */
export default function Statuses() {
    const s = reactive({ paid: false });
    const items = [
        { text: 'Cart', status: 'done' as const },
        { text: 'Address', description: 'Checked', status: 'done' as const },
        { text: 'Payment', description: () => (s.paid ? 'Paid' : 'Card declined'), status: () => (s.paid ? 'done' : 'error') },
        { text: 'Gift note', optional: true, icon: pencil() },
        { text: 'Pick-up', enabled: false },
        { text: 'Done' }
    ];
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stepper label="Statuses" items={items} value={5} linear={false} />
            <Button text={() => (s.paid ? 'Decline the card' : 'Take the payment')} variant="outline" onclick={() => (s.paid = !s.paid)} />
        </Stack>
    );
}
