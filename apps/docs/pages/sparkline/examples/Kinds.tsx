import { Sparkline, Stack } from '@motifx-community/ui';

const VALUES = [4, 6, 5, 8, 7, 9, 6, 10, 9, 12, 11, 13];
const RESULTS = [1, -1, 1, 1, -1, 1, -1, -1, 1, 1, 1, -1];

/** A line, an area, bars, and wins and losses. */
export default function Kinds() {
    return (
        <Stack gap="md">
            <span class="sp-line">Line <Sparkline data={VALUES} label="Line" /></span>
            <span class="sp-area">Area <Sparkline type="area" data={VALUES} label="Area" /></span>
            <span class="sp-bar">Bars <Sparkline type="bar" data={VALUES} label="Bars" /></span>
            <span class="sp-winloss">Wins and losses <Sparkline type="winloss" data={RESULTS} label="Results" /></span>
        </Stack>
    );
}
