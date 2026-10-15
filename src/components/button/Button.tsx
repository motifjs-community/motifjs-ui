import { Control, type ControlProps } from '../../core/control';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { applyButtonLook, type ButtonLookProps } from '../../internal/button-look';

export type { ButtonSize, ButtonTone, ButtonVariant } from '../../internal/button-look';

/** Props of {@link Button}: the shared {@link ControlProps} plus the look. */
export interface ButtonProps extends ControlProps, ButtonLookProps {
  /** The native button type. Default `'button'`, so a button inside a form never submits by accident. */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * A `<button>` drawn entirely from design tokens. Its caption
 * is `text` (settable from code) or its JSX children; `&` in `text` marks the
 * access key (`&Save` → Alt+S clicks it, `&&` is a literal ampersand). Variants, sizes and
 * tones land in the DOM as `data-variant` / `data-size` / `data-tone`;
 * `enabled = false` adds the native `disabled` and `data-disabled`.
 *
 * @example
 * <Button tone="accent" onclick={() => save()}>Save</Button>
 * <Button variant="outline" size="sm" enabled={() => !state.busy}>Cancel</Button>
 *
 * const retry = new Button({ text: 'Retry', tone: 'accent' });
 * panel.controls.add(retry);
 * retry.text = 'Retry (2)';
 */
export class Button extends Control<HTMLButtonElement, ButtonProps> {
  static override elementTag = 'button';

  /**
   * The `text` caption after the children, created the first time there is a
   * text: a bare text node, or a span when the text has an access key. Not a
   * component, so a captioned button costs no more than one with a JSX text child.
   */
  private caption: Text | HTMLSpanElement | null = null;

  override onConfigured(): void {
    applyButtonLook(this, this.props);
    this.attr.add({ type: this.props.type ?? 'button' });
    this.observeProperty<string>('text', (text) => this.renderText(text));
  }

  /** The access key focuses and clicks the button, as HTML `accesskey` does. */
  override onAccessKey(): boolean {
    if (!this.focus()) return false;
    this.element.click();
    return true;
  }

  private renderText(text: string): void {
    const parsed = parseAccessKey(text);
    this.setAccessKey(parsed.key);
    if (parsed.index >= 0) {
      const span = this.caption instanceof HTMLSpanElement ? this.caption : this.placeCaption(document.createElement('span'));
      renderAccessKey(span, parsed);
    } else if (this.caption instanceof Text) {
      this.caption.data = parsed.text;
    } else if (parsed.text || this.caption) {
      this.placeCaption(document.createTextNode(parsed.text));
    }
  }

  private placeCaption<T extends Text | HTMLSpanElement>(node: T): T {
    if (this.caption) this.caption.replaceWith(node);
    else this.element.append(node);
    this.caption = node;
    return node;
  }
}
