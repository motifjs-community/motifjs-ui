import type { SchedulerBlockedTime } from './scheduler-blocked-time';

/**
 * The input of `allowOverlap` when it is a function: an appointment would be at this time with
 * these resources. Return `true` if that is allowed.
 */
export interface SchedulerTimeCheck<T = unknown> {
  appointment: T;
  start: Date;
  end: Date;
  allDay: boolean;
  /** The values of its resource fields at that position (`{ roomId: 2, ownerIds: [1, 3] }`). */
  resources: Record<string, unknown>;
  /** The appointments it would overlap in its groups, or any appointment without groups. */
  overlapping: T[];
  /** The blocked times it would touch. */
  blocked: SchedulerBlockedTime[];
  /** Indicates that part of it is outside the work hours of its resources, or of the scheduler. */
  offHours: boolean;
}
