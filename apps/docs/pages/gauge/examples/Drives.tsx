import { Gauge, Stack } from '@motifx-community/ui';

const DRIVES = [
    { name: 'System', used: 212, size: 256 },
    { name: 'Projects', used: 640, size: 1000 },
    { name: 'Backup', used: 1880, size: 2000 }
];

/** Bars in a list, one for each drive. A drive more than 90 percent full takes the danger tone. */
export default function Drives() {
    return (
        <Stack class="ga-drives" gap="md" style="inline-size: 100%">
            {DRIVES.map(d => (
                <Gauge type="linear" value={d.used} max={d.size} label={d.name} format={{ style: 'unit', unit: 'gigabyte' }}
                    ranges={[{ from: d.size * 0.9, to: d.size, tone: 'danger', label: 'almost full' }]} />
            ))}
        </Stack>
    );
}
