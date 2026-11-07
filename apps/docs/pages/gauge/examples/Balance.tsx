import { Gauge, Stack } from '@motifx-community/ui';

const MONTHS = [
    { name: 'January', change: 12 },
    { name: 'February', change: -7 },
    { name: 'March', change: 4 },
    { name: 'April', change: -15 }
];

const RESULT = [
    { from: -20, to: 0, tone: 'danger' as const, label: 'loss' },
    { from: 0, to: 20, tone: 'good' as const, label: 'profit' }
];

/** Changes against last year, one bar each: a loss fills to the left of 0, a profit to the right. */
export default function Balance() {
    return (
        <Stack class="ga-balance" gap="md" style="inline-size: 100%">
            {MONTHS.map(m => (
                <Gauge type="linear" value={m.change} min={-20} max={20} baseValue={0} label={m.name} ranges={RESULT} scale="ticks" tickInterval={10}
                    format={{ style: 'unit', unit: 'percent', signDisplay: 'exceptZero' }} />
            ))}
        </Stack>
    );
}
