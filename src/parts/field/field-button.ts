import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { FieldButtonClickEventArgs } from './field-button-click-event-args';

/** A button inside a field's box. Every field except `click` and `data` can be a function. */
export interface FieldButton {
  icon?: Bind<IconSource>;
  text?: Bind<string>;
  /** A tooltip, which also names a button that has only an icon. */
  hint?: Bind<string>;
  /** The side of the box. The default is `'end'`. */
  position?: Bind<'start' | 'end'>;
  enabled?: Bind<boolean>;
  visible?: Bind<boolean>;
  /** `false` removes it from the Tab order. The default is `true`. */
  tabStop?: Bind<boolean>;
  click?: (e: FieldButtonClickEventArgs) => void;
  data?: unknown;
}
