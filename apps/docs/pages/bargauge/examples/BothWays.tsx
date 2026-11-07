import { BarGauge } from '@motifx-community/ui';

const mm = (v: number) => `${v.toFixed(2)} mm`;

/** Deviations from a measure: the bars start at 0 and go either way. */
export default function BothWays() {
    return <BarGauge class="bg-both" data={[-2.13, 1.48, -3.09, 4.52, 3.9]} min={-5} max={5} baseValue={0} format={mm} label="Deviations of the parts" />;
}
