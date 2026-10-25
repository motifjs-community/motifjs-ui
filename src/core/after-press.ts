let down = false;
let installed = false;
let waiting: (() => void)[] = [];

function install(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('pointerdown', () => (down = true), true);
  const release = () => {
    if (!down) return;
    down = false;
    // After the click of this press has run.
    setTimeout(() => {
      for (const run of waiting.splice(0)) run();
    });
  };
  document.addEventListener('pointerup', release, true);
  document.addEventListener('pointercancel', release, true);
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
