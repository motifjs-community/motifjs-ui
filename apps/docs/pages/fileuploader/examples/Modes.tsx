import { reactive } from '@motifx/core';
import { Button, FileUploader, Stack } from '@motifx-community/ui';

const quick = (file: File, report: (fraction: number) => void) =>
    new Promise<void>(resolve => {
        let step = 0;
        const timer = setInterval(() => {
            report(++step / 10);
            if (step === 10) {
                clearInterval(timer);
                resolve();
            }
        }, 120);
    });

/** An Upload button sends what was chosen; or nothing goes until code says so. One file only, no dropping. */
export default function Modes() {
    const s = reactive({ one: [] as readonly File[] });
    let manual!: FileUploader;
    return (
        <Stack gap="md" style="inline-size: 100%">
            <FileUploader label="Photo" multiple={false} allowDrop={false} accept="image/*" upload={quick} uploadMode="button" x-model={() => s.one} />
            <Stack orientation="horizontal" wrap align="center">
                <FileUploader ref={(u: FileUploader) => (manual = u)} label="Logs" accept=".log,.txt" upload={quick} uploadMode="manual" />
                <Button text="Send the logs" variant="outline" onclick={() => void manual.upload()} />
            </Stack>
        </Stack>
    );
}
