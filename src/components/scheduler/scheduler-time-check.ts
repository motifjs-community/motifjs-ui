import type { SchedulerBlockedTime } from './scheduler-blocked-time';

/**
 * What `allowOverlap`, given as a function, decides on: an appointment would be at this time with
 * these resources. Return `true` when it may.
 */
export interface SchedulerTimeCheck<T = unknown> {
  appointment: T;
  start: Date;
  end: Date;
  allDay: boolean;
  /** The values of its resource fields there (`{ roomId: 2, ownerIds: [1, 3] }`). */
  resources: Record<string, unknown>;
  /** The appointments it would overlap in its groups (every one, without groups). */
  overlapping: T[];
  /** The blocked times it would touch. */
  blocked: SchedulerBlockedTime[];
  /** Part of it is outside the work hours (of its resources, else the scheduler's). */
  offHours: boolean;
}
