import type { GaugeRange } from '@motifx-community/ui';

/** What the temperatures, the air and the load mean, shared by every screen. */
export const CLIMATE: GaugeRange[] = [
    { from: 10, to: 18, tone: 'warning', label: 'cold' },
    { from: 18, to: 24, tone: 'good', label: 'comfortable' },
    { from: 24, to: 30, tone: 'danger', label: 'warm' }
];

export const AIR: GaugeRange[] = [
    { from: 0, to: 50, tone: 'good', label: 'good' },
    { from: 50, to: 75, tone: 'warning', label: 'moderate' },
    { from: 75, to: 100, tone: 'danger', label: 'poor' }
];

export const LOAD: GaugeRange[] = [
    { from: 0, to: 3, tone: 'good', label: 'normal' },
    { from: 3, to: 4.5, tone: 'warning', label: 'high' },
    { from: 4.5, to: 6, tone: 'danger', label: 'near the limit' }
];

export const degrees = (v: number) => `${v.toFixed(1)}°`;
export const kw = (v: number) => `${v.toFixed(1)} kW`;
export const kwh = (v: number) => `${v.toFixed(1)} kWh`;

export const MODES = [
    { value: 'heat', text: 'Heat' },
    { value: 'cool', text: 'Cool' },
    { value: 'auto', text: 'Auto' },
    { value: 'off', text: 'Off' }
];
