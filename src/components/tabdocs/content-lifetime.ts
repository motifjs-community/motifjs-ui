/**
 * When a document's content is built and how long it lives: `keep` builds it on open and keeps it
 * while the document is open; `lazy` builds it when first shown, then keeps it; `dispose` builds it
 * when shown and disposes it when hidden (it comes back from the factory, with the document's `state`).
 */
export type ContentLifetime = 'keep' | 'lazy' | 'dispose';
