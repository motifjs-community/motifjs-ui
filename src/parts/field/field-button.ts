import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { FieldButtonClickEventArgs } from './field-button-click-event-args';

/** A button inside a field's box. Every field but `click` and `data` may be a function. */
export interface FieldButton {
  icon?: Bind<IconSource>;
  text?: Bind<string>;
  /** A tooltip; it also names a button that has only an icon. */
  hint?: Bind<string>;
  /** Default `'end'`. */
  position?: Bind<'start' | 'end'>;
  enabled?: Bind<boolean>;
  visible?: Bind<boolean>;
  /** `false` takes it out of the Tab order. Default `true`. */
  tabStop?: Bind<boolean>;
  click?: (e: FieldButtonClickEventArgs) => void;
  data?: unknown;
}
