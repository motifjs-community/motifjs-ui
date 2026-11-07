import { Gauge } from '@motifx-community/ui';

const EXPECTED = [
    { value: 40, label: 'Lowest expected' },
    { value: 90, label: 'Highest expected' }
];

const SOLD = [
    { from: 0, to: 30, tone: 'danger' as const },
    { from: 30, to: 70, tone: 'warning' as const },
    { from: 70, to: 100, tone: 'good' as const }
];

/** The lowest and highest expected values marked on the scale. Point at a mark to see its name. */
export default function Targets() {
    return <Gauge class="ga-marks" value={85} scale="ticks" tickInterval={10} marks={EXPECTED} ranges={SOLD} label="Tickets sold (%)" size={200} />;
}
