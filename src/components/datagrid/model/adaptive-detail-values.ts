import type { FieldLabelMode } from '../../../parts/field/field-label-mode';

/** The `adaptiveDetail` options as the grid reads them: values, not functions. */
export interface AdaptiveDetailValues {
  colCount: number;
  minColWidth: string | undefined;
  labelMode: FieldLabelMode;
  editors: boolean;
  expandOnEdit: boolean;
  columnWidth: number;
  toggleKeys: readonly string[];
}
