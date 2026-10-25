/**
 * Where a child of a `DockPanel` goes: against an edge (`start` / `end` follow the reading
 * direction), the space left over (`fill`), or placed by its own `left` / `top` / `right` /
 * `bottom` over the rest (`float`).
 */
export type Dock = 'top' | 'bottom' | 'start' | 'end' | 'fill' | 'float';
