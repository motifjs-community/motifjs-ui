import { Component, reactive } from '@motifx/core';
import { addShortcut } from '@motifx-community/ui';

/** An app-wide shortcut, Mod+K, registered for as long as this component lives. */
export default class Shortcut extends Component {
  private readonly s = reactive({ palette: 0 });

  override onConfigured(): void {
    this.motif.setDisposable(addShortcut('Mod+K', () => void this.s.palette++));
  }

  override view() {
    return (
      <span>
        This page registers <kbd>Mod+K</kbd> (Ctrl+K, Cmd+K on a Mac). Pressed <output class="palette">{() => this.s.palette}</output> times.
      </span>
    );
  }
}
