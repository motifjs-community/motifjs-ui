import { reactive } from '@motifx/core';
import { Button, Gallery, Stack } from '@motifx-community/ui';

const PLANS = [
    { name: 'Starter', price: '€9', line: 'One project, two people' },
    { name: 'Team', price: '€29', line: 'Ten projects, your whole team' },
    { name: 'Company', price: '€79', line: 'No limits, a person to call' }
];

/** Any content in a pane: a plan each, with its own button; a press on the pane itself is told too. */
export default function Content() {
    const s = reactive({ told: '' });
    const plan = (p: (typeof PLANS)[number]) => (
        <Stack class="ga-plan" gap="xs" align="center" justify="center" style="block-size: 100%">
            <strong>{p.name}</strong>
            <span class="ga-plan-price">{p.price} a month</span>
            <span>{p.line}</span>
            <Button text="Choose" variant="outline" onclick={() => (s.told = `${p.name} chosen`)} />
        </Stack>
    );
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Gallery class="ga-plans" label="Plans" height={200} swipeEnabled={false} items={PLANS.map(p => ({ key: p.name, content: () => plan(p) }))} onItemClick={e => (s.told = `pane ${e.index + 1} pressed`)} />
            <output class="ga-plans-told">{() => s.told}</output>
        </Stack>
    );
}
