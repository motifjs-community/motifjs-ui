import { reactive } from '@motifx/core';
import { Gauge, Slider, Stack } from '@motifx-community/ui';

const RANGES = [
    { from: 0, to: 60, tone: 'good' as const, label: 'quiet' },
    { from: 60, to: 85, tone: 'warning' as const, label: 'loud' },
    { from: 85, to: 120, tone: 'danger' as const, label: 'harmful' }
];

const decibels = (v: number) => `${v} dB`;

/** What assistive technology reads: the value with the name of its range, shown here under the gauge. */
export default function ReadRange() {
    const s = reactive({ level: 52, read: '' });
    // Shows the text the gauge gives assistive technology each time it changes.
    const follow = (gauge: Gauge) => {
        const show = () => (s.read = gauge.element.getAttribute('aria-valuetext') ?? '');
        new MutationObserver(show).observe(gauge.element, { attributes: true, attributeFilter: ['aria-valuetext'] });
        show();
    };
    return (
        <Stack gap="md" align="start">
            <Gauge ref={follow} class="ga-read" value={() => s.level} max={120} ranges={RANGES}
                format={decibels} label="Noise" />
            <output class="ga-read-out">{() => `Read as: ${s.read}`}</output>
            <Slider label="Noise" x-model={() => s.level} min={0} max={120} />
        </Stack>
    );
}
