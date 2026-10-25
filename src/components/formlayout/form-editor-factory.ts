import type { ComponentBase } from '@motifx/core';

/** Makes an editor from the props a form gives it (`label`, `value`, `onValueChanged`, …). */
export type FormEditorFactory = (props: Record<string, unknown>) => ComponentBase;
