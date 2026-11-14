# Editors

> Editors · @motifx-community/ui 0.1.0-beta.10

Editors take values: text, numbers, dates and times, ranges, colors, ratings, codes, files and signatures. They share one field model, so a label, help text, validation and binding work the same in all of them.

## A booking form

Fourteen editors in one form. Book checks the required fields and their rules together, and the summary at the top lists what is missing, with links that move to each field.

```tsx
import { reactive } from '@motifx/core';
import {
    Button,
    Calendar,
    ColorBox,
    DateBox,
    DateRangeBox,
    FileUploader,
    NumberBox,
    OtpInput,
    Rating,
    Signature,
    Slider,
    TextArea,
    TextBox,
    ValidationGroup,
    ValidationSummary,
    toast,
    type DateRange
} from '@motifx-community/ui';

// Stands in for a server: takes a file in a second and reports how far it is.
const send = (file: File, report: (fraction: number) => void) =>
    new Promise<string>(resolve => {
        let step = 0;
        const timer = setInterval(() => {
            report(++step / 10);
            if (step === 10) {
                clearInterval(timer);
                resolve(file.name);
            }
        }, 100);
    });

/** A room booking: text, numbers, dates, a range, a choice of color, files, a code and a signature, checked together on Book. */
export default function EditorsDemo() {
    const group = new ValidationGroup();
    const today = new Date();
    const b = reactive({
        name: '',
        email: '',
        phone: '',
        guests: 2,
        stay: [null, null] as DateRange,
        arrival: null as Date | null,
        budget: [80, 180] as number[],
        accent: '#2f7d6d' as string | null,
        rating: 4,
        notes: '',
        code: '',
        strokes: null as unknown,
        day: today as Date | null
    });

    const book = async () => {
        if (!(await group.validate())) return;
        toast.success(`${b.name}, your room for ${b.guests} is booked.`, { title: 'Booked' });
    };

    return (
        <div class="ov-frame ov-editors">
            <h3 class="ov-title">Book a room</h3>
            <ValidationSummary group={group} />
            <div class="ov-grid">
                <TextBox label="&Name" required x-model={() => b.name} validationGroup={group} />
                <TextBox label="E-&mail" type="email" required rules={[{ type: 'email' }]} x-model={() => b.email} validationGroup={group} />
                <TextBox label="&Phone" mask="(000) 000 00 00" x-model={() => b.phone} helpText="Only if we need to call you." />
                <NumberBox label="&Guests" min={1} max={6} required x-model={() => b.guests} validationGroup={group} />
                <DateRangeBox label="&Stay" required min={today} minDays={1} x-model={() => b.stay} validationGroup={group} />
                <DateBox label="&Arrival time" type="time" timeStep={30} x-model={() => b.arrival} />
                <Slider label="Budget a night" range min={40} max={300} step={10} x-model={() => b.budget} format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }} showValue="drag" />
                <ColorBox label="Room light" x-model={() => b.accent} />
                <Rating label="Your last stay" x-model={() => b.rating} />
                <OtpInput label="Member code" length={6} x-model={() => b.code} helpText="Six digits from the member card." />
                <TextArea class="ov-wide" stretch label="Wishes" autoGrow maxLength={300} showCounter x-model={() => b.notes} />
                <FileUploader class="ov-wide" stretch label="Identity document" accept="image/*,.pdf" maxFiles={1} upload={send} />
                <Signature label="Signature" height={140} x-model={() => b.strokes} />
                <Calendar x-model={() => b.day} min={today} />
            </div>
            <div class="ov-status">
                <output class="ov-editors-sum">{() => `${b.guests} guest(s), ${b.budget[0]} to ${b.budget[1]} EUR a night`}</output>
                <div class="ov-bar">
                    <Button text="Start again" variant="outline" onclick={() => group.reset()} />
                    <Button class="ov-book" text="&Book" tone="accent" onclick={() => void book()} />
                </div>
            </div>
        </div>
    );
}
```

## Components in this group

Each component has its own page with its examples and its full API.

| Component | For |
| --- | --- |
| `[TextBox](textbox.md)` | A line of text, with a mask, a type such as e-mail, a counter or a clear button. |
| `[TextArea](textarea.md)` | Longer text that grows with its content. |
| `[NumberBox](numberbox.md)` | A number in the formats of the language, with limits and spin buttons. |
| `[DateBox](datebox.md)` | A date, a time or both, typed or picked. |
| `[DateRangeBox](daterangebox.md)` | A start and an end, with presets and limits on the length. |
| `[Signature](signature.md)` | A signature drawn with a pen, a finger or a mouse, kept as strokes. |
| `[OtpInput](otpinput.md)` | A one-time code in a row of boxes. |
| `[ColorBox](colorbox.md)` | A color, typed or picked. |
| `[Calendar](calendar.md)` | A month always on show, to pick a day or a range. |
| `[Slider](slider.md)` | A value or a range picked by dragging. |
| `[Rating](rating.md)` | A score in stars or other marks. |
| `[ValidationSummary](validationsummary.md)` | The invalid fields of a group, with links to them. |
| `[FileUploader](fileuploader.md)` | Files dropped or chosen, with limits, progress and uploading in chunks. |
| `[ShortcutEditor](shortcuteditor.md)` | The app’s keyboard shortcuts, for the user to assign other keys. |

## Choosing a component

Several components can do the same job; this table points to the one that reads best for it.

| To | Use |
| --- | --- |
| `Take a short text, or one with a fixed pattern` | [TextBox](textbox.md) |
| `Take a longer text` | [TextArea](textarea.md) |
| `Take an exact number` | [NumberBox](numberbox.md) |
| `Pick a number or a range by feel` | [Slider](slider.md) |
| `Take one date or time` | [DateBox](datebox.md) |
| `Take a start and an end` | [DateRangeBox](daterangebox.md) |
| `Show a month all the time` | [Calendar](calendar.md) |
| `Take a code sent by message` | [OtpInput](otpinput.md) |
| `Take files` | [FileUploader](fileuploader.md) |
| `Let the user change keyboard shortcuts` | [ShortcutEditor](shortcuteditor.md) |

## What they share

Every editor is a field: `label` with an access key, `helpText`, `prefix` and `suffix`, `readOnly`, `stretch`, and `x-model` for its value. The value is the developer's own: a field reads it and writes it back, and never wraps it.

`required` and `rules` check the value; the error shows under the field once the reader leaves it. A `ValidationGroup` checks several fields at once, and a `ValidationSummary` lists the ones that failed.

Numbers, dates and times follow the language of the kit, and change at once when it changes.

## Accessibility

| Topic | Details |
| --- | --- |
| `Names` | The label names the field; help text and the error are read with it. |
| `Errors` | An invalid field is marked invalid for assistive technology, and its message is announced. |
| `Keyboard` | Every editor works without a pointer: pickers open with Alt+Down, sliders move with the arrow keys, Page Up and Page Down. |

## Feedback

Loading issues…
