import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Candles from './examples/Candles';
import CandlesVolume from './examples/CandlesVolume';
import CandlesPeriods from './examples/CandlesPeriods';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const FIELDS = [
    ['lowField, highField', '`string | (row) => unknown`', '', 'The ends of a range, and the lowest and highest price of a candle.'],
    ['openField, closeField', '`string | (row) => unknown`', '', 'The first and the last price of a candle.'],
];

export default function ChartCandlesPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Candles show the first, highest, lowest and last price for each position." />
            </p>

            <Section anchor="candles" title="Candles">
                <p>
                    <Rich text="`candlestick` and `ohlc` show four prices for each position: `openField`, `highField`, `lowField` and `closeField`. Rising and falling take the design language's colors for good and bad, and a rising candle is hollow as well." />
                </p>
                <Example stack files={code('Candles.tsx')}>
                    <Candles />
                </Example>
            </Section>
            <Section anchor="volume" title="Price and volume">
                <p>
                    <Rich text="Prices and the volume traded have different units, so they go in two charts on the same time axis instead of on two scales of one plot. A reference line marks the average close." />
                </p>
                <Example stack files={code('CandlesVolume.tsx')}>
                    <CandlesVolume />
                </Example>
            </Section>
            <Section anchor="periods" title="Periods">
                <p>
                    <Rich text="With `zoom` on, `zoomTo()` shows a stretch of time, for example the latest month, and `resetZoom()` shows all of it again. The reader can still drag across the plot, and `onZoomChanged` reports every change." />
                </p>
                <Example stack files={code('CandlesPeriods.tsx')}>
                    <CandlesPeriods />
                </Example>
            </Section>
            <Section anchor="api" title="API reference">
                <ApiTable head={['Field', 'Type', 'Default', 'Description']} rows={FIELDS} />
                <p>
                    <Rich text="Every other prop, member and event is on the [Overview](/chart#api)." />
                </p>
            </Section>
        </>
    );
}
