import type { ComponentBase } from '@motifx/core';

/** Creates an editor from the props a form passes to it (`label`, `value`, `onValueChanged`, …). */
export type FormEditorFactory = (props: Record<string, unknown>) => ComponentBase;
