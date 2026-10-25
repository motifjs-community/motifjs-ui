let count = 0;

export function nextId(prefix: string): string {
  return `mx-${prefix}-${++count}`;
}
