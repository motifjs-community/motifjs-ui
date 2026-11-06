import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Form from './examples/Form';
import Programmatic from './examples/Programmatic';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['group', '`Bind<ValidationGroup | null>`', '`null`', 'The group whose failed fields are listed.'],
    ['header', '`Bind<string>`', 'the kit’s “Please correct the following”', 'The line above the list.'],
    ['showHeader', '`Bind<boolean>`', '`true`', 'The header is shown.'],
    ['focusOnClick', '`Bind<boolean>`', '`true`', 'A press on a line focuses its field.']
];

const MEMBERS = [
    ['onItemClick', 'event', 'A line was pressed (`target`, `text`).'],
    ['failed', 'read-only', 'The failed targets listed now, in the group’s order.'],
    ['count', 'read-only', 'How many lines there are.'],
    ['refresh()', '`void`', 'Draws the lines again from the fields as they are now.']
];

const A11Y = [
    ['The summary', 'A live region (`polite`): the lines are read out when they appear; out of sight while nothing has failed.'],
    ['A line', 'A button with the field’s label and its message (“E-mail: Enter a valid e-mail address”); a press focuses the field.'],
    ['Glyph', 'The mark before the header is decorative.']
];

const HOOKS = [
    ['.mx-validation-summary', 'The summary. `data-empty` while nothing has failed.'],
    ['.mx-validation-summary__header, .mx-validation-summary__icon, .mx-validation-summary__header-text', 'The header, its glyph, its text.'],
    ['.mx-validation-summary__list, .mx-validation-summary__line, .mx-validation-summary__item', 'The list, a line, the button in it.']
];

const TOKENS = [
    ['validation-summary.box, .icon, .header, .item', 'Units: the box, the glyph before the header (`icon`), the header’s text, a line (`hover`, `focus`).'],
    ['validation-summary.gap, .line-gap', 'Between the header and the list; between the lines.']
];

export default function ValidationSummaryPage() {
    return (
        <>
            <p class="lead">
              <Rich text="The failed fields of a `ValidationGroup`, one line each with the field’s label and its message, under a header; a press on a line goes to the field. It draws itself again whenever a field of the group is checked or reset, and stays out of sight while nothing has failed." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { ValidationSummary, ValidationGroup } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Above a form">
                <p>
                    <Rich text="Give it the `group` the fields join with `validationGroup`. After `group.validate()` the failed fields are listed; a field that passes again leaves the list, and `group.reset()` empties it. A press on a line focuses the field (`focusOnClick`)." />
                </p>
                <Example stack files={code('Form.tsx')}>
                    <Form />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`header` gives the line above the list, `showHeader` hides it; `onItemClick` tells which line was pressed, `failed` and `count` say what is listed." />
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
