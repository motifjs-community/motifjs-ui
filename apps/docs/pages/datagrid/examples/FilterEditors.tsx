import { Component } from '@motifx/core';
import { ButtonGroup, DataGrid, NumberBox, type FilterEditorContext, type GridColumn } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** The status chosen from buttons, written to the filter through the context and redrawn when the filter changes. */
function statusButtons(ctx: FilterEditorContext<Order>) {
    const box = new Component<HTMLDivElement>('div');
    const buttons = new ButtonGroup({
        label: 'Status',
        size: 'sm',
        selection: 'single',
        allowEmpty: true,
        items: [
            { value: 'Approved', text: 'Approved' },
            { value: 'Shipped', text: 'Shipped' },
            { value: 'Delivered', text: 'Delivered' }
        ],
        value: ctx.value as string,
        onValueChanged: e => e.byUser && ctx.setValue(e.value)
    });
    ctx.onChanged(value => (buttons.value = (value as string) ?? null));
    box.controls.add(buttons);
    return box;
}

/** Each column's own filter editor: buttons for the status, a number box that takes no negative amount. */
export default function FilterEditors() {
    const own: GridColumn<Order>[] = columns.map(c =>
        c.field === 'status'
            ? { ...c, width: 260, filterEditor: statusButtons }
            : c.field === 'amount'
              ? { ...c, filterOperators: ['>=', '<='], filterEditor: () => new NumberBox({ labelMode: 'hidden', size: 'sm', min: 0, step: 100 }) }
              : c
    );
    return <DataGrid class="dg-filter-editors" style="block-size: 24rem" rows={makeOrders(200)} rowKey="id" columns={own} label="Orders with their own filter editors" settings={{ filterRow: true }} />;
}
