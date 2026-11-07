import { niceStep } from './nice-ticks';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** A kind of time step: its length, what its ticks are rounded to, and how a tick reads. */
interface TimeUnit {
    size: number;
    steps: readonly number[];
    field: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
    format: Intl.DateTimeFormatOptions;
}

const UNITS: readonly TimeUnit[] = [
    { size: SECOND, steps: [1, 5, 15, 30], field: 'second', format: { hour: '2-digit', minute: '2-digit', second: '2-digit' } },
    { size: MINUTE, steps: [1, 5, 15, 30], field: 'minute', format: { hour: '2-digit', minute: '2-digit' } },
    { size: HOUR, steps: [1, 3, 6, 12], field: 'hour', format: { hour: '2-digit', minute: '2-digit' } },
    { size: DAY, steps: [1, 2, 7, 14], field: 'day', format: { month: 'short', day: 'numeric' } },
    { size: 30 * DAY, steps: [1, 3, 6], field: 'month', format: { month: 'short', year: '2-digit' } },
    { size: 365 * DAY, steps: [1], field: 'year', format: { year: 'numeric' } }
];

/** Ticks of a time axis and how they read. */
export interface TimeTicks {
    ticks: number[];
    format: Intl.DateTimeFormatOptions;
}

// The first moment of the step that holds `time`, in local time: days and months keep their length through a clock change.
function startOf(time: number, unit: TimeUnit, step: number): Date {
    const d = new Date(time);
    if (unit.field === 'year') return new Date(Math.floor(d.getFullYear() / step) * step, 0, 1);
    if (unit.field === 'month') return new Date(d.getFullYear(), Math.floor(d.getMonth() / step) * step, 1);
    if (unit.field === 'day') return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    d.setMilliseconds(0);
    if (unit.field === 'second') {
        d.setSeconds(Math.floor(d.getSeconds() / step) * step);
        return d;
    }
    d.setSeconds(0);
    if (unit.field === 'minute') {
        d.setMinutes(Math.floor(d.getMinutes() / step) * step);
        return d;
    }
    d.setMinutes(0);
    d.setHours(Math.floor(d.getHours() / step) * step);
    return d;
}

function nextOf(d: Date, unit: TimeUnit, step: number): Date {
    if (unit.field === 'year') return new Date(d.getFullYear() + step, 0, 1);
    if (unit.field === 'month') return new Date(d.getFullYear(), d.getMonth() + step, 1);
    if (unit.field === 'day') return new Date(d.getFullYear(), d.getMonth(), d.getDate() + step);
    return new Date(d.getTime() + step * unit.size);
}

/** About `count` ticks between `min` and `max`, on moments people read as round. */
export function timeTicks(min: number, max: number, count: number): TimeTicks {
    const span = Math.max(1, max - min);
    const wanted = span / Math.max(1, count);
    const last = UNITS[UNITS.length - 1];
    let unit = last;
    let step = Math.max(1, niceStep(span / last.size, count));
    search: for (const candidate of UNITS) {
        for (const size of candidate.steps) {
            if (candidate.size * size >= wanted) {
                unit = candidate;
                step = size;
                break search;
            }
        }
    }
    const ticks: number[] = [];
    let at = startOf(min, unit, step);
    if (at.getTime() < min) at = nextOf(at, unit, step);
    while (at.getTime() <= max && ticks.length < 500) {
        ticks.push(at.getTime());
        at = nextOf(at, unit, step);
    }
    return { ticks, format: unit.format };
}
