import type { GridColumn } from '@motifx-community/ui';
import type { Task } from './task';

const TITLES = ['Write the release notes', 'Fix the login page', 'Review the pull request', 'Plan the sprint', 'Update the docs', 'Call the customer', 'Test on mobile', 'Clean up the backlog'];
const OWNERS = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger'];
const PRIORITIES = ['Low', 'Normal', 'High'];

/** `n` made-up tasks from id `from`, in their order. */
export function makeTasks(n: number, from = 1): Task[] {
  return Array.from({ length: n }, (_, i) => ({
    id: from + i,
    title: `${TITLES[(from + i) % TITLES.length]} #${from + i}`,
    owner: OWNERS[(from + i) % OWNERS.length],
    priority: PRIORITIES[(from + i) % PRIORITIES.length],
    order: i,
  }));
}

export const taskColumns: GridColumn<Task>[] = [
  { field: 'id', title: 'No', type: 'number', width: 70 },
  { field: 'title', title: 'Task', width: 240, flex: 1 },
  { field: 'owner', title: 'Owner', width: 110 },
  { field: 'priority', title: 'Priority', width: 100 },
];
