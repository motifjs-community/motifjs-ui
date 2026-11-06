import { reactive } from '@motifx/core';
import { Panel, ScrollView, Stack } from '@motifx-community/ui';

const TOTAL = 60;
const PAGE = 15;

// A page of rows, as a server would send them.
const fetchRows = (from: number) =>
    new Promise<string[]>(resolve => setTimeout(() => resolve(Array.from({ length: Math.min(PAGE, TOTAL - from) }, (_, i) => `Order #${1000 + from + i}`)), 800));

/** Near the end, the view requests more data. The indicator stays until the rows arrive, and `release(true)` ends it when there is no more. */
export default function More() {
    const s = reactive({ rows: [] as string[] });
    const more = () =>
        fetchRows(s.rows.length).then(rows => {
            s.rows = [...s.rows, ...rows];
            return s.rows.length >= TOTAL;
        });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <output class="sv-more-told">{() => (s.rows.length >= TOTAL ? `All ${TOTAL} orders are in.` : `${s.rows.length} of ${TOTAL} orders`)}</output>
            <ScrollView label="Orders" class="sv-orders" loadOnReachBottom reachBottomOffset={80} onReachBottom={e => more().then(done => e.release(done))} style="block-size: 14rem">
                {s.rows.map(row => (
                    <Panel key={row} variant="outline" padding="sm">
                        {row}
                    </Panel>
                ))}
            </ScrollView>
        </Stack>
    );
}
