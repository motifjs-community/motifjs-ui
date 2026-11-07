import type { Bind } from "@motifx/core";
import type { ControlProps } from "../../core/control";
import type { QrLevel } from "../../parts/code/qr-encode";
import type { QRCodeFailedEventArgs } from "./qr-code-failed-event-args";

/** Props of `QRCode`. Each prop is also a settable property, and a function is tracked. */
export interface QRCodeProps extends ControlProps {
    /** The text of the code. */
    value?: Bind<string>;
    /** How much of the code can be damaged: `'L'`, `'M'`, `'Q'` or `'H'`. The default is `'M'`. */
    level?: Bind<QrLevel>;
    /** The width and height in pixels. By default, it comes from the design language. */
    size?: Bind<number | null>;
    /** The quiet zone around the code, in modules. Readers need at least `4`, which is the default. */
    margin?: Bind<number>;
    /** The address of an image in the middle of the code. Use level `'H'` with it. */
    logo?: Bind<string | null>;
    /** The share of the code the logo covers, at most `0.3`. The default is `0.2`. */
    logoSize?: Bind<number>;
    /** The accessible name. By default, it is a kit string with the text of the code. */
    label?: Bind<string>;
    /** Occurs when the text does not fit in a code. */
    onEncodeFailed?: (e: QRCodeFailedEventArgs) => void;
}
