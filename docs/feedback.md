# Feedback

> Feedback · @motifx-community/ui 0.1.0-beta.5

Feedback components tell the reader what is happening: how far a task has come, that something is loading, what a control does, and what has just happened.

## Syncing a folder

Sync now shows a spinner while it connects and a bar while it copies, then a toast; Stop leaves a toast with a way to go on. Refresh covers the list with a load panel, Remove undoes from its toast, the button has a tooltip and the info button opens a popover.

```tsx
import { reactive } from '@motifx/core';
import { Button, LoadPanel, Panel, Popover, ProgressBar, Spinner, Tooltip, toast } from '@motifx-community/ui';

const FILES = ['report.pdf', 'budget.xlsx', 'logo.svg', 'notes.md', 'photos.zip', 'plan.docx'];

/** Syncing files: a spinner while it connects, a bar while it copies, a panel that blocks the list while it refreshes, a tooltip, a popover and toasts. */
export default function FeedbackDemo() {
    const s = reactive({ state: 'idle' as 'idle' | 'connecting' | 'copying' | 'done', copied: 0, refreshing: false, details: false, files: [...FILES] });
    let sync!: Button;
    let info!: Button;
    let list!: Panel;
    let timer = 0;

    const start = () => {
        s.state = 'connecting';
        s.copied = 0;
        timer = window.setTimeout(() => {
            s.state = 'copying';
            timer = window.setInterval(() => {
                s.copied++;
                if (s.copied < FILES.length) return;
                clearInterval(timer);
                s.state = 'done';
                toast.success(`${FILES.length} files are up to date.`, { title: 'Synced' });
            }, 450);
        }, 900);
    };
    const stop = () => {
        clearTimeout(timer);
        clearInterval(timer);
        s.state = 'idle';
        toast.caution('Syncing stopped. Files copied so far are kept.', { action: { text: 'Go on', click: start } });
    };
    const refresh = () => {
        s.refreshing = true;
        setTimeout(() => (s.refreshing = false), 1500);
    };
    const remove = () => {
        const file = s.files.pop();
        if (file) toast.info(`${file} removed.`, { action: { text: 'Undo', click: () => s.files.push(file) } });
    };

    return (
        <div class="ov-frame ov-feedback" onDisposing={() => (clearTimeout(timer), clearInterval(timer))}>
            <div class="ov-bar">
                <h3 class="ov-title" style="flex: 1 1 auto">Shared folder</h3>
                <Button ref={(b: Button) => (info = b)} icon={() => <span class="mx-glyph" data-icon="info" />} variant="ghost" aria-label="About syncing" />
                <Button ref={(b: Button) => (sync = b)} text={() => (s.state === 'connecting' || s.state === 'copying' ? 'Stop' : 'Sync now')} tone="accent" onclick={() => (s.state === 'connecting' || s.state === 'copying' ? stop() : start())} />
            </div>
            <Tooltip target={() => sync} text="Copies the changed files to the shared folder." />
            <Popover target={() => info} title="About syncing" showClose x-model={() => s.details}>
                Files you change on this computer are copied to the shared folder. A file changed in both places keeps both copies.
            </Popover>
            <div class="ov-sync">
                {s.state === 'connecting' ? (
                    <Spinner label="Connecting to the server" labelPosition="side" />
                ) : (
                    <ProgressBar
                        class="ov-sync-bar"
                        label={() => (s.state === 'done' ? 'Up to date' : s.state === 'copying' ? 'Copying files' : 'Not synced yet')}
                        value={() => s.copied}
                        max={FILES.length}
                        showValue
                        stretch
                        tone={() => (s.state === 'done' ? 'success' : 'accent')}
                    />
                )}
            </div>
            <Panel ref={(p: Panel) => (list = p)} variant="outline" padding="md" class="ov-files">
                <ul class="ov-file-list">
                    {s.files.map(f => (
                        <li>{f}</li>
                    ))}
                </ul>
            </Panel>
            <LoadPanel target={() => list} message="Refreshing the list" x-model={() => s.refreshing} />
            <div class="ov-bar">
                <Button text="Refresh the list" variant="outline" onclick={refresh} />
                <Button text="Remove the last file" variant="outline" enabled={() => s.files.length > 0} onclick={remove} />
            </div>
        </div>
    );
}
```

## Components in this group

Each component has its own page with its examples and its full API.

| Component | For |
| --- | --- |
| `[ProgressBar and Spinner](progress.md)` | How far a task has come, or that it is under way. |
| `[Tooltip](tooltip.md)` | A short name or hint for a control, on hover or focus. |
| `[Popover](popover.md)` | More detail or a small form beside a control. |
| `[LoadPanel](loadpanel.md)` | A panel over a region or the page while it loads. |
| `[Toast](toast.md)` | A short message about what has just happened, with an action such as Undo. |

## Choosing a component

Several components can do the same job; this table points to the one that reads best for it.

| To | Use |
| --- | --- |
| `Show progress that can be measured` | [ProgressBar](progress.md) |
| `Show a short wait of unknown length` | [Spinner](progress.md) |
| `Keep a region from use while it loads` | [LoadPanel](loadpanel.md) |
| `Name or explain a control` | [Tooltip](tooltip.md) |
| `Show more beside a control, or ask for a little` | [Popover](popover.md) |
| `Report the result of an action` | [Toast](toast.md) |

## What they share

A delay keeps quick work from flashing a spinner or a panel; it shows only when the wait is long enough to notice.

Tones come from the design language: info, success, caution and danger, never by color alone but with an icon and words.

## Accessibility

| Topic | Details |
| --- | --- |
| `Announcements` | Progress is read as a value; info and success toasts are announced politely, caution and danger ones at once. |
| `Tooltips` | A tooltip shows on focus as well as on hover, and Escape hides it. |
| `Focus` | A popover takes focus when it opens and gives it back when it closes; a load panel keeps focus out of what it covers. |

## Feedback

Loading issues…
