import type { Scheduler } from './Scheduler';
import type { SchedulerPresentationKind } from './scheduler-presentation-kind';

export interface SchedulerPresentationChangedEventArgs<T = unknown> {
  from: SchedulerPresentationKind;
  to: SchedulerPresentationKind;
  width: number;
  source: Scheduler<T>;
}
