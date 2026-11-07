import type { QRCode } from "./QRCode";

/** Data of `QRCode.onEncodeFailed`. */
export interface QRCodeFailedEventArgs {
    /** The text that does not fit in a code. */
    value: string;
    source: QRCode;
}
