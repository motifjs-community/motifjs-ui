import { createSignal, read, type Bind, type ComponentBase, type Signal } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import type { ContentLifetime } from './content-lifetime';
import type { TabDocumentContent } from './tab-document-content';
import type { TabDocumentOptions } from './tab-document-options';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

const FIELDS = ['title', 'description', 'icon', 'tooltip', 'badge', 'dirty', 'pinned', 'preview', 'closable', 'contentLifetime', 'state'] as const;

/**
 * A document of a `TabDocumentManager`: a tab and its content, which can be any component. Every
 * field takes a value or a function (`dirty: () => form.changed`) and is reactive to read.
 *
 * @example
 * const doc = new TabDocument({ type: 'order', title: 'Order 1042', state: { id: 1042 }, content: (d) => new OrderForm(d.state) });
 * manager.open(doc);
 * doc.dirty = true;
 */
export class TabDocument {
  readonly id: string;
  readonly type: string;
  /** What `contentComponent` is made from. */
  content: TabDocumentContent | null;
  private readonly values = new Map<string, Signal<unknown>>();
  private readonly where = createSignal<{ manager: TabDocumentManager; group: TabGroup } | null>(null);

  constructor(options: TabDocumentOptions = {}) {
    this.id = options.id ?? nextId('doc');
    this.type = options.type ?? '';
    this.content = options.content ?? null;
    for (const name of FIELDS) if (options[name] !== undefined) this.slot(name).value = options[name];
  }

  get title(): string {
    return this.get<string>('title') ?? '';
  }
  set title(value: Bind<string>) {
    this.slot('title').value = value;
  }
  get description(): string {
    return this.get<string>('description') ?? '';
  }
  set description(value: Bind<string>) {
    this.slot('description').value = value;
  }
  get icon(): IconSource | null {
    return this.get<IconSource | null>('icon') ?? null;
  }
  set icon(value: Bind<IconSource | null | undefined>) {
    this.slot('icon').value = value;
  }
  get tooltip(): string {
    return this.get<string>('tooltip') ?? '';
  }
  set tooltip(value: Bind<string>) {
    this.slot('tooltip').value = value;
  }
  get badge(): string | number | null {
    return this.get<string | number | null>('badge') ?? null;
  }
  set badge(value: Bind<string | number | null | undefined>) {
    this.slot('badge').value = value;
  }
  get dirty(): boolean {
    return !!this.get<boolean>('dirty');
  }
  set dirty(value: Bind<boolean>) {
    this.slot('dirty').value = value;
  }
  get pinned(): boolean {
    return !!this.get<boolean>('pinned');
  }
  set pinned(value: Bind<boolean>) {
    this.slot('pinned').value = value;
  }
  get preview(): boolean {
    return !!this.get<boolean>('preview');
  }
  set preview(value: Bind<boolean>) {
    this.slot('preview').value = value;
  }
  get closable(): boolean {
    return this.get<boolean>('closable') ?? true;
  }
  set closable(value: Bind<boolean>) {
    this.slot('closable').value = value;
  }
  /** The document's own setting; `undefined` follows the manager. */
  get contentLifetime(): ContentLifetime | undefined {
    return this.get<ContentLifetime>('contentLifetime') ?? undefined;
  }
  set contentLifetime(value: Bind<ContentLifetime | undefined>) {
    this.slot('contentLifetime').value = value;
  }
  get state(): unknown {
    return this.get<unknown>('state');
  }
  set state(value: Bind<unknown>) {
    this.slot('state').value = value;
  }

  /** The manager it is open in. Reactive. */
  get manager(): TabDocumentManager | null {
    return this.where.value?.manager ?? null;
  }
  /** The group it is open in. Reactive. */
  get group(): TabGroup | null {
    return this.where.value?.group ?? null;
  }
  get isOpen(): boolean {
    return !!this.where.value;
  }
  /** Whether it is its group's active tab. Reactive. */
  get isActive(): boolean {
    const group = this.group;
    return !!group && group.activeDocument === this;
  }
  /** The content made for it, `null` while it is not built. */
  get contentComponent(): ComponentBase | null {
    return this.manager?.contentOf(this) ?? null;
  }

  /** Makes it its group's active tab. */
  activate(focus = false): boolean {
    return this.manager?.activate(this, focus) ?? false;
  }

  /** Closes it as its close button does: `onClosing` may keep it. */
  close(): Promise<boolean> {
    return this.manager?.close(this) ?? Promise.resolve(false);
  }

  /** @internal Where the manager put it. */
  placeIn(manager: TabDocumentManager | null, group: TabGroup | null): void {
    this.where.value = manager && group ? { manager, group } : null;
  }

  private get<T>(name: string): T | undefined {
    return read(this.slot(name).value as Bind<T>);
  }

  private slot(name: string): Signal<unknown> {
    let slot = this.values.get(name);
    if (!slot) this.values.set(name, (slot = createSignal<unknown>(undefined)));
    return slot;
  }
}
