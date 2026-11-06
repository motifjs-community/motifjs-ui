import type { Bind } from "@motifx/core";
import type { FieldProps } from "../../parts/field/field-props";
import type { SignatureStroke } from "./signature-stroke";
import type { SignatureStrokeEventArgs } from "./signature-stroke-event-args";

/**
 * Props of `Signature`, in addition to the field props (label, help text, rules, `x-model`). Each prop is also a
 * settable property, and a function is tracked.
 */
export interface SignatureProps extends FieldProps<readonly SignatureStroke[]> {
    /** The height of the pad in pixels. By default, it comes from the design language. */
    height?: Bind<number | null>;
    /** The color of the lines. By default, it comes from the design language. */
    penColor?: Bind<string | null>;
    /** The width of a line at its thinnest, in pixels. The default is `1`. */
    minWidth?: Bind<number>;
    /** The width of a line at its thickest, in pixels. The default is `3`. */
    maxWidth?: Bind<number>;
    /** The text of the empty pad. By default, it is a kit string, and `''` removes it. */
    placeholder?: Bind<string>;
    /** Draws the line to sign on. The default is `true`. */
    showGuide?: Bind<boolean>;
    /** Shows the button that removes the signature. The default is `true`. */
    showClear?: Bind<boolean>;
    /** Shows the button that removes the last stroke. The default is `true`. */
    showUndo?: Bind<boolean>;
    /** Occurs when the pen touches the pad. */
    onStrokeBegan?: (e: SignatureStrokeEventArgs) => void;
    /** Occurs when the pen leaves the pad, after the value has changed. */
    onStrokeEnded?: (e: SignatureStrokeEventArgs) => void;
}
