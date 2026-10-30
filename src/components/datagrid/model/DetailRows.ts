import { reactive, untracked } from '@motifx/core';
import type { GridMasterDetail } from '../grid-master-detail';
import type { MasterDetailValues } from './master-detail-values';
import { Switches } from './Switches';

const KEYS: (keyof MasterDetailValues<unknown>)[] = [
  'enabled',
  'autoExpandAll',
  'template',
  'canExpand',
  'keepDetails',
  'height',
  'estimatedHeight',
  'keepLimit',
  'columnWidth',
  'toggleKeys',
  'arrowKeys',
];

const DEFAULTS: Partial<MasterDetailValues<unknown>> = {
  enabled: false,
  autoExpandAll: false,
  canExpand: true,
  keepDetails: true,
  estimatedHeight: 200,
  keepLimit: 100,
  columnWidth: 36,
  toggleKeys: ['Enter', ' '],
  arrowKeys: true,
};

/**
 * Which rows have their details open, by key: either every row but some (`autoExpandAll`,
 * `expandAllRows()`) or no row but some. Keys are kept as text (the data's `keyString`), so the
 * state holds across sort, filter, search, grouping and pages; the raw keys are kept to find the rows.
 */
export class DetailRows<T> {
  readonly options: Switches<MasterDetailValues<T>>;
  /** Raised when rows open or close. Reactive. */
  readonly state = reactive({ version: 0 });
  private all = false;
  /** Rows that differ from `all`: key text → key. */
  private readonly toggled = new Map<string, unknown>();

  constructor(given: GridMasterDetail<T> | undefined) {
    this.options = new Switches<MasterDetailValues<T>>(KEYS as (keyof MasterDetailValues<T>)[], DEFAULTS as Partial<MasterDetailValues<T>>, given ?? {});
    this.all = untracked(() => this.options.get('autoExpandAll'));
  }

  /** Rows can have details: a template is given. Reactive. */
  get on(): boolean {
    return typeof this.options.get('template') === 'function';
  }

  /** The user opens and closes them (the expand column shows). Reactive. */
  get enabled(): boolean {
    return this.on && this.options.get('enabled');
  }

  /** Every row is open but `exceptions()`. */
  get allOpen(): boolean {
    return this.all;
  }

  /** How many rows differ from `allOpen`. */
  get exceptionCount(): number {
    return this.toggled.size;
  }

  /** The keys of the rows that differ from `allOpen`. */
  exceptions(): unknown[] {
    return [...this.toggled.values()];
  }

  /** Whether a row may have details, by `canExpand`. Reactive. */
  canExpand(row: T): boolean {
    if (!this.on) return false;
    const can = this.options.get('canExpand');
    return typeof can === 'function' ? !!untracked(() => can(row)) : can !== false;
  }

  /** Whether the row with this key text is open. Reactive. */
  isOpen(id: string): boolean {
    void this.state.version;
    return this.all !== this.toggled.has(id);
  }

  /** Opens or closes one row; returns whether it changed. */
  setOpen(id: string, key: unknown, open: boolean): boolean {
    if (this.isOpen(id) === open) return false;
    if (open === this.all) this.toggled.delete(id);
    else this.toggled.set(id, key);
    this.state.version++;
    return true;
  }

  /** Opens or closes every row. */
  setAll(open: boolean) {
    if (this.all === open && !this.toggled.size) return;
    this.all = open;
    this.toggled.clear();
    this.state.version++;
  }

  /** Back to `autoExpandAll`. */
  reset() {
    this.all = untracked(() => this.options.get('autoExpandAll'));
    this.toggled.clear();
    this.state.version++;
  }
}
