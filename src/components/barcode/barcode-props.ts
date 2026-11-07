import type { Bind } from "@motifx/core";
import type { ControlProps } from "../../core/control";
import type { BarcodeFormat } from "../../parts/code/barcode-encode";
import type { BarcodeFailedEventArgs } from "./barcode-failed-event-args";

/** Props of `Barcode`. Each prop is also a settable property, and a function is tracked. */
export interface BarcodeProps extends ControlProps {
    /** The value of the code. */
    value?: Bind<string>;
    /** The default is `'code128'`. */
    format?: Bind<BarcodeFormat>;
    /** Adds the optional check character of Code 39. The default is `false`. */
    checkDigit?: Bind<boolean>;
    /** The width of the thinnest bar in pixels. The default is `2`. */
    moduleWidth?: Bind<number>;
    /** The height of the bars in pixels. By default, it comes from the design language. */
    height?: Bind<number | null>;
    /** The quiet zone at each side, in modules. Readers need it. The default is `10`. */
    margin?: Bind<number>;
    /** Shows the text under the bars. The default is `true`. */
    showText?: Bind<boolean>;
    /** The accessible name. By default, it is a kit string with the value. */
    label?: Bind<string>;
    /** Occurs when the format cannot hold the value. */
    onEncodeFailed?: (e: BarcodeFailedEventArgs) => void;
}
