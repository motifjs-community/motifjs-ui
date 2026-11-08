import { reactive } from '@motifx/core';
import { ButtonGroup, RibbonMenu, Slider, Stack, Switch, type RibbonMenuLayout } from '@motifx-community/ui';
import { documentTabs } from './document-tabs';

/** The same menu in less and less room: the groups give way, then the commands scroll. */
export default function Room() {
    const s = reactive({ width: 720, layout: 'classic' as RibbonMenuLayout, adaptive: true, told: 'nothing yet' });
    const run = (what: string) => () => (s.told = what);

    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" gap="lg" wrap align="center">
                <Slider label="Width" min={220} max={900} step={10} x-model={() => s.width} style="inline-size: 16rem" />
                <ButtonGroup
                    label="Layout"
                    x-model={() => s.layout}
                    items={[
                        { value: 'classic', text: 'Classic' },
                        { value: 'simple', text: 'Simplified' }
                    ]}
                />
                <Switch label="Give way" x-model={() => s.adaptive} />
            </Stack>
            <RibbonMenu class="rb-room" items={documentTabs(run)} style={() => `inline-size: ${s.width}px`} layout={() => s.layout} adaptive={() => s.adaptive} onLayoutChanged={e => (s.layout = e.layout)} />
            <output class="rb-room-told">{() => `${s.width} pixels · last command: ${s.told}`}</output>
        </Stack>
    );
}
