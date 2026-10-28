import type { AgendaPiece } from './agenda-piece';
import type { LinePiece } from './line-piece';
import type { StripPiece } from './strip-piece';
import type { TimedPiece } from './timed-piece';

/** Any part of an appointment a view shows. */
export type AnyPiece<T> = TimedPiece<T> | StripPiece<T> | LinePiece<T> | AgendaPiece<T>;
