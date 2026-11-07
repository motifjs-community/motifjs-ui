import { BarGauge } from '@motifx-community/ui';

/** Four ratings against the same scale, each written at the end of its bar. */
export default function Basic() {
    return <BarGauge class="bg-basic" data={[47.3, 65.3, 84.6, 71.9]} format={{ style: 'unit', unit: 'percent', maximumFractionDigits: 1 }} label="Ratings" />;
}
