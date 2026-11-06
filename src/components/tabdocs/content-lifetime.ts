/**
 * When a document's content is created and how long it lives. `keep` creates it on open and keeps it
 * while the document is open. `lazy` creates it when first shown, and then keeps it. `dispose` creates
 * it when shown and disposes it when hidden, and the factory recreates it with the document's `state`.
 */
export type ContentLifetime = 'keep' | 'lazy' | 'dispose';
