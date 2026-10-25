import { Component } from '@motifx/core';
import { Button, ComboBox, DataGrid, FormLayout, NumberBox, ProgressBar, Tab, Tabs, toast } from '@motifx-community/ui';
import { Rich } from '../../shared/doc';
import { OrderModel } from './OrderModel';
import type { OrderLine } from './order-line';

const STATUSES = [
  { value: 'draft', text: 'Draft' },
  { value: 'confirmed', text: 'Confirmed' },
  { value: 'shipped', text: 'Shipped' },
];

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' });

/** An order screen made of the kit's components: the page binds the model and calls it. */
export default class ShowcasePage extends Component {
  private readonly model = new OrderModel();

  private async save(): Promise<void> {
    await this.model.save();
    toast.success(`Order saved — ${money.format(this.model.total)}.`, { title: 'Saved' });
  }

  override view() {
    const model = this.model;
    const order = model.order;
    return (
      <>
        <p class="lead">
          <Rich text="An order screen built with the kit, the way a MotifJS app is built: the state and the operations live in a model (`OrderModel`), the page binds to it. The customer list is a data source of 5,000 rows that answers like a server." />
        </p>

        <div class="showcase">
          <header class="showcase__bar">
            <strong class="showcase__title">{() => `Order · ${STATUSES.find((s) => s.value === order.status)?.text ?? ''}`}</strong>
            <span class="showcase__total">{() => money.format(model.total)}</span>
            <Button text="&Save" tone="accent" busy={() => model.state.saving} onclick={() => this.save()} />
          </header>

          <Tabs label="Order" stretch>
            <Tab title="&Details">
              <FormLayout
                data={order}
                columns={2}
                items={[
                  {
                    field: 'customer',
                    label: '&Customer',
                    editor: 'lookup',
                    required: true,
                    colSpan: 'all',
                    editorProps: {
                      dataSource: model.customers,
                      textField: 'company',
                      valueField: 'id',
                      popupWidth: '34rem',
                      columns: [
                        { field: 'company', caption: 'Company', width: '2fr' },
                        { field: 'city', caption: 'City' },
                        { field: 'phone', caption: 'Phone', width: '8rem' },
                      ],
                    },
                  },
                  { field: 'date', label: 'Order date', editor: 'date', required: true },
                  { field: 'delivery', label: 'Delivery', editor: 'date', editorProps: { min: new Date() } },
                  { field: 'status', label: 'Status', editor: 'dropdown', editorProps: { items: STATUSES } },
                  { field: 'express', label: 'Express delivery', editor: 'switch' },
                  { field: 'note', label: 'Note', editor: 'textarea', colSpan: 'all', editorProps: { autoGrow: true, maxLength: 200, showCounter: true } },
                ]}
              />
            </Tab>
            <Tab title="&Lines" badge={() => order.lines.length}>
              <div class="showcase__lines">
                {order.lines.map((line: OrderLine) => (
                  <div key={line.id} class="showcase__line">
                    <ComboBox
                      label="Product"
                      items={model.products}
                      textField="name"
                      valueField="id"
                      value={() => line.product}
                      onValueChanged={(e) => (line.product = e.value as number | null)}
                      stretch
                    />
                    <NumberBox label="Quantity" min={1} max={99} value={() => line.quantity} onValueChanged={(e) => (line.quantity = e.value)} />
                    <Button text="Remove" variant="ghost" onclick={() => model.removeLine(line)} />
                  </div>
                ))}
                <Button text="Add a line" variant="outline" onclick={() => model.addLine()} />
              </div>
            </Tab>
            <Tab title="&History">
              <div class="showcase__history">
                <DataGrid
                  label="Earlier orders"
                  rows={model.history}
                  rowKey="no"
                  mode="paged"
                  pageSize={8}
                  columns={[
                    { field: 'no', title: 'No', type: 'number', width: 90, format: (v) => String(v) },
                    { field: 'date', title: 'Date', type: 'date', width: 130 },
                    { field: 'lines', title: 'Lines', type: 'number', width: 96 },
                    { field: 'total', title: 'Total', type: 'number', width: 120, format: (v) => money.format(Number(v)) },
                    { field: 'status', title: 'Status', flex: 1 },
                  ]}
                />
              </div>
            </Tab>
            <Tab title="&Summary">
              <div class="docs-flow showcase__summary">
                <ProgressBar label="Credit used" value={() => model.creditUsed} showValue stretch tone={() => (model.creditUsed > 80 ? 'caution' : 'accent')} />
                <span>{() => `${order.lines.length} line(s), ${money.format(model.total)}, saved ${model.state.saved} time(s).`}</span>
              </div>
            </Tab>
          </Tabs>
        </div>
      </>
    );
  }
}
