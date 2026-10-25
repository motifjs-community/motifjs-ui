import type { RouteItem } from '@motifx/core';
import { DocsLayout } from '../layout/DocsLayout';
import { PAGES, type PageId } from './pages';

const LOAD: Record<PageId, () => Promise<unknown>> = {
  home: () => import('../pages/home/HomePage'),
  showcase: () => import('../pages/showcase/ShowcasePage'),
  tokens: () => import('../pages/tokens/TokensPage'),
  control: () => import('../pages/control/ControlPage'),
  keyboard: () => import('../pages/keyboard/KeyboardPage'),
  button: () => import('../pages/button/ButtonPage'),
  toolbar: () => import('../pages/toolbar/ToolbarPage'),
  menus: () => import('../pages/menus/MenusPage'),
  textbox: () => import('../pages/textbox/TextBoxPage'),
  textarea: () => import('../pages/textarea/TextAreaPage'),
  numberbox: () => import('../pages/numberbox/NumberBoxPage'),
  datebox: () => import('../pages/datebox/DateBoxPage'),
  calendar: () => import('../pages/calendar/CalendarPage'),
  slider: () => import('../pages/slider/SliderPage'),
  checkbox: () => import('../pages/checkbox/CheckBoxPage'),
  switch: () => import('../pages/switch/SwitchPage'),
  radiogroup: () => import('../pages/radiogroup/RadioGroupPage'),
  dropdown: () => import('../pages/dropdown/DropDownPage'),
  combobox: () => import('../pages/combobox/ComboBoxPage'),
  lookup: () => import('../pages/lookup/LookupPage'),
  progress: () => import('../pages/progress/ProgressPage'),
  tooltip: () => import('../pages/tooltip/TooltipPage'),
  toast: () => import('../pages/toast/ToastPage'),
  tabs: () => import('../pages/tabs/TabsPage'),
  accordion: () => import('../pages/accordion/AccordionPage'),
  window: () => import('../pages/window/WindowPage'),
  layout: () => import('../pages/layout/LayoutPage'),
  formlayout: () => import('../pages/formlayout/FormLayoutPage'),
  treeview: () => import('../pages/treeview/TreeViewPage'),
  listbox: () => import('../pages/listbox/ListBoxPage'),
  tagbox: () => import('../pages/tagbox/TagBoxPage'),
  datagrid: () => import('../pages/datagrid/DataGridPage'),
};

/** One layout; every page is loaded when it is first opened. */
export const routes: RouteItem[] = [
  {
    path: '/',
    control: DocsLayout,
    childs: PAGES.map((page) => ({ path: page.path, name: page.id, meta: { page: page.id }, control: LOAD[page.id] }) as RouteItem),
  },
];
