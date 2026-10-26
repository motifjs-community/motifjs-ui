import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { ContentLifetime } from './content-lifetime';
import type { TabContentClone } from './tab-content-clone';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocumentContent } from './tab-document-content';
import type { TabTone } from './tab-tone';

/** What a `TabDocument` is made from. Every field but `id`, `type`, `content` and `clone` takes a value or a function. */
export interface TabDocumentOptions {
  /** Stays the same for the document's life; made up when left out. */
  id?: string;
  /** The key a layout is restored by: `loadLayout`'s factory and the manager's `factory` read it. */
  type?: string;
  title?: Bind<string>;
  /** A second, quieter text after the title: tells two documents of the same title apart. */
  description?: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** Shown when the pointer rests on the tab. Default: the title and the description. */
  tooltip?: Bind<string>;
  /** A short text or number after the title; `true` shows a dot. */
  badge?: Bind<string | number | boolean | null | undefined>;
  /** Colours the title and the badge. */
  tone?: Bind<TabTone | null | undefined>;
  /** Unsaved changes: a dot takes the close button's place. */
  dirty?: Bind<boolean>;
  pinned?: Bind<boolean>;
  /** A preview tab: the next preview opened in its group takes its place, until it is kept. */
  preview?: Bind<boolean>;
  /** `false`: no close button, and the user cannot close it; the close button of a dock area hides it instead (`allowHide`). Default `true`. */
  closable?: Bind<boolean>;
  /** This document's own setting; left out, the manager's. */
  contentLifetime?: Bind<ContentLifetime | undefined>;
  /** This document's own setting; left out, the manager's `allowDuplicate`. */
  allowDuplicate?: Bind<boolean | undefined>;
  /** This document's own setting; left out, the manager's `allowDrag`. */
  allowDrag?: Bind<boolean | undefined>;
  /** This document's own setting; left out, the manager's `allowFloat`. */
  allowFloat?: Bind<boolean | undefined>;
  /** This document's own setting; left out, the manager's `allowDock`. */
  allowDock?: Bind<boolean | undefined>;
  /** The dock areas this document may go to; left out, the manager's `dockSides`. */
  dockSides?: Bind<readonly TabDockSide[] | undefined>;
  /** This document's own setting; left out, the manager's `allowAutoHide`. */
  allowAutoHide?: Bind<boolean | undefined>;
  /** This document's own setting; left out, the manager's `allowHide`. */
  allowHide?: Bind<boolean | undefined>;
  /** This document's own setting; left out, the manager's `allowNewWindow`. */
  allowNewWindow?: Bind<boolean | undefined>;
  /** Buttons for the group's toolbar while this document is the active one. */
  actions?: Bind<readonly ToolbarItem[]>;
  content?: TabDocumentContent;
  /** Makes the content of a copy of the document in another group; without it `content` (a function) or the manager's `factory` does. */
  clone?: TabContentClone;
  /** The app's own data for the document, saved with the layout. */
  state?: Bind<unknown>;
}
