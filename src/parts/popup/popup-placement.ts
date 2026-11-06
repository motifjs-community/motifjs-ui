/**
 * Where a popup opens relative to its anchor: the side (`bottom`, `top`, or `start` / `end` across the
 * reading direction), then its alignment along that side (`-start`, centered, `-end`). Start and
 * end follow the reading direction. It opens on the other side when that has more room.
 */
export type PopupPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'start-start'
  | 'start'
  | 'start-end'
  | 'end-start'
  | 'end'
  | 'end-end';
