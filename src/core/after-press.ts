import { eachDocument } from './page-documents';
import { onDocument } from './window-events';

let down = false;
let installed = false;
let waiting: (() => void)[] = [];

function install(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  const press = () => (down = true);
  const release = () => {
    if (!down) return;
    down = false;
    // After the click of this press has run.
    setTimeout(() => {
      for (const run of waiting.splice(0)) run();
    });
  };
  eachDocument((doc) => {
    const stops = [onDocument(doc, 'pointerdown', press, true), onDocument(doc, 'pointerup', release, true), onDocument(doc, 'pointercancel', release, true)];
    return () => {
      for (const stop of stops) stop();
    };
  });
}

/**
 * Runs `work` now, or after the press in progress has ended and its click has run: something that
 * moves the layout (an error line appearing) must not move a button away from under the pointer.
 */
export function afterPress(work: () => void): void {
  install();
  if (down) waiting.push(work);
  else work();
}
