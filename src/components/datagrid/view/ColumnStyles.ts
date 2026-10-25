import type { ColumnModel } from '../model/ColumnModel';
import type { StickyOffset } from '../model/sticky-offset';

const escapeAttr = (v: string) => v.replace(/["\\]/g, '\\$&');

/**
 * Per-column CSS of one grid: columns not shown, alignment and sticky offsets, written as rules keyed
 * by `data-field`. Changing a width or pinning a column rewrites this sheet only; no cell gets a
 * binding of its own and no row is touched. A constructable stylesheet adopted by the document (or
 * shadow root) where there is one, which also works under a strict Content Security Policy; else a
 * `<style>` element inside the grid.
 */
export class ColumnStyles<T> {
  private css = '';
  private sheet: CSSStyleSheet | null = null;
  private root: Document | ShadowRoot | null = null;
  private styleEl: HTMLStyleElement | null = null;

  constructor(
    private readonly columns: ColumnModel<T>,
    private readonly gridId: string,
  ) {}

  update(visible: string[], offsets: Map<string, StickyOffset>, align: Map<string, string>) {
    const scope = `[data-grid-id="${this.gridId}"]`;
    const rules: string[] = [];
    const shown = new Set(visible);
    for (const field of this.columns.state.order) {
      const sel = `${scope} [data-field="${escapeAttr(field)}"]`;
      if (!shown.has(field)) {
        rules.push(`${sel}{display:none}`);
        continue;
      }
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
    this.css = rules.join('\n');
    this.apply();
  }

  attach(host: HTMLElement) {
    const root = host.getRootNode() as Document | ShadowRoot;
    const canAdopt = 'adoptedStyleSheets' in root && typeof CSSStyleSheet === 'function' && typeof CSSStyleSheet.prototype.replaceSync === 'function';
    if (canAdopt) {
      try {
        this.sheet = new CSSStyleSheet();
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, this.sheet];
        this.root = root;
      } catch {
        this.sheet = null;
      }
    }
    if (!this.sheet) {
      this.styleEl = document.createElement('style');
      host.appendChild(this.styleEl);
    }
    this.apply();
  }

  detach() {
    if (this.sheet && this.root) this.root.adoptedStyleSheets = this.root.adoptedStyleSheets.filter((s) => s !== this.sheet);
    this.styleEl?.remove();
    this.sheet = null;
    this.root = null;
    this.styleEl = null;
  }

  private apply() {
    if (this.sheet) this.sheet.replaceSync(this.css);
    else if (this.styleEl) this.styleEl.textContent = this.css;
  }
}
