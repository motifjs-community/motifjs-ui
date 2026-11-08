# Foundations

> Foundations · @motifx-community/ui 0.1.0-beta.8

The foundations are what every control of the kit shares: the Control base with its properties, keyboard and focus, and the language of the texts and formats.

## What every control shares

Access keys with Alt on buttons and labels, one Tab stop for each control, a switch that turns a whole panel off, and the kit's language switched live with every text and format drawn again.

```tsx
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
```

## Components in this group

Each component has its own page with its examples and its full API.

| Component | For |
| --- | --- |
| `[Control](control.md)` | The base of every control: properties set as values or functions, enabled through the tree, and controls added programmatically. |
| `[Keyboard and focus](keyboard.md)` | Access keys, shortcuts, the Tab order and keeping focus where it belongs. |
| `[Language](language.md)` | The kit's texts and formats, loaded as packs and switched live. |

## What they share

Every prop is also a property: a value is taken as it is, and a function is followed, so a control changes with the data without copying it.

Enabled and visible pass down the tree: a disabled panel disables everything inside, and each control keeps its own setting for when the panel comes back.

Texts and formats come from the language in use; a page can switch it at any time, and every control draws again.

## Accessibility

| Topic | Details |
| --- | --- |
| `Keyboard` | Every control works with the keyboard alone, and access keys reach a command or a field in one step. |
| `Focus` | Focus is always visible, and it returns to a sensible place when a panel closes or a control goes away. |
| `Language` | The page language follows the kit's, so assistive technology reads texts in the right language. |

## Feedback

Loading issues…
