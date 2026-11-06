import { reactive } from '@motifx/core';
import { FileUploader, Stack } from '@motifx-community/ui';

// Simulates a server: takes two seconds per megabyte, reports progress and stops on the signal.
const send = (file: File, report: (fraction: number) => void, signal: AbortSignal) =>
    new Promise<string>((resolve, reject) => {
        const steps = 20;
        const wait = Math.max(600, Math.min(4000, (file.size / 1_000_000) * 2000)) / steps;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            report(step / steps);
            if (step === steps) {
                clearInterval(timer);
                resolve(`id-${file.name}`);
            }
        }, wait);
        signal.addEventListener('abort', () => {
            clearInterval(timer);
            reject(new Error('stopped'));
        });
    });

/** Selected or dropped files upload immediately through a custom function, and each row shows progress, cancel, retry and remove. */
export default function Basic() {
    const s = reactive({ files: [] as readonly File[], told: '' });
    return (
        <Stack gap="md" style="inline-size: 100%">
            <FileUploader
                label="Attachments"
                helpText="Any files; a stand-in server takes them."
                upload={send}
                x-model={() => s.files}
                onUploaded={e => (s.told = `${e.file.name} is up as ${String(e.item.response)}.`)}
                onUploadAborted={e => (s.told = `${e.file.name} was stopped.`)}
            />
            <output class="fu-told">{() => s.told || `${s.files.length} file(s) taken`}</output>
        </Stack>
    );
}
