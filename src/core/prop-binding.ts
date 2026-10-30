import { effect, untracked } from '@motifx/core';

/**
 * Follows a prop given as a function and hands each value to the control. It is one of the component's bindings
 * (`bindings.add(binding)`), so `reState()` reads it again: plain data works as well as reactive data.
 *
 * A value is handed over only when it is not the one read last time, as a prop is applied again only when it
 * changed: a `reState()` that finds the same value leaves what the user did since (a day moved to, a text typed).
 */
export class PropBinding {
  dataSource: () => unknown;
  private stop: (() => void) | null = null;
  private released = false;
  private handed = false;
  private last: unknown;

  constructor(
    public propertyName: string,
    read: () => unknown,
    private readonly write: (value: unknown) => void,
  ) {
    this.dataSource = read;
  }

  activate(): void {
    if (this.stop || this.released) return;
    const read = this.dataSource;
    this.stop = effect(() => {
      const value = read();
      untracked(() => this.take(value));
    });
  }

  /** Reads it once, untracked: for the value before the component is built and its bindings start. */
  prime(): void {
    if (!this.released) untracked(() => this.take(this.dataSource()));
  }

  deactivate(): void {
    this.stop?.();
    this.stop = null;
  }

  reActivate(): void {
    this.deactivate();
    this.activate();
  }

  /** Stops it for good: `reState()` runs a copy of the bindings, so one removed during it is still reached. */
  release(): void {
    this.released = true;
    this.deactivate();
  }

  private take(value: unknown): void {
    if (this.handed && Object.is(value, this.last)) return;
    this.handed = true;
    this.last = value;
    this.write(value);
  }
}
