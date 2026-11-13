import { untracked, type Component } from '@motifx/core';
import { loose, part, removePart } from '../../core/draw-parts';
import { focusOn } from '../../core/focus';
import { isRtl } from '../../core/measure';
import { orderControls } from '../../core/order-controls';
import { kept, mark as markPart, put, text as writeText } from '../../core/part-writes';
import { showIcon } from '../../core/show-icon';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabPresenter } from './TabPresenter';
import { uiLocale } from '../../core/ui-locale';

interface Entry {
  button: Component<HTMLButtonElement>;
  /** The icon, or the title's first letter without one. */
  mark: Component<HTMLSpanElement>;
  label: Component<HTMLSpanElement>;
  release: () => void;
  icon: unknown;
  title: string;
}

/**
 * The bar at the bottom of a phone: a button for each tool of the dock areas, which opens its area in
 * a bottom sheet (or a drawer) with that tool, and closes it again. The arrow keys go along it.
 */
export class PhoneTools {
  /** The bar as a component of the manager: its buttons are its children. */
  readonly part: Component<HTMLDivElement>;
  private readonly buttons = new Map<TabDocument, Entry>();
  private hasTools = false;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly presenter: TabPresenter,
  ) {
    this.part = loose<HTMLDivElement>('div', 'mx-tabdocs__phone-tools');
    this.part.attr.add({ role: 'toolbar' });
    this.part.motif.on('click', (_, e) => untracked(() => this.toggle(this.documentAt(e))));
    this.part.motif.on('keydown', (_, e) => this.key(e));
    manager.controls.add(this.part);
  }

  /** Whether the bar shows: it hides itself when no dock area has a tool to give. */
  get isShown(): boolean {
    return this.hasTools;
  }

  render(): void {
    const m = this.manager;
    const tools = m.dockAreas.filter((a) => this.presenter.dockMode(a) !== 'hidden').flatMap((a) => a.documents);
    this.hasTools = tools.length > 0;
    kept(this.part, this.hasTools);
    put(this.part, 'aria-label', m.textOf('tabDocsPhoneTools'));
    for (const [doc, entry] of this.buttons) {
      if (tools.includes(doc)) continue;
      entry.release();
      removePart(entry.button);
      this.buttons.delete(doc);
    }
    let stop: Component<HTMLButtonElement> | null = null;
    const wanted = tools.map((doc, i) => {
      const entry = this.entryOf(doc);
      const area = doc.group?.dockArea;
      const open = !!area && this.presenter.isToolOpen(area) && doc.group?.activeDocument === doc;
      put(entry.button, 'aria-pressed', String(open));
      markPart(entry.button, 'data-open', open);
      if (open || (!stop && i === 0)) stop = entry.button;
      return entry.button;
    });
    orderControls(this.part, wanted);
    for (const { button } of this.buttons.values()) put(button, 'tabindex', button === stop ? '0' : '-1');
  }

  dispose(): void {
    for (const entry of this.buttons.values()) entry.release();
    this.buttons.clear();
    removePart(this.part);
  }

  /** A tool's button, made the first time (and placed by `render`); its mark and label written in place when they change. */
  private entryOf(doc: TabDocument): Entry {
    const icon = doc.icon;
    const title = doc.title;
    let entry = this.buttons.get(doc);
    if (!entry) {
      const button = loose<HTMLButtonElement>('button', 'mx-tabdocs__phone-tool');
      put(button, 'type', 'button');
      const mark = part<HTMLSpanElement>(button, 'span', 'mx-tabdocs__phone-tool-icon');
      mark.attr.add({ 'aria-hidden': 'true' });
      const label = part<HTMLSpanElement>(button, 'span', 'mx-tabdocs__phone-tool-label');
      entry = { button, mark, label, release: () => {}, icon: undefined, title: '' };
      this.buttons.set(doc, entry);
    } else if (entry.icon === icon && entry.title === title) return entry;
    // The icon is shown again only when it is another one; without one, the mark is the title's first letter.
    if (entry.icon !== icon) {
      entry.release();
      entry.release = () => {};
      entry.mark.setText('');
      if (icon) entry.release = showIcon(icon, entry.mark);
    }
    if (!icon && (entry.icon !== icon || entry.title !== title)) entry.mark.setText(Array.from(title.trim())[0]?.toLocaleUpperCase(uiLocale.locale) ?? '');
    writeText(entry.label, title);
    entry.icon = icon;
    entry.title = title;
    return entry;
  }

  /** The tool whose button an event started on, `null` when none. */
  private documentAt(e: Event): TabDocument | null {
    for (const [doc, entry] of this.buttons) if (entry.button.motif.isEventFrom(e)) return doc;
    return null;
  }

  /** A tool's button: opens its area with it, or closes the area when it shows it already. */
  private toggle(doc: TabDocument | null): void {
    const area = doc?.group?.dockArea;
    if (!doc || !area) return;
    if (this.presenter.isToolOpen(area) && doc.group?.activeDocument === doc) this.presenter.hideTool(area);
    else this.presenter.showTool(doc);
    this.render();
  }

  private key(e: KeyboardEvent): void {
    // The buttons in their order on the bar.
    const buttons = this.part.controls.items;
    const at = buttons.findIndex((button) => button.motif.isEventFrom(e));
    if (at < 0 || e.ctrlKey || e.altKey || e.metaKey) return;
    const rtl = isRtl(this.part);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') next = (at + ((e.key === 'ArrowRight') !== rtl ? 1 : -1) + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    if (next < 0) return;
    e.preventDefault();
    for (const button of buttons) put(button, 'tabindex', button === buttons[next] ? '0' : '-1');
    focusOn(buttons[next]);
  }
}
