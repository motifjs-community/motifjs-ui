import { eachDocument } from './page-documents';

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
    doc.addEventListener('pointerdown', press, true);
    doc.addEventListener('pointerup', release, true);
    doc.addEventListener('pointercancel', release, true);
    return () => {
      doc.removeEventListener('pointerdown', press, true);
      doc.removeEventListener('pointerup', release, true);
      doc.removeEventListener('pointercancel', release, true);
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
