import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ColorChangedEventArgs } from './color-changed-event-args';

/** Props of `ColorPicker`. Each prop is also a settable property, and a function is tracked. */
export interface ColorPickerProps extends ControlProps {
  /** The color: `#rrggbb` (`#rrggbbaa` with `alpha`), or any `#…` / `rgb(…)` form it reads; `null`: none. Two-way with `x-model`. */
  value?: Bind<string | null>;
  /** An opacity strip and input; the value keeps its opacity. Default `false`. */
  alpha?: Bind<boolean>;
  /** Preset colors to choose with one press. Default: none. */
  palette?: Bind<readonly string[] | null>;
  /** The hex and red, green, blue inputs. Default `true`. */
  showInputs?: Bind<boolean>;
  /** A button that picks a color from the screen, where the browser can. Default `true`. */
  eyeDropper?: Bind<boolean>;
  onValueChanged?: (e: ColorChangedEventArgs) => void;
}
