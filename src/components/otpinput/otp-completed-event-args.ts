import type { OtpInput } from "./OtpInput";

/** Data of `OtpInput.onCompleted`. */
export interface OtpCompletedEventArgs {
    /** The whole code. */
    value: string;
    source: OtpInput;
    originalEvent: Event;
}
