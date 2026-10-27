import { untracked } from '@motifx/core';
import { iconNode } from '../../core/icon-node';
import { isElement } from '../../core/node-kind';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabPresenter } from './TabPresenter';

/**
 * The bar at the bottom of a phone: a button for each tool of the dock areas, which opens its area in
 * a bottom sheet (or a drawer) with that tool, and closes it again. The arrow keys go along it.
 */
export class PhoneTools {
  readonly element: HTMLDivElement;
  private readonly buttons = new Map<TabDocument, { button: HTMLButtonElement; release: () => void; icon: unknown; title: string }>();

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly presenter: TabPresenter,
  ) {
    const el = (this.element = manager.element.ownerDocument.createElement('div'));
    el.className = 'mx-tabdocs__phone-tools';
    el.setAttribute('role', 'toolbar');
    el.addEventListener('click', (e) => untracked(() => this.toggle(this.documentAt(e.target))));
    el.addEventListener('keydown', (e) => this.key(e));
    manager.element.append(el);
  }

  render(): void {
    const m = this.manager;
    const tools = m.dockAreas.filter((a) => this.presenter.dockMode(a) !== 'hidden').flatMap((a) => a.documents);
    this.element.hidden = !tools.length;
    this.element.setAttribute('aria-label', m.textOf('tabDocsPhoneTools'));
    for (const [doc, entry] of this.buttons) {
      if (tools.includes(doc)) continue;
      entry.release();
      entry.button.remove();
      this.buttons.delete(doc);
    }
    let stop: HTMLButtonElement | null = null;
    tools.forEach((doc, i) => {
      const entry = this.entryOf(doc);
      const area = doc.group?.dockArea;
      const open = !!area && this.presenter.isToolOpen(area) && doc.group?.activeDocument === doc;
      entry.button.setAttribute('aria-pressed', String(open));
      entry.button.toggleAttribute('data-open', open);
      if (open || (!stop && i === 0)) stop = entry.button;
      if (this.element.children[i] !== entry.button) this.element.insertBefore(entry.button, this.element.children[i] ?? null);
    });
    for (const { button } of this.buttons.values()) button.tabIndex = button === stop ? 0 : -1;
  }

  dispose(): void {
    for (const entry of this.buttons.values()) entry.release();
    this.buttons.clear();
    this.element.remove();
  }

  private entryOf(doc: TabDocument): { button: HTMLButtonElement; release: () => void; icon: unknown; title: string } {
    let entry = this.buttons.get(doc);
    const icon = doc.icon;
    const title = doc.title;
    if (entry && entry.icon === icon && entry.title === title) return entry;
    const owner = this.element.ownerDocument;
    const button = entry?.button ?? owner.createElement('button');
    entry?.release();
    button.type = 'button';
    button.className = 'mx-tabdocs__phone-tool';
    const mark = owner.createElement('span');
    mark.className = 'mx-tabdocs__phone-tool-icon';
    mark.setAttribute('aria-hidden', 'true');
    let release = () => {};
    if (icon) {
      const shown = iconNode(icon, owner);
      mark.append(shown.node);
      release = shown.release;
    } else {
      mark.textContent = Array.from(title.trim())[0]?.toLocaleUpperCase() ?? '';
    }
    const label = owner.createElement('span');
    label.className = 'mx-tabdocs__phone-tool-label';
    label.textContent = title;
    button.replaceChildren(mark, label);
    entry = { button, release, icon, title };
    this.buttons.set(doc, entry);
    return entry;
  }

  private documentAt(target: EventTarget | null): TabDocument | null {
    const button = isElement(target) ? target.closest('.mx-tabdocs__phone-tool') : null;
    for (const [doc, entry] of this.buttons) if (entry.button === button) return doc;
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
    const buttons = [...this.element.querySelectorAll<HTMLButtonElement>('.mx-tabdocs__phone-tool')];
    const at = buttons.indexOf(e.target as HTMLButtonElement);
    if (at < 0 || e.ctrlKey || e.altKey || e.metaKey) return;
    const rtl = this.element.ownerDocument.defaultView?.getComputedStyle(this.element).direction === 'rtl';
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') next = (at + ((e.key === 'ArrowRight') !== rtl ? 1 : -1) + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    if (next < 0) return;
    e.preventDefault();
    for (const button of buttons) button.tabIndex = -1;
    buttons[next].tabIndex = 0;
    buttons[next].focus();
  }
}
