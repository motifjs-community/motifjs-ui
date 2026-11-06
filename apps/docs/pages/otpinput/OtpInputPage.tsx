import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Basic from './examples/Basic';
import Formats from './examples/Formats';
import Programmatic from './examples/Programmatic';
import States from './examples/States';
import Validation from './examples/Validation';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['length', '`Bind<number>`', '`6`', 'The number of characters.'],
    ['charset', "`Bind<'digits' | 'letters' | 'alphanumeric'>`", "`'digits'`", 'Which characters are accepted. Anything else is left out, also in a pasted code.'],
    ['pattern', '`Bind<RegExp | null>`', '`null`', 'Accepts the characters this matches instead of `charset`. It is tested on one character at a time.'],
    ['uppercase', '`Bind<boolean>`', '`false`', 'Turns letters into capitals as they are typed.'],
    ['masked', '`Bind<boolean>`', '`false`', 'Draws a mark in place of each character.'],
    ['maskCharacter', '`Bind<string>`', "`'•'`", 'The mark of `masked`.'],
    ['placeholder', '`Bind<string>`', "`''`", 'Shown in a box that is still empty.'],
    ['groupSize', '`Bind<number | null>`', '`null`', 'Puts a separator after every so many boxes, such as `3` for `123-456`.'],
    ['separator', '`Bind<string>`', "`'–'`", 'The text of that separator.'],
    ['autoComplete', '`Bind<string>`', "`'one-time-code'`", 'The `autocomplete` of the input, which lets a phone offer the code from a message.'],
    ['label, helpText, size, readOnly, required, rules, error, validateOn', '', '', 'Same as `TextBox`.'],
];

const MEMBERS = [
    ['value', '`string`', 'The characters entered so far. `x-model` provides two-way binding.'],
    ['isComplete', '`boolean`', 'Indicates that every box is filled.'],
    ['clear()', '`void`', 'Empties the boxes and puts the caret in the first one.'],
    ['validate()', '`Promise<boolean>`', 'Same as `TextBox`.'],
    ['focus()', '`boolean`', 'Moves focus to the first empty box.'],
];

const EVENTS = [
    ['onCompleted', '`{ value, source, originalEvent }`', 'Occurs when the user has entered every character, by typing, pasting or from the phone. It occurs once for a code.'],
    ['onValueChanged', '`{ value, previousValue, byUser, source, event }`', 'Same as `TextBox`.'],
];

const KEYS = [
    ['Characters', 'Fill the box with the caret, and the caret moves on. In a filled box, the character takes its place.'],
    ['Backspace, Delete', 'Remove a character, and those after it move back.'],
    ['Left, Right, Home, End', 'Move the caret between the boxes.'],
    ['Ctrl+V', 'Pastes a whole code. Characters that are not accepted, such as spaces and dashes, are left out.'],
];

const A11Y = [
    ['Input', 'One real `<input>` with its label, one Tab stop. Screen readers treat it as a text box, and the boxes are hidden from them.'],
    ['Direction', 'The boxes run left to right in every page, as a code is read.'],
    ['Phones', '`autocomplete="one-time-code"` offers the code from a message, and `inputmode="numeric"` opens the number keypad for digits.'],
    ['Masked codes', '`masked` only changes what the boxes draw. Use it where the code should not be read over a shoulder.'],
];

const HOOKS = [
    ['.mx-otp-input', 'The field. `data-size`, `data-invalid`, `data-readonly` and `data-disabled` describe its state.'],
    ['.mx-otp-input__input', 'The real input, unseen over the boxes.'],
    ['.mx-otp-input__cells, .mx-otp-input__cell, .mx-otp-input__char, .mx-otp-input__caret, .mx-otp-input__separator', 'The row, a box, a character, the caret and the separator. `data-active` and `data-filled` describe a box.'],
];

const TOKENS = [
    ['otp-input.cell-width, .cell-height, .font-size', 'The size of a box and of a character, for `sm`, `md` and `lg`.'],
    ['otp-input.input-font-size', 'The text of the input under the boxes. Below 16 px a phone zooms in on focus.'],
    ['otp-input.cells, .cell, .char, .caret, .separator', 'Units: the row, a box (`hover`, `filled`, `active`, `invalid`, `invalid-active`, `readonly`, `disabled`), a character, the caret and the separator.'],
    ['otp-input.field', 'Place: the field under the boxes, without a box of its own.'],
];

export default function OtpInputPage() {
    return (
        <>
            <p class="lead">
                <Rich text="A one-time code in a row of boxes. Typing, pasting a whole code, the code a phone offers from a message and screen readers work as in any text box, because the boxes are drawn over one real input." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { OtpInput } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="basic" title="Entering a code">
                <p>
                    <Rich text="`x-model` binds the code, and `onCompleted` occurs when the last box is filled. Paste a code into the field, or type part of it and use the arrow keys." />
                </p>
                <Example stack files={code('Basic.tsx')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="formats" title="Formats">
                <p>
                    <Rich text="`length` sets the number of boxes, and `charset` or `pattern` the characters. `groupSize` separates the boxes, `masked` hides the characters, and `placeholder` marks empty boxes." />
                </p>
                <Example stack files={code('Formats.tsx')}>
                    <Formats />
                </Example>
            </Section>

            <Section anchor="validation" title="Validation">
                <p>
                    <Rich text="A code that is not complete fails on its own. `rules` adds your own checks, as in every field." />
                </p>
                <Example stack files={code('Validation.tsx')}>
                    <Validation />
                </Example>
            </Section>

            <Section anchor="states" title="Sizes and states">
                <p>
                    <Rich text="`size` sets the size of the boxes. `readOnly` and `enabled` work as in every field." />
                </p>
                <Example stack files={code('States.tsx')}>
                    <States />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`new OtpInput(props)` creates the field without JSX. Each prop is also a property." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                    <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                    <Rich text="Properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
                <h3>
                    <Rich text="Events" />
                </h3>
                <ApiTable head={['Event', 'Type', 'Description']} rows={EVENTS} />
                <h3>
                    <Rich text="Keyboard" />
                </h3>
                <ApiTable head={['Key', 'Description']} rows={KEYS} />
                <h3>
                    <Rich text="Accessibility" />
                </h3>
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
                <h3>
                    <Rich text="Styling hooks" />
                </h3>
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                    <Rich text="Design tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>
        </>
    );
}
