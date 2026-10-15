let seq = 0;

/** A document-unique id with a readable part name, e.g. `mx-form-title-7`, for aria wiring. */
export function nextId(part: string): string {
  return `mx-${part}-${++seq}`;
}
