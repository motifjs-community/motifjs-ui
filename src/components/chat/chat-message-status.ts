/** A message being written (`streaming`), complete (`done`), stopped before its end, or ended by an error. */
export type ChatMessageStatus = 'streaming' | 'done' | 'stopped' | 'error';
