import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ColorChangedEventArgs } from './color-changed-event-args';

/** Props of `ColorPicker`. Each prop is also a settable property, and a function is tracked. */
export interface ColorPickerProps extends ControlProps {
  /**
   * The color: `#rrggbb` (`#rrggbbaa` with `alpha`). Any `#…` or `rgb(…)` form is accepted, and `null` means none.
   * `x-model` provides two-way binding.
   */
  value?: Bind<string | null>;
  /** Adds an opacity strip and input, and the value keeps its opacity. The default is `false`. */
  alpha?: Bind<boolean>;
  /** Preset colors that can be selected with one click. By default, there are none. */
  palette?: Bind<readonly string[] | null>;
  /** Shows the hex and red, green and blue inputs. The default is `true`. */
  showInputs?: Bind<boolean>;
  /** Shows a button that picks a color from the screen, in browsers that support it. The default is `true`. */
  eyeDropper?: Bind<boolean>;
  onValueChanged?: (e: ColorChangedEventArgs) => void;
}
