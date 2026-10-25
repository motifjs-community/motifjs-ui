import { reactive } from '@motifx/core';
import { Button, Calendar, Stack, type CalendarView } from '@motifx-community/ui';

const views: CalendarView[] = ['month', 'year', 'decade'];

/** The view set from state, and a calendar whose choice is a month. */
export default function Views() {
  const s = reactive({ view: 'month' as CalendarView, month: null as Date | null });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="View">
        {views.map((view) => (
          <Button key={view} text={view} size="sm" variant={() => (s.view === view ? 'solid' : 'ghost')} aria-pressed={() => s.view === view} onclick={() => (s.view = view)} />
        ))}
      </Stack>
      <Calendar currentView={() => s.view} />
      <Calendar minView="year" x-model={() => s.month} />
      <output>{() => (s.month ? s.month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—')}</output>
    </>
  );
}
