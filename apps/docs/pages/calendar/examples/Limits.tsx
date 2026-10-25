import { Calendar } from '@motifx-community/ui';

/** No day before today and no Sunday, in Turkish. */
export default function Limits() {
  return <Calendar min={new Date()} disabledDates={(d: Date) => d.getDay() === 0} locale="tr-TR" />;
}
