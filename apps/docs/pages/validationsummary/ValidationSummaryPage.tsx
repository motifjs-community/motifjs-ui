import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Form from './examples/Form';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['group', '`Bind<ValidationGroup | null>`', '`null`', 'The group whose invalid fields are listed.'],
    ['header', '`Bind<string>`', 'The kit string “Please correct the following”', 'The text above the list.'],
    ['showHeader', '`Bind<boolean>`', '`true`', 'Shows the header.'],
    ['focusOnClick', '`Bind<boolean>`', '`true`', 'Clicking a line moves focus to its field.']
];

const MEMBERS = [
    ['onItemClick', 'event', 'Occurs when a line is clicked (`target`, `text`).'],
    ['failed', 'read-only', 'The invalid targets currently listed, in group order.'],
    ['count', 'read-only', 'The number of lines.'],
    ['refresh()', '`void`', 'Redraws the lines from the current state of the fields.']
];

const A11Y = [
    ['The summary', 'A live region (`polite`). The lines are announced when they appear, and the summary is hidden when there are no errors.'],
    ['A line', 'A button with the field\'s label and message (“E-mail: Enter a valid e-mail address”). Clicking it moves focus to the field.'],
    ['Glyph', 'The icon before the header is decorative.']
];

const HOOKS = [
    ['.mx-validation-summary', 'The summary. `data-empty` while there are no errors.'],
    ['.mx-validation-summary__header, .mx-validation-summary__icon, .mx-validation-summary__header-text', 'The header, its glyph and its text.'],
    ['.mx-validation-summary__list, .mx-validation-summary__line, .mx-validation-summary__item', 'The list, a line and the button inside it.']
];

const TOKENS = [
    ['validation-summary.box, .icon, .header, .item', 'Units: the box, the glyph before the header (`icon`), the header text and a line (`hover`, `focus`).'],
    ['validation-summary.gap, .line-gap', 'The space between the header and the list, and between the lines.']
];

export default function ValidationSummaryPage() {
    return (
        <>
            <p class="lead">
              <Rich text="Lists the invalid fields of a `ValidationGroup` under a header, with each field's label and message on its own line. Clicking a line moves focus to the field. The summary updates whenever a field in the group is validated or reset, and it is hidden when there are no errors." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { ValidationSummary, ValidationGroup } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Using a summary above a form">
                <p>
                    <Rich text="Set `group` to the group the fields join with `validationGroup`. After `group.validate()`, the invalid fields are listed. A field that becomes valid leaves the list, and `group.reset()` clears it. Clicking a line moves focus to the field (`focusOnClick`)." />
                </p>
                <Example stack files={code('Form.tsx')}>
                    <Form />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`header` sets the line above the list, and `showHeader` hides it. `onItemClick` reports which line was clicked, and `failed` and `count` report what is listed." />
                </p>
                <Example stack files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
