import type { WindowBox } from '../../parts/window/window-box';

/** What a resize starts from, read once at the press or the key: the box, the room its area leaves, and how it is laid out. */
export interface ResizeStart {
    box: WindowBox;
    room: { w: number; h: number };
    positioned: boolean;
    rtl: boolean;
}
