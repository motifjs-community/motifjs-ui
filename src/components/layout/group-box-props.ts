import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { GroupBoxToggledEventArgs } from './group-box-toggled-event-args';
import type { GroupBoxVariant } from './group-box-variant';
import type { LayoutSpace } from './layout-space';

/** Props of `GroupBox`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface GroupBoxProps extends ControlProps {
  /** The title. `&Address` makes Alt+A move focus to the first control inside. This is the same property as `text`. */
  title?: Bind<string>;
  /** Makes the title a button that shows and hides the content. The default is `false`. */
  collapsible?: Bind<boolean>;
  /** Hides the content (with `collapsible`). The default is `false`. */
  collapsed?: Bind<boolean>;
  /** The space inside the frame, one to four values as in CSS. The default is the `layout.group-box.padding` token. */
  padding?: Bind<LayoutSpace>;
  /** The space between the children. The default is the `layout.group-box.gap` token. */
  gap?: Bind<LayoutSpace>;
  /** The appearance of the box. The default is `'outline'`. */
  variant?: Bind<GroupBoxVariant>;
  /** Occurs when the content is shown or hidden, by the user or by code. */
  onToggled?: (e: GroupBoxToggledEventArgs) => void;
}
