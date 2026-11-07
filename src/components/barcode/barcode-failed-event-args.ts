import type { BarcodeFormat } from "../../parts/code/barcode-encode";
import type { Barcode } from "./Barcode";

/** Data of `Barcode.onEncodeFailed`. */
export interface BarcodeFailedEventArgs {
    /** The value the format cannot hold. */
    value: string;
    format: BarcodeFormat;
    source: Barcode;
}
