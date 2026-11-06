import type { Signature } from "./Signature";
import type { SignatureStroke } from "./signature-stroke";

/** Data of `Signature.onStrokeBegan` and `onStrokeEnded`. */
export interface SignatureStrokeEventArgs {
    /** The stroke so far. */
    stroke: SignatureStroke;
    originalEvent: PointerEvent;
    source: Signature;
}
