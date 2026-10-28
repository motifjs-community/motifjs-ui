import { read } from '@motifx/core';
import type { SchedulerResource } from '../scheduler-resource';
import { sameValue } from './same-value';

/** An item's own work time; what it leaves out is the scheduler's. */
export interface OwnWork {
  start?: number;
  end?: number;
  days?: readonly number[];
}

/** A resource kind with its settings decided: its items and how to read them. Every read is followed. */
export class ResourceKind<R = unknown> {
  constructor(
    readonly def: SchedulerResource<R>,
    private readonly rows: () => readonly R[],
  ) {}

  get field(): string {
    return this.def.field;
  }
  get label(): string {
    return (this.def.label === undefined ? '' : read(this.def.label)) || this.def.field;
  }
  get multiple(): boolean {
    return !!read(this.def.allowMultiple);
  }
  get useColorAsDefault(): boolean {
    return !!read(this.def.useColorAsDefault);
  }
  get items(): readonly R[] {
    return this.rows();
  }

  valueOf(item: R): unknown {
    return field(item, this.def.valueExpr ?? 'id');
  }
  textOf(item: R): string {
    const text = field(item, this.def.displayExpr ?? 'text');
    return text === undefined || text === null ? String(this.valueOf(item) ?? '') : String(text);
  }
  colorOf(item: R | undefined): string {
    const color = item === undefined ? undefined : field(item, this.def.colorExpr ?? 'color');
    return typeof color === 'string' ? color : '';
  }
  /** The value of its item of the kind above it, when the kind says where (`parentExpr`). */
  parentOf(item: R): unknown {
    return this.def.parentExpr ? field(item, this.def.parentExpr) : undefined;
  }
  workOf(item: R | undefined): OwnWork {
    if (item === undefined) return {};
    const start = field(item, this.def.workStartHourExpr ?? 'workStartHour');
    const end = field(item, this.def.workEndHourExpr ?? 'workEndHour');
    const days = field(item, this.def.workDaysExpr ?? 'workDays');
    return {
      start: typeof start === 'number' ? start : undefined,
      end: typeof end === 'number' ? end : undefined,
      days: Array.isArray(days) ? (days as number[]) : undefined,
    };
  }
  /** The item with this value. */
  find(value: unknown): R | undefined {
    return this.items.find((item) => sameValue(this.valueOf(item), value));
  }
}

function field<R>(item: R, name: string): unknown {
  return (item as Record<string, unknown> | null)?.[name];
}
