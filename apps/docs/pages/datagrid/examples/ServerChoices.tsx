import { reactive } from '@motifx/core';
import { DataGrid, type GridColumn, type ListOption } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const PLATES: Record<string, string> = { Ankara: '06', Antalya: '07', Bursa: '16', İstanbul: '34', İzmir: '35', Konya: '42', Trabzon: '61' };

/** The city choices come from a pretend server: asked once with no row, they write the cells, the filter row and the search. */
export default function ServerChoices() {
    const s = reactive({ asked: 0 });
    const cities = (): Promise<readonly ListOption[]> => {
        s.asked++;
        return new Promise(done => setTimeout(() => done(Object.entries(PLATES).map(([city, plate]) => ({ value: city, label: `${city} (${plate})` }))), 800));
    };
    const own: GridColumn<Order>[] = columns.map(c => (c.field === 'city' ? { ...c, width: 150, options: cities } : c));
    return (
        <>
            <DataGrid class="dg-server-choices" style="block-size: 24rem" rows={makeOrders(200)} rowKey="id" columns={own} label="Orders with cities from a server" settings={{ filterRow: true, searchPanel: true }} />
            <output class="dg-server-choices-asked">{() => `The server was asked ${s.asked} times`}</output>
        </>
    );
}
