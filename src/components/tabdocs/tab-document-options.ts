import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { ContentLifetime } from './content-lifetime';
import type { TabDocumentContent } from './tab-document-content';

/** What a `TabDocument` is made from. Every field but `id`, `type` and `content` takes a value or a function. */
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
  /** A short text or number after the title. */
  badge?: Bind<string | number | null | undefined>;
  /** Unsaved changes: a dot takes the close button's place. */
  dirty?: Bind<boolean>;
  pinned?: Bind<boolean>;
  preview?: Bind<boolean>;
  /** `false`: no close button, and the user cannot close it. Default `true`. */
  closable?: Bind<boolean>;
  /** This document's own setting; left out, the manager's. */
  contentLifetime?: Bind<ContentLifetime | undefined>;
  content?: TabDocumentContent;
  /** The app's own data for the document, saved with the layout. */
  state?: Bind<unknown>;
}
