import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { ContentLifetime } from './content-lifetime';
import type { TabContentClone } from './tab-content-clone';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocumentContent } from './tab-document-content';
import type { TabTone } from './tab-tone';

/**
 * The options a `TabDocument` is created from. Every field except `id`, `type`, `content` and `clone`
 * accepts a value or a function.
 */
export interface TabDocumentOptions {
  /** Stays the same for the life of the document, and is generated when omitted. */
  id?: string;
  /** The key used to restore a layout. The `loadLayout` factory and the manager's `factory` read it. */
  type?: string;
  title?: Bind<string>;
  /** A second, lighter text after the title, which distinguishes documents with the same title. */
  description?: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** Shown when the pointer rests on the tab. By default, it is the title and the description. */
  tooltip?: Bind<string>;
  /** A short text or number after the title. `true` shows a dot. */
  badge?: Bind<string | number | boolean | null | undefined>;
  /** Colors the title and the badge. */
  tone?: Bind<TabTone | null | undefined>;
  /** Marks unsaved changes. A dot replaces the close button. */
  dirty?: Bind<boolean>;
  pinned?: Bind<boolean>;
  /** Marks a preview tab, which the next preview opened in its group replaces until it is kept. */
  preview?: Bind<boolean>;
  /**
   * With `false`, there is no close button and the user cannot close the document. The close button of
   * a dock area hides it instead (`allowHide`). The default is `true`.
   */
  closable?: Bind<boolean>;
  /** This document's own setting. When omitted, the manager's setting applies. */
  contentLifetime?: Bind<ContentLifetime | undefined>;
  /** This document's own setting. When omitted, the manager's `allowDuplicate` applies. */
  allowDuplicate?: Bind<boolean | undefined>;
  /** This document's own setting. When omitted, the manager's `allowDrag` applies. */
  allowDrag?: Bind<boolean | undefined>;
  /** This document's own setting. When omitted, the manager's `allowFloat` applies. */
  allowFloat?: Bind<boolean | undefined>;
  /** This document's own setting. When omitted, the manager's `allowDock` applies. */
  allowDock?: Bind<boolean | undefined>;
  /** The dock areas this document can move to. When omitted, the manager's `dockSides` applies. */
  dockSides?: Bind<readonly TabDockSide[] | undefined>;
  /** This document's own setting. When omitted, the manager's `allowAutoHide` applies. */
  allowAutoHide?: Bind<boolean | undefined>;
  /** This document's own setting. When omitted, the manager's `allowHide` applies. */
  allowHide?: Bind<boolean | undefined>;
  /** This document's own setting. When omitted, the manager's `allowNewWindow` applies. */
  allowNewWindow?: Bind<boolean | undefined>;
  /** Buttons in the group's toolbar while this document is active. */
  actions?: Bind<readonly ToolbarItem[]>;
  content?: TabDocumentContent;
  /**
   * Creates the content of a copy of the document in another group. Without it, a `content` function
   * or the manager's `factory` creates it.
   */
  clone?: TabContentClone;
  /** Application data for the document, saved with the layout. */
  state?: Bind<unknown>;
}
