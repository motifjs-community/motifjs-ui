import { givenField, givenList } from '../../../core/given-field';
import type { SchedulerResource } from '../scheduler-resource';
import { sameValue } from './same-value';

/** An item's own work time; what it leaves out is the scheduler's. */
export interface OwnWork {
  start?: number;
  end?: number;
  days?: readonly number[];
}

/**
 * A resource kind with its settings decided: its items and how to read them. The items and their
 * fields are read as they are (plain or reactive alike); a change in place reaches it through the
 * scheduler's refresh.
 */
export class ResourceKind<R = unknown> {
  /** The items by their value, made again when the list read is another one. */
  private indexed: readonly R[] | null = null;
  private byValue = new Map<string, R>();

  constructor(
    readonly def: SchedulerResource<R>,
    private readonly rows: () => readonly R[],
  ) {}

  get field(): string {
    return givenField<string>(this.def, 'field');
  }
  get label(): string {
    return givenField<string | undefined>(this.def, 'label') || this.field;
  }
  get multiple(): boolean {
    return !!givenField(this.def, 'allowMultiple');
  }
  get useColorAsDefault(): boolean {
    return !!givenField(this.def, 'useColorAsDefault');
  }
  /** Its items, as a list of the kit's own (the items themselves in it). Reactive: follows the scheduler's refresh. */
  get items(): readonly R[] {
    return this.rows();
  }

  valueOf(item: R): unknown {
    return givenField(item, this.expr('valueExpr', 'id'));
  }
  textOf(item: R): string {
    const text = givenField(item, this.expr('displayExpr', 'text'));
    return text === undefined || text === null ? String(this.valueOf(item) ?? '') : String(text);
  }
  colorOf(item: R | undefined): string {
    const color = item === undefined ? undefined : givenField(item, this.expr('colorExpr', 'color'));
    return typeof color === 'string' ? color : '';
  }
  /** The value of its item of the kind above it, when the kind says where (`parentExpr`). */
  parentOf(item: R): unknown {
    const name = givenField<string | undefined>(this.def, 'parentExpr');
    return name ? givenField(item, name) : undefined;
  }
  workOf(item: R | undefined): OwnWork {
    if (item === undefined) return {};
    const start = givenField(item, this.expr('workStartHourExpr', 'workStartHour'));
    const end = givenField(item, this.expr('workEndHourExpr', 'workEndHour'));
    const days = givenField(item, this.expr('workDaysExpr', 'workDays'));
    return {
      start: typeof start === 'number' ? start : undefined,
      end: typeof end === 'number' ? end : undefined,
      days: Array.isArray(days) ? givenList(days as number[]) : undefined,
    };
  }
  /** The item with this value. */
  find(value: unknown): R | undefined {
    const items = this.items;
    if (value === undefined || value === null) return items.find((item) => sameValue(this.valueOf(item), value));
    if (items !== this.indexed) {
      this.indexed = items;
      this.byValue = new Map();
      for (const item of items) {
        const own = this.valueOf(item);
        if (own !== undefined && own !== null && !this.byValue.has(String(own))) this.byValue.set(String(own), item);
      }
    }
    return this.byValue.get(String(value));
  }

  private expr(name: keyof SchedulerResource<R>, fallback: string): string {
    return givenField<string | undefined>(this.def, name) ?? fallback;
  }
}
