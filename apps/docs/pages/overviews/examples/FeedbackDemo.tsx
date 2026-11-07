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
