import type { Bind } from '@motifx/core';
import { messageBox } from './message-box';
import type { MessageBoxOptions } from './message-box-options';

/**
 * Asks a question with OK and Cancel; resolves `true` for OK (or Yes). The other options of
 * `messageBox` can be given too: `title`, `tone`, other `buttons`.
 *
 * @example
 * if (await confirm('Delete the file?', { tone: 'danger' })) this.remove();
 */
export async function confirm(text: Bind<string>, options: Omit<MessageBoxOptions, 'text'> = {}): Promise<boolean> {
  const result = await messageBox({ buttons: ['ok', 'cancel'], ...options, text });
  return result === 'ok' || result === 'yes';
}
