import type { Bind } from "@motifx/core";
import type { FieldProps } from "../../parts/field/field-props";
import type { OtpCharset } from "./otp-charset";
import type { OtpCompletedEventArgs } from "./otp-completed-event-args";

/**
 * Props of `OtpInput`, in addition to the field props (label, help text, rules, `x-model`). Each prop is also a
 * settable property, and a function is tracked.
 */
export interface OtpInputProps extends FieldProps<string> {
    /** The number of characters. The default is `6`. */
    length?: Bind<number>;
    /** Which characters are accepted. The default is `'digits'`. */
    charset?: Bind<OtpCharset>;
    /** Accepts the characters this matches instead of `charset`. It is tested on one character at a time. */
    pattern?: Bind<RegExp | null>;
    /** Turns letters into capitals as they are typed. The default is `false`. */
    uppercase?: Bind<boolean>;
    /** Draws a mark in place of each character. The default is `false`. */
    masked?: Bind<boolean>;
    /** The mark of `masked`. The default is `'•'`. */
    maskCharacter?: Bind<string>;
    /** Shown in a box that is still empty. */
    placeholder?: Bind<string>;
    /** Puts a separator after every so many boxes, such as `3` for `123-456`. By default, there is none. */
    groupSize?: Bind<number | null>;
    /** The text of that separator. The default is `'–'`. */
    separator?: Bind<string>;
    /** The `autocomplete` of the input. The default is `'one-time-code'`, which lets a phone offer the code from a message. */
    autoComplete?: Bind<string>;
    /** Occurs when the user has entered every character, by typing, pasting or from the phone. */
    onCompleted?: (e: OtpCompletedEventArgs) => void;
}
