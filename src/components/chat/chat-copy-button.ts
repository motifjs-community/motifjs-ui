import { writeClipboard } from '../../core/clipboard';
import { glyph } from '../../core/glyphs';
import { put } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';

/** How long the button says the text was copied, in milliseconds. */
const COPIED_FOR = 1500;

/** A button that copies a text, its icon alone: named "Copy", then "Copied" for a moment. */
export class ChatCopyButton {
  readonly button: Button;
  private copied = false;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly read: () => string) {
    // Its variant and size come from its place.
    this.button = new Button({ icon: glyph('copy') });
    this.button.class.add('mx-chat__action');
    this.button.motif.on('click', () => this.copy());
    this.button.motif.setDisposable(() => clearTimeout(this.timer));
    this.drawTexts();
  }

  drawTexts(): void {
    const said = this.copied ? uiLocale.strings.chatCopied : uiLocale.strings.chatCopy;
    put(this.button, 'aria-label', said);
    this.button.hint = said;
  }

  private copy(): void {
    writeClipboard(this.button, { text: this.read() });
    this.copied = true;
    this.drawTexts();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.copied = false;
      if (!this.button.isDisposed) this.drawTexts();
    }, COPIED_FOR);
  }
}
