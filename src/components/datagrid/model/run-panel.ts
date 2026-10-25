/** The panel over the rows while an action works on several rows: what it says, how far it got, Stop. */
export interface RunPanel {
  /** Shows the panel; whether it shows (another job may hold it). */
  open(text: string, stop: () => void): boolean;
  progress(done: number, total: number): void;
  close(): void;
}
