import { Chart } from '@motifx-community/ui';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SOLD = [420, 446, 470, 462, 498, 530, 548];

// The months give the axis; the series bring their own values.
const AXIS: Record<string, string | number>[] = MONTHS.map(month => ({ month }));
const ACTUAL = SOLD.map((units, i) => ({ month: MONTHS[i], units }));
// The forecast starts at the last real month and widens as it goes further.
const FORECAST = MONTHS.slice(SOLD.length - 1).map((month, i) => {
    const units = SOLD[SOLD.length - 1] + i * 22;
    return { month, units, low: units - i * 16, high: units + i * 16 };
});

/** Each series with rows of its own: what was sold, the forecast, and the band it may fall in. */
export default function RangesForecast() {
    return (
        <Chart
            class="ch-range-forecast"
            title="Units sold, and the forecast"
            data={AXIS}
            xField="month"
            series={[
                { type: 'rangeArea', data: FORECAST, lowField: 'low', highField: 'high', name: 'Likely range' },
                { data: FORECAST, yField: 'units', name: 'Forecast', markers: true },
                { data: ACTUAL, yField: 'units', name: 'Sold', markers: true }
            ]}
        />
    );
}
