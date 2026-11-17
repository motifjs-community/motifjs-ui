import type { ChatToolDensity, ChatToolLook, ChatToolStatus } from './chat-part';

/** What a tool call starts with, as `reply.tool()` takes it. */
export interface ChatToolInit {
  /** The tool's name as the model called it. */
  name: string;
  /** The provider's id of the call; by default one is made. */
  id?: string;
  /** The name a person reads; by default `name`. */
  label?: string;
  /** What the call does, in a line. */
  title?: string;
  /** What went in, when it is already known. */
  input?: string;
  look?: ChatToolLook;
  density?: ChatToolDensity;
  /** `assembling` while its arguments still arrive (then `start()`); by default `running`. */
  status?: ChatToolStatus;
}
