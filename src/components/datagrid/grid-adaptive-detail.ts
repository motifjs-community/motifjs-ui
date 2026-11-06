import type { Bind } from '@motifx/core';
import type { FieldLabelMode } from '../../parts/field/field-label-mode';

/**
 * The adaptive detail of a row. While columns hide to fit the width (`columnHidingEnabled`,
 * `hidingPriority`), the "…" cell opens a row below the row with their titles and values, laid out by
 * the kit's `FormLayout` (with editors where the row can be edited in its cells). One row has it open
 * at a time. Every field is a value or a tracked function. Read and change it later through
 * `grid.adaptiveDetail`.
 */
export interface GridAdaptiveDetail {
  /** The columns of the form. The default is `2`. */
  colCount?: Bind<number>;
  /** As many columns as fit, each at least this wide (a CSS length), up to `colCount`. The default is `'16rem'`. */
  minColWidth?: Bind<string | undefined>;
  /** Where the titles appear. The default is `'side'`. */
  labelMode?: Bind<FieldLabelMode>;
  /**
   * Shows editors in place of text for the cells the user can fill, in the `'row'`, `'cell'` and
   * `'batch'` edit modes. The default is `true`.
   */
  editors?: Bind<boolean>;
  /**
   * Editing a row with hidden columns it can fill opens its adaptive detail, and leaving the row closes
   * it. The default is `true`.
   */
  expandOnEdit?: Bind<boolean>;
  /** The width of the "…" column, in pixels. The default is `36`. */
  columnWidth?: Bind<number>;
  /** Keys on the "…" cell that open and close the detail (`KeyboardEvent.key` values). The default is `['Enter', ' ']`. */
  toggleKeys?: Bind<readonly string[]>;
}
