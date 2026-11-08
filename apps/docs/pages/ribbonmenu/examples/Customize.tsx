import { reactive } from '@motifx/core';
import { Button, RibbonMenu, Stack, type RibbonMenuCustomization } from '@motifx-community/ui';
import { documentTabs } from './document-tabs';

const KEY = 'docs.ribbon.customization';

function load(): RibbonMenuCustomization | null {
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? 'null') as RibbonMenuCustomization | null;
    } catch {
        return null;
    }
}

/** What the user changes with the context menu is saved, and given back when the page opens again. */
export default function Customize() {
    const s = reactive({ saved: load(), told: 'nothing yet' });
    const run = (what: string) => () => (s.told = what);

    return (
        <Stack gap="md" style="inline-size: 100%">
            <RibbonMenu
                class="rb-customize"
                items={documentTabs(run)}
                customization={() => s.saved}
                onCustomized={e => {
                    localStorage.setItem(KEY, JSON.stringify(e.customization));
                    s.saved = e.customization;
                }}
            />
            <Stack orientation="horizontal" gap="md" wrap align="center">
                <Button
                    text="Forget the changes"
                    variant="outline"
                    onclick={() => {
                        localStorage.removeItem(KEY);
                        s.saved = {};
                    }}
                />
                <output class="rb-customize-told">{() => `Last command: ${s.told}`}</output>
            </Stack>
            <pre class="rb-customize-json" style="margin: 0; white-space: pre-wrap">{() => JSON.stringify(s.saved ?? {}, null, 2)}</pre>
        </Stack>
    );
}
