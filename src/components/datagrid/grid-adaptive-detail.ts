import type { Bind } from '@motifx/core';
import type { FieldLabelMode } from '../../parts/field/field-label-mode';

/**
 * The adaptive detail of a row: while columns hide to fit the width (`columnHidingEnabled`,
 * `hidingPriority`), the "…" cell opens a row under the row with their titles and values, laid out
 * by the kit's `FormLayout` (editors where the row can be edited in its cells). One row has it open
 * at a time. Every field is a value or a tracked function; read and change it later
 * through `grid.adaptiveDetail`.
 */
export interface GridAdaptiveDetail {
  /** Columns of the form. Default `2`. */
  colCount?: Bind<number>;
  /** As many columns as fit, each at least this wide (a CSS length); `colCount` is the most. Default `'16rem'`. */
  minColWidth?: Bind<string | undefined>;
  /** Where the titles go. Default `'side'`. */
  labelMode?: Bind<FieldLabelMode>;
  /** Editors instead of texts for the cells the user can fill, in the `'row'`, `'cell'` and `'batch'` edit modes. Default `true`. */
  editors?: Bind<boolean>;
  /** Editing a row with hidden columns it can fill opens its adaptive detail, and closes it when the row is left (row editing). Default `true`. */
  expandOnEdit?: Bind<boolean>;
  /** Width of the "…" column, in pixels. Default `36`. */
  columnWidth?: Bind<number>;
  /** Keys on the "…" cell that open and close the detail (`KeyboardEvent.key` values). Default `['Enter', ' ']`. */
  toggleKeys?: Bind<readonly string[]>;
}
