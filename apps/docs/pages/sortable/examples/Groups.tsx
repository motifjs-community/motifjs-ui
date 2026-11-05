import { reactive } from '@motifx/core';
import { Panel, Sortable, Stack } from '@motifx-community/ui';

interface Task {
    id: number;
    title: string;
}

// A task as a row.
const row = (task: Task) => {
    const panel = new Panel({ variant: 'outline', padding: 'sm' });
    panel.element.textContent = task.title;
    return panel;
};

/** Two lists of one group take each other's items; each list draws its own data and the app moves the task between arrays when told. */
export default function Groups() {
    const s = reactive({
        todo: [{ id: 1, title: 'Write the brief' }, { id: 2, title: 'Book the room' }, { id: 3, title: 'Send the invites' }] as Task[],
        done: [{ id: 4, title: 'Pick the date' }] as Task[]
    });
    const reorder = (key: 'todo' | 'done') => (e: { fromIndex: number; toIndex: number }) => {
        const next = s[key].slice();
        next.splice(e.toIndex, 0, ...next.splice(e.fromIndex, 1));
        s[key] = next;
    };
    // The item leaves one array when removed and joins the other when added: the lists draw themselves again.
    const remove = (key: 'todo' | 'done') => (e: { fromIndex: number }) => (s[key] = s[key].filter((_, i) => i !== e.fromIndex));
    const add = (key: 'todo' | 'done') => (e: { item: Task; toIndex: number }) => {
        const next = s[key].slice();
        next.splice(e.toIndex, 0, e.item);
        s[key] = next;
    };
    return (
        <Stack orientation="horizontal" gap="lg" style="inline-size: 100%">
            <Stack gap="sm" grow>
                <strong>To do</strong>
                <Sortable<Task> label="To do" class="so-todo" group="tasks" items={() => s.todo} itemTemplate={row} onReorder={reorder('todo')} onRemove={remove('todo')} onAdd={add('todo')} style="min-block-size: 8rem" />
            </Stack>
            <Stack gap="sm" grow>
                <strong>Done</strong>
                <Sortable<Task> label="Done" class="so-done" group="tasks" items={() => s.done} itemTemplate={row} onReorder={reorder('done')} onRemove={remove('done')} onAdd={add('done')} style="min-block-size: 8rem" />
            </Stack>
        </Stack>
    );
}
