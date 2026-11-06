/**
 * Where a child of a `DockPanel` goes: against an edge (`start` and `end` follow the reading
 * direction), in the remaining space (`fill`), or over the rest at its own `left`, `top`, `right`
 * and `bottom` (`float`).
 */
export type Dock = 'top' | 'bottom' | 'start' | 'end' | 'fill' | 'float';
