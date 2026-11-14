import type { ColumnType } from '../column-type';

/** A column of dates: calendar days (`date`), or days with a time (`datetime`). */
export function isDateType(type: ColumnType | undefined): type is 'date' | 'datetime' {
  return type === 'date' || type === 'datetime';
}
