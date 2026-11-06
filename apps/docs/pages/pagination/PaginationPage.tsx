import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Looks from './examples/Looks';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['page', '`Bind<number>`', '`1`', 'The page number, starting from 1.'],
  ['value', '`Bind<number>`', '', 'Same as `page`. This is what `x-model` binds, with two-way binding.'],
  ['total', '`Bind<number>`', '`0`', 'The total number of items. The page count is derived from this and `pageSize`.'],
  ['pageSize', '`Bind<number>`', '`10`', 'The number of items per page. 0 shows all items on one page.'],
  ['pageCount', '`Bind<number | null>`', '`null`', 'The number of pages, when there is no `total`.'],
  ['pageSizes', '`Bind<readonly number[]>`', '`[]`', 'The available page sizes (0 means all). Changing the size keeps the first item of the page in view.'],
  ['showInfo', '`Bind<boolean>`', '`true`', '“Page 3 of 12 (250 items)”.'],
  ['showNavigation', '`Bind<boolean>`', '`true`', 'The first, previous, next and last buttons.'],
  ['neighbors', '`Bind<number>`', '`1`', 'The number of page buttons on each side of the current page.'],
  ['mode', '`Bind<PaginationMode>`', "`'adaptive'`", '`full`, `compact` (a page number box and a drop-down of sizes), or `adaptive`, which is compact when the full layout does not fit.'],
  ['infoText', '`Bind<string>`', "`''`", 'Custom information text. `{page}`, `{count}` and `{total}` are replaced with their values.'],
  ['label', '`Bind<string>`', 'The kit string “Pages”', 'The accessible name. If a page has several, each one needs its own.'],
];

const MEMBERS = [
  ['onPageChanged', 'event', 'Occurs when the page or the page size changes (`page`, `pageSize`), either by the user or programmatically (`byUser`).'],
  ['goTo(page)', 'method', 'Goes to a page, starting from 1, as a click would.'],
  ['pageCount', 'Read-only', 'The current number of pages.'],
  ['compact', 'read-only', 'Indicates whether the compact layout is currently shown.'],
];

const A11Y = [
  ['Landmark', 'A `nav` named “Pages” in the kit language, or by its label.'],
  ['Pages', 'Each page button is named “Page 5”, and the current one has `aria-current="page"`.'],
  ['Steps', 'Named First page, Previous page, Next page and Last page, and disabled at the ends.'],
  ['Compact', 'The page number box is named “Page number”, and the information stays available to screen readers while hidden.'],
];

const HOOKS = [
  ['.mx-pagination', 'The pagination. `data-look`: `full` or `compact`.'],
  ['.mx-pagination__sizes, __size, __size-list', 'The page sizes, as buttons or a drop-down.'],
  ['.mx-pagination__info, __step, __pages, __page, __gap', 'The information text, a navigation button (`data-step`), the page buttons and the gaps.'],
  ['.mx-pagination__jump, __number', 'The page number box in the compact layout.'],
];

const TOKENS = [
  ['pagination.button-size, .step-variant, .page-variant, .page-tone, .current-variant, .current-tone', 'The appearance of its buttons, which matches the DataGrid pager in each design language.'],
  ['pagination.info', 'Unit: the information text.'],
  ['pagination.gap, .step-overlap, .number-width, .size-width', 'The spacing between parts, the double arrows and the boxes in the compact layout.'],
];

export default function PaginationPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Navigates through pages of items, with page size options, the current position, navigation buttons and a button for each nearby page. It switches to a compact layout when it does not fit, and it looks and works like the DataGrid pager." />
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
          <Rich text="`x-model` binds the page, and `onPageChanged` also reports the page size, so data can be loaded for both." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="looks" title="Appearance">
        <Example files={code('Looks.tsx')}>
          <Looks />
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
