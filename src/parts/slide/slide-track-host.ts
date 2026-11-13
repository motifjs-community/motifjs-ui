import type { ComponentBase } from "@motifx/core";

/** What a slide track asks of the component it moves: the panes, the one in view, and where a swipe lands. */
export interface SlideTrackHost {
    /** How many panes stand in the track. */
    count(): number;
    /** The pane in view; with several side by side, the first of them. */
    index(): number;
    /** Panes side by side in the viewport. */
    perView(): number;
    /** After the last pane comes the first. */
    loop(): boolean;
    /** The component of the pane at `index`. */
    panePart(index: number): ComponentBase | null;
    /** A finger or a pointer may drag the track now. */
    canDrag(): boolean;
    /** A swipe asks for a pane: the host selects it, or not, and the track is laid out again either way. */
    swipeTo(to: number): void;
    /** A drag began (`true`) or ended. */
    dragged(on: boolean): void;
}
