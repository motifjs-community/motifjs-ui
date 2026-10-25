import type { Component } from '@motifx/core';
import { parseAccessKey, renderAccessKey } from '../src/core/access-key';
import { FocusContainer } from '../src/core/container';
import { Control } from '../src/core/control';
import { windowStack } from '../src/core/window-stack';

/** A button on `Control` as a component builds one: `text` with an `&` access key that clicks it. */
export class TestButton extends Control<HTMLButtonElement> {
  static override elementTag = 'button';

  override onConfigured(): void {
    this.attr.add({ type: 'button' });
    this.observeProperty<string>('text', (text) => {
      const parsed = parseAccessKey(text);
      this.setAccessKey(parsed.key);
      renderAccessKey(this.element, parsed);
    });
  }

  override onAccessKey(): boolean {
    if (!this.focus()) return false;
    this.element.click();
    return true;
  }
}

/** A modal window as a component opens one: a `<dialog>` on the window stack, Tab kept inside. */
export class TestWindow extends FocusContainer<HTMLDialogElement> {
  static override elementTag = 'dialog';

  private readonly entry = { element: this.element, modal: true, setActive: () => {} };

  protected override get cyclesTab(): boolean {
    return true;
  }

  open(host: Component): void {
    host.controls.add(this);
    this.element.showModal();
    windowStack.bringToFront(this.entry);
  }

  /** Closes the window and disposes it, as a window does when the user closes it. */
  async close(): Promise<void> {
    windowStack.remove(this.entry);
    this.element.close();
    await this.dispose();
  }
}
