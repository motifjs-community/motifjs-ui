import type { UiStrings } from '../../../core/ui-strings';
import type { GridFilterOperator } from '../grid-filter-operator';

/** The name of each condition, in `uiLocale`. */
export const OPERATOR_TEXTS: Record<GridFilterOperator, keyof UiStrings> = {
  contains: 'gridOpContains',
  startswith: 'gridOpStartsWith',
  endswith: 'gridOpEndsWith',
  '=': 'gridOpEquals',
  '<>': 'gridOpNotEquals',
  '<': 'gridOpLess',
  '<=': 'gridOpLessOrEqual',
  '>': 'gridOpGreater',
  '>=': 'gridOpGreaterOrEqual',
  between: 'gridOpBetween',
  isblank: 'gridOpBlank',
  isnotblank: 'gridOpNotBlank',
};

/** The short mark of each condition on its button. */
export const OPERATOR_MARKS: Record<GridFilterOperator, string> = {
  contains: '∗',
  startswith: 'a…',
  endswith: '…a',
  '=': '=',
  '<>': '≠',
  '<': '<',
  '<=': '≤',
  '>': '>',
  '>=': '≥',
  between: '↔',
  isblank: '∅',
  isnotblank: '≠∅',
};
