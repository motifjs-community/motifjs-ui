import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { GroupBoxToggledEventArgs } from './group-box-toggled-event-args';
import type { GroupBoxVariant } from './group-box-variant';
import type { LayoutSpace } from './layout-space';

/** Props of `GroupBox`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface GroupBoxProps extends ControlProps {
  /** The title; `&Address` makes Alt+A focus the first control inside. The same property as `text`. */
  title?: Bind<string>;
  /** The title is a button that shows and hides the content. Default `false`. */
  collapsible?: Bind<boolean>;
  /** The content is hidden (with `collapsible`). Default `false`. */
  collapsed?: Bind<boolean>;
  /** The space inside the frame, one to four values as in CSS. Default the `layout.group-box.padding` token. */
  padding?: Bind<LayoutSpace>;
  /** The space between the children. Default the `layout.group-box.gap` token. */
  gap?: Bind<LayoutSpace>;
  /** Default `'outline'`. */
  variant?: Bind<GroupBoxVariant>;
  /** The content was shown or hidden, by the user or by code. */
  onToggled?: (e: GroupBoxToggledEventArgs) => void;
}
