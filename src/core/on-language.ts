import { untracked, type ComponentBase } from '@motifx/core';
import { uiLocale } from './ui-locale';

/**
 * Runs `draw` now, then again each time the kit's language changes (`uiLocale.onChanged`), while `component` lives:
 * how a control writes its texts and formats without following anything. Returns what stops it sooner.
 *
 * @example
 * onLanguage(this, () => button.setAttribute('aria-label', uiLocale.strings.close));
 */
export function onLanguage(component: ComponentBase, draw: () => void): () => void {
  untracked(draw);
  const changed = uiLocale.onChanged(() => {
    if (!component.isDisposed) untracked(draw);
  });
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    changed.dispose();
  };
  component.motif.setDisposable(stop);
  return stop;
}
