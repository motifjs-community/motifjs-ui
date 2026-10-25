import { reactive } from '@motifx/core';

/** The text the toolbars on this page format: one state, so every toolbar shows the same. */
export const draft = reactive({
  bold: true,
  italic: false,
  underline: false,
  align: 'left' as 'left' | 'center' | 'right',
  log: 'Nothing yet.',
});
