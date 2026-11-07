import { reactive } from '@motifx/core';
import { Button, DateBox, NumberBox, Pagination, Panel, Switch, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** What every control shares: access keys with Alt, one Tab stop per control, a panel that turns everything inside off, and the kit's language switched live. */
export default function FoundationsDemo() {
    const s = reactive({ price: 1234.5, when: new Date(2026, 2, 18) as Date | null, locked: false, log: 'Press Alt with an underlined letter.' });
    let panel!: Panel;

    return (
        <div class="ov-frame ov-foundations">
            <div class="ov-bar">
                <Button text="&English" variant="outline" onclick={() => void uiLocale.use('en')} />
                <Button text="&Türkçe" variant="outline" onclick={() => void uiLocale.use('tr')} />
                <span class="ov-muted">
                    In use: <output class="ov-locale">{() => kitTexts.locale}</output>
                </span>
                <span style="flex: 1 1 auto" />
                <Switch label="&Lock the form" x-model={() => s.locked} onValueChanged={e => (panel.enabled = !e.value)} />
            </div>
            <Panel ref={(p: Panel) => (panel = p)} variant="outline" padding="md">
                <div class="ov-stack">
                <div class="ov-grid">
                    <NumberBox label="&Price" x-model={() => s.price} format={{ style: 'currency', currency: 'EUR' }} />
                    <DateBox label="&Date" x-model={() => s.when} clearButton />
                    <Pagination class="ov-wide" total={95} pageSizes={[10, 20, 50]} label="Orders" />
                </div>
                <div class="ov-bar">
                    <Button text="&Save" tone="accent" onclick={() => (s.log = 'Saved with Alt+S or a click.')} />
                    <Button text="&Reset" variant="outline" onclick={() => (s.log = 'Reset with Alt+R or a click.')} />
                </div>
                </div>
            </Panel>
            <output class="ov-status ov-foundations-log">{() => s.log}</output>
        </div>
    );
}
