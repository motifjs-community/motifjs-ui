/** Space kept free at the page's edges, in the document's units: one value for every side, or each side. */
export type PdfMargin = number | { top?: number; right?: number; bottom?: number; left?: number };
