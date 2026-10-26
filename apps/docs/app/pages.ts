/** The pages of the site in reading order, grouped as the side menu shows them; the top bar shows the sections. */
export const GROUPS = [
  {
    title: 'Get started',
    section: 'Get started',
    pages: [
      { id: 'home', label: 'Overview', title: '@motifx-community/ui', path: '/', related: ['tokens', 'button', 'textbox'] },
      { id: 'showcase', label: 'Showcase', title: 'Showcase: an order screen', path: '/showcase', related: ['formlayout', 'lookup', 'tabs'] },
      { id: 'tokens', label: 'Design tokens', title: 'Design tokens', path: '/tokens', related: ['button', 'textbox'] },
    ],
  },
  {
    title: 'Foundations',
    section: 'Foundations',
    pages: [
      { id: 'control', label: 'Control', title: 'Control', path: '/control', related: ['keyboard', 'button'] },
      { id: 'keyboard', label: 'Keyboard and focus', title: 'Keyboard and focus', path: '/keyboard', related: ['control', 'button'] },
    ],
  },
  {
    title: 'Buttons',
    section: 'Components',
    pages: [
      { id: 'button', label: 'Button', title: 'Button', path: '/button', related: ['control', 'keyboard', 'tokens'] },
      { id: 'toolbar', label: 'Toolbar', title: 'Toolbar', path: '/toolbar', related: ['button', 'menus'] },
      { id: 'menus', label: 'MenuBar and ContextMenu', title: 'MenuBar and ContextMenu', path: '/menus', related: ['button', 'toolbar'] },
    ],
  },
  {
    title: 'Editors',
    section: 'Components',
    pages: [
      { id: 'textbox', label: 'TextBox', title: 'TextBox', path: '/textbox', related: ['textarea', 'numberbox', 'control'] },
      { id: 'textarea', label: 'TextArea', title: 'TextArea', path: '/textarea', related: ['textbox', 'numberbox'] },
      { id: 'numberbox', label: 'NumberBox', title: 'NumberBox', path: '/numberbox', related: ['textbox', 'slider'] },
      { id: 'datebox', label: 'DateBox', title: 'DateBox', path: '/datebox', related: ['calendar', 'textbox'] },
      { id: 'calendar', label: 'Calendar', title: 'Calendar', path: '/calendar', related: ['datebox'] },
      { id: 'slider', label: 'Slider', title: 'Slider', path: '/slider', related: ['numberbox', 'progress'] },
    ],
  },
  {
    title: 'Choice',
    section: 'Components',
    pages: [
      { id: 'checkbox', label: 'CheckBox', title: 'CheckBox', path: '/checkbox', related: ['switch', 'radiogroup'] },
      { id: 'switch', label: 'Switch', title: 'Switch', path: '/switch', related: ['checkbox', 'button'] },
      { id: 'radiogroup', label: 'RadioGroup', title: 'RadioGroup', path: '/radiogroup', related: ['checkbox', 'dropdown'] },
      { id: 'dropdown', label: 'DropDown', title: 'DropDown', path: '/dropdown', related: ['radiogroup', 'textbox'] },
      { id: 'combobox', label: 'ComboBox and Autocomplete', title: 'ComboBox and Autocomplete', path: '/combobox', related: ['dropdown', 'lookup'] },
      { id: 'lookup', label: 'Lookup', title: 'Lookup', path: '/lookup', related: ['combobox', 'dropdown'] },
    ],
  },
  {
    title: 'Feedback',
    section: 'Components',
    pages: [
      { id: 'progress', label: 'ProgressBar and Spinner', title: 'ProgressBar and Spinner', path: '/progress', related: ['toast', 'button'] },
      { id: 'tooltip', label: 'Tooltip', title: 'Tooltip', path: '/tooltip', related: ['toast', 'button'] },
      { id: 'toast', label: 'Toast', title: 'Toast', path: '/toast', related: ['tooltip', 'progress'] },
    ],
  },
  {
    title: 'Navigation',
    section: 'Components',
    pages: [
      { id: 'tabs', label: 'Tabs', title: 'Tabs', path: '/tabs', related: ['accordion', 'keyboard'] },
      { id: 'accordion', label: 'Accordion', title: 'Accordion', path: '/accordion', related: ['tabs'] },
      { id: 'window', label: 'Window', title: 'Window and dialog', path: '/window', related: ['button', 'keyboard'] },
      { id: 'layout', label: 'Layout', title: 'Layout', path: '/layout', related: ['tabs', 'accordion'] },
      { id: 'formlayout', label: 'FormLayout', title: 'FormLayout', path: '/formlayout', related: ['textbox', 'dropdown'] },
    ],
  },
  {
    title: 'Data',
    section: 'Components',
    pages: [
      { id: 'treeview', label: 'TreeView', title: 'TreeView', path: '/treeview', related: ['dropdown', 'checkbox'] },
      { id: 'listbox', label: 'ListBox', title: 'ListBox', path: '/listbox', related: ['tagbox', 'combobox'] },
      { id: 'tagbox', label: 'TagBox', title: 'TagBox', path: '/tagbox', related: ['listbox', 'combobox'] },
      { id: 'filterbuilder', label: 'FilterBuilder', title: 'FilterBuilder', path: '/filterbuilder', related: ['datagrid-filtering', 'tagbox', 'treeview'] },
    ],
  },
  {
    title: 'DataGrid',
    section: 'Components',
    pages: [
      { id: 'datagrid', label: 'Overview', title: 'DataGrid', path: '/datagrid', related: ['datagrid-editing', 'datagrid-filtering', 'datagrid-api'] },
      { id: 'datagrid-editing', label: 'Editing', title: 'DataGrid: Editing', path: '/datagrid/editing', related: ['datagrid-lookups', 'datagrid-selection', 'datagrid-layout'] },
      { id: 'datagrid-forms', label: 'Edit forms and popups', title: 'DataGrid: Edit forms and popups', path: '/datagrid/forms', related: ['datagrid-editing', 'formlayout', 'window'] },
      { id: 'datagrid-filtering', label: 'Filtering and search', title: 'DataGrid: Filtering and search', path: '/datagrid/filtering', related: ['datagrid-lookups', 'datagrid-grouping', 'datagrid-layout'] },
      { id: 'datagrid-lookups', label: 'Lookup columns', title: 'DataGrid: Lookup columns', path: '/datagrid/lookups', related: ['datagrid-editing', 'datagrid-filtering', 'lookup'] },
      { id: 'datagrid-grouping', label: 'Grouping and summaries', title: 'DataGrid: Grouping and summaries', path: '/datagrid/grouping', related: ['datagrid-filtering', 'datagrid-selection', 'datagrid-api'] },
      { id: 'datagrid-master-detail', label: 'Master-detail', title: 'DataGrid: Master-detail', path: '/datagrid/master-detail', related: ['datagrid-grouping', 'datagrid-forms', 'tabs'] },
      { id: 'datagrid-bands', label: 'Bands and adaptive columns', title: 'DataGrid: Bands and adaptive columns', path: '/datagrid/bands', related: ['datagrid-layout', 'datagrid-master-detail', 'layout'] },
      { id: 'datagrid-selection', label: 'Selection and export', title: 'DataGrid: Selection and export', path: '/datagrid/selection', related: ['datagrid-editing', 'datagrid-grouping', 'datagrid-layout'] },
      { id: 'datagrid-layout', label: 'Layout and events', title: 'DataGrid: Layout and events', path: '/datagrid/layout', related: ['datagrid-api', 'datagrid-filtering', 'toolbar'] },
      { id: 'datagrid-api', label: 'API reference', title: 'DataGrid: API reference', path: '/datagrid/api', related: ['datagrid', 'datagrid-layout', 'control'] },
    ],
  },
] as const;

export type PageId = (typeof GROUPS)[number]['pages'][number]['id'];

export const PAGES = GROUPS.flatMap((group) => group.pages.map((page) => ({ ...page, group: group.title, section: group.section })));

/** The sections of the top bar, each opening its first page. */
export const SECTIONS = [...new Set(GROUPS.map((group) => group.section))].map((title) => ({ title, path: PAGES.find((p) => p.section === title)!.path }));
