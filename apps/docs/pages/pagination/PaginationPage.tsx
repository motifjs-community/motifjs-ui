import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Looks from './examples/Looks';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['page', '`Bind<number>`', '`1`', 'The page, from 1.'],
  ['value', '`Bind<number>`', '', 'The same as `page`: what `x-model` binds, two-way.'],
  ['total', '`Bind<number>`', '`0`', 'How many items there are in all; the pages are counted from it and `pageSize`.'],
  ['pageSize', '`Bind<number>`', '`10`', 'Items per page; 0: all on one page.'],
  ['pageCount', '`Bind<number | null>`', '`null`', 'How many pages, when there is no `total` to count them from.'],
  ['pageSizes', '`Bind<readonly number[]>`', '`[]`', 'The page sizes to choose from (0: all). Another size keeps the first item of the page in view.'],
  ['showInfo', '`Bind<boolean>`', '`true`', '“Page 3 of 12 (250 items)”.'],
  ['showNavigation', '`Bind<boolean>`', '`true`', 'The first, previous, next and last steps.'],
  ['neighbors', '`Bind<number>`', '`1`', 'Page buttons on each side of the current one.'],
  ['mode', '`Bind<PaginationMode>`', "`'adaptive'`", '`full`, `compact` (a page number box and a drop-down of sizes), `adaptive`: compact while the full one does not fit.'],
  ['infoText', '`Bind<string>`', "`''`", 'The info of your own: `{page}`, `{count}` and `{total}` are filled in.'],
  ['label', '`Bind<string>`', 'the kit’s “Pages”', 'What screen readers call it; several on a page need one each.'],
];

const MEMBERS = [
  ['onPageChanged', 'event', 'The page or the page size changed (`page`, `pageSize`), by the user or by code (`byUser`).'],
  ['goTo(page)', 'method', 'Goes to a page (from 1), as a press would.'],
  ['pageCount', 'read', 'How many pages there are now.'],
  ['compact', 'read-only', 'Whether the compact look shows now.'],
];

const A11Y = [
  ['Landmark', 'A `nav` named “Pages” (or its label) in the kit language.'],
  ['Pages', 'Each page button is named “Page 5”; the current one is `aria-current="page"`.'],
  ['Steps', 'Named First page, Previous page, Next page, Last page; disabled at the ends.'],
  ['Compact', 'The page number box is named “Page number”; the info stays readable while hidden.'],
];

const HOOKS = [
  ['.mx-pagination', 'The pagination. `data-look`: `full` or `compact`.'],
  ['.mx-pagination__sizes, __size, __size-list', 'The page sizes, as buttons or as a drop-down.'],
  ['.mx-pagination__info, __step, __pages, __page, __gap', 'The info, a step (`data-step`), the page buttons and the gaps.'],
  ['.mx-pagination__jump, __number', 'The compact look’s page number box.'],
];

const TOKENS = [
  ['pagination.button-size, .step-variant, .page-variant, .page-tone, .current-variant, .current-tone', 'The look of its buttons: the same as the grid’s pager in each language.'],
  ['pagination.info', 'Unit: the info’s text.'],
  ['pagination.gap, .step-overlap, .number-width, .size-width', 'The space between parts, the double arrows, the compact look’s boxes.'],
];

export default function PaginationPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Moving through pages of items: the sizes to choose from, where the page stands, the steps and a button per page around the current one. It turns compact when it does not fit. It looks and works as the grid’s pager." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Pagination } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="`x-model` binds the page; `onPageChanged` tells the page size too, so the data can be loaded for both." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="looks" title="Looks">
        <Example files={code('Looks.tsx')}>
          <Looks />
        </Example>
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Events, properties and methods" />
        </h3>
        <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
