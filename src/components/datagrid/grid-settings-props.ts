import type { Bind } from '@motifx/core';
import type { GridSettings } from './grid-settings';

/** The `settings` prop: any of the switches, each a value or a tracked function. */
export type GridSettingsProps = { [K in keyof GridSettings]?: Bind<GridSettings[K]> };
