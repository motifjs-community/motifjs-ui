import { reactive } from '@motifx/core';
import type { GridAdaptiveDetail } from '../grid-adaptive-detail';
import type { AdaptiveDetailValues } from './adaptive-detail-values';
import { Switches } from './Switches';

const KEYS: (keyof AdaptiveDetailValues)[] = ['colCount', 'minColWidth', 'labelMode', 'editors', 'expandOnEdit', 'columnWidth', 'toggleKeys'];

const DEFAULTS: Partial<AdaptiveDetailValues> = {
  colCount: 2,
  minColWidth: '16rem',
  labelMode: 'side',
  editors: true,
  expandOnEdit: true,
  columnWidth: 36,
  toggleKeys: ['Enter', ' '],
};

/**
 * Which row has its adaptive detail open (one at a time), by the grid's row id, so
 * a new row can have it too; and the detail's options.
 */
export class AdaptiveRow {
  readonly options: Switches<AdaptiveDetailValues>;
  /** `rowId` of the open row; `auto` when editing opened it. Reactive. */
  readonly state = reactive({ rowId: null as string | null, auto: false });
  /** The data key of the open row, as the data has it; it changes with `state.rowId`. */
  key: unknown = undefined;

  constructor(given: GridAdaptiveDetail | undefined) {
    this.options = new Switches<AdaptiveDetailValues>(KEYS, DEFAULTS, given ?? {});
  }

  isOpen(rowId: string | undefined): boolean {
    return rowId !== undefined && this.state.rowId === rowId;
  }

  open(rowId: string, key: unknown, auto = false) {
    const s = this.state;
    this.key = key;
    s.rowId = rowId;
    s.auto = auto;
  }

  close() {
    const s = this.state;
    if (s.rowId === null) return;
    this.key = undefined;
    s.rowId = null;
    s.auto = false;
  }
}
