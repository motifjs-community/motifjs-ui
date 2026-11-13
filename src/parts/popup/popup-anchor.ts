import type { ComponentBase } from '@motifx/core';
import type { Point } from '../../core/measure';

/** What a popup stands next to: a component, a point of the viewport, or a function giving one (read with the frame's reads, so a point can follow a part). */
export type PopupAnchor = ComponentBase | Point | (() => Point | null);
