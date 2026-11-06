import { watchDocument } from '../../../core/document-watch';
import type { ColumnModel } from '../model/ColumnModel';
import type { StickyOffset } from '../model/sticky-offset';

const escapeAttr = (v: string) => v.replace(/["\\]/g, '\\$&');

/**
 * Per-column CSS of one grid: columns not shown, alignment and sticky offsets, written as rules keyed
 * by `data-field` (a pinned band's header by `data-band`, at the offset of its columns). Changing a width or pinning a column rewrites this sheet only; no cell gets a
 * binding of its own and no row is touched. A constructable stylesheet adopted by the document (or
 * shadow root) where there is one, which also works under a strict Content Security Policy; else a
 * `<style>` element inside the grid.
 */
export class ColumnStyles<T> {
  private css = '';
  /** The text the sheet holds: written again only when it changes, since writing a sheet has every element's style calculated again. */
  private written: string | null = null;
  private sheet: CSSStyleSheet | null = null;
  private root: Document | ShadowRoot | null = null;
  private styleEl: HTMLStyleElement | null = null;
  private stopWatch: (() => void) | null = null;

  constructor(
    private readonly columns: ColumnModel<T>,
    private readonly gridId: string,
  ) {}

  /** `placed`: every column's cells get their track by number, so a row may leave out the cells of columns not drawn (virtual columns). */
  update(visible: string[], offsets: Map<string, StickyOffset>, align: Map<string, string>, bands: readonly { id: string; first: number; count: number }[] = [], placed = false) {
    const scope = `[data-grid-id="${this.gridId}"]`;
    const rules: string[] = [];
    const shown = new Set(visible);
    const track = new Map(visible.map((f, i) => [f, i + 1]));
    for (const field of this.columns.state.order) {
      const sel = `${scope} .mx-data-grid__row > [data-field="${escapeAttr(field)}"]`;
      if (!shown.has(field)) {
        rules.push(`${sel}{display:none}`);
        continue;
      }
      if (placed) rules.push(`${sel}{grid-column:${track.get(field)};grid-row:1}`);
      const a = align.get(field);
      if (a && a !== 'start') {
        rules.push(`${sel}.mx-data-grid__cell{text-align:${a}}`);
        rules.push(`${sel} .mx-data-grid__title{text-align:${a}}`);
      }
      const sticky = offsets.get(field);
      if (sticky) {
        rules.push(`${sel}{position:sticky;inset-inline-${sticky.side}:${sticky.offset}px;z-index:var(--_z-sticky)}`);
        if (sticky.edge) rules.push(`${sel}{box-shadow:var(--_sticky-${sticky.side})}`);
      }
    }
    for (const band of bands) {
      const first = offsets.get(visible[band.first]);
      const last = offsets.get(visible[band.first + band.count - 1]);
      if (!first || !last) continue;
      const near = first.side === 'start' ? first : last;
      const edge = first.side === 'start' ? last.edge : first.edge;
      const sel = `${scope} .mx-data-grid__row > [data-band="${escapeAttr(band.id)}"]`;
      rules.push(`${sel}{position:sticky;inset-inline-${near.side}:${near.offset}px;z-index:var(--_z-sticky)}`);
      if (edge) rules.push(`${sel}{box-shadow:var(--_sticky-${near.side})}`);
    }
    // In the kit's layer, so a design language's stylesheet can change the look (the sticky edge) like any other rule.
    this.css = rules.length ? `@layer mx.components {\n${rules.join('\n')}\n}` : '';
    this.apply();
  }

  attach(host: HTMLElement) {
    const root = host.getRootNode() as Document | ShadowRoot;
    // A sheet is adopted only by documents of the window that made it.
    const Sheet = host.ownerDocument.defaultView?.CSSStyleSheet;
    const canAdopt = 'adoptedStyleSheets' in root && typeof Sheet === 'function' && typeof Sheet.prototype.replaceSync === 'function';
    if (canAdopt) {
      try {
        this.sheet = new Sheet();
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, this.sheet];
        this.root = root;
      } catch {
        this.sheet = null;
      }
    }
    if (!this.sheet) {
      this.styleEl = host.ownerDocument.createElement('style');
      host.appendChild(this.styleEl);
    }
    this.apply();
    // The grid moved into a window the app opened, or back: the sheet goes along.
    this.stopWatch?.();
    this.stopWatch = watchDocument(host, () => {
      this.drop();
      this.attach(host);
    });
  }

  detach() {
    this.stopWatch?.();
    this.stopWatch = null;
    this.drop();
  }

  private drop() {
    this.written = null;
    if (this.sheet && this.root) this.root.adoptedStyleSheets = this.root.adoptedStyleSheets.filter((s) => s !== this.sheet);
    this.styleEl?.remove();
    this.sheet = null;
    this.root = null;
    this.styleEl = null;
  }

  private apply() {
    if (this.css === this.written || (!this.sheet && !this.styleEl)) return;
    this.written = this.css;
    if (this.sheet) this.sheet.replaceSync(this.css);
    else if (this.styleEl) this.styleEl.textContent = this.css;
  }
}
