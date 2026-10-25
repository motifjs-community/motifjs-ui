import { data } from '@motifx-community/data';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';

/** Orders in memory that answer like a server, and turn down a note with "error" in it. */
export class OrderService extends SlowAdapter<Order, number> {
  protected override updateRow(key: number, changes: Partial<Order>): Promise<Partial<Order>> {
    return this.later(changes, () => super.updateRow(key, changes));
  }

  protected override insertRow(values: Partial<Order>): Promise<Partial<Order>> {
    return this.later(values, () => super.insertRow(values));
  }

  private later(values: Partial<Order>, save: () => Promise<Partial<Order>>): Promise<Partial<Order>> {
    const message = 'The server does not take this note.';
    return new Promise((done, fail) =>
      setTimeout(() => {
        if (String(values.note ?? '').includes('error')) fail(data.DataError.create('MJD202', { operation: 'save', fields: { note: message } }, message));
        else save().then(done, fail);
      }, 300),
    );
  }
}
