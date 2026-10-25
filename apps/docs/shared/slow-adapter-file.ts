import type { ExampleFile } from './example-file';
import source from './slow-adapter?raw';

/** The slow adapter, for the examples that import it to show what they need. */
export const slowAdapterFile: ExampleFile = { name: 'slow-adapter.ts', source };
