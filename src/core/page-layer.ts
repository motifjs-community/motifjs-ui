import { Application, Component, ComponentBase, untracked, useApplication } from '@motifx/core';
import { pageWindow, windowOf } from './page-documents';

/** The body of each document as a component, for when no app runs: made on first use, kept while that body is. */
const pages = new WeakMap<Document, Component<HTMLElement>>();

/**
 * Puts `component` above the page of `near`: a document, or the one a component is in (its window found from the
 * component tree). In the app's layer for that document (`layerOf`) while an app runs, else as a child of the component
 * standing for that document's body. Core places it; nothing is appended by hand.
 */
export function placeOnPage(near: Document | ComponentBase, component: ComponentBase): void {
  const doc = near instanceof ComponentBase ? (windowOf(near)?.document ?? document) : near;
  let app: ReturnType<typeof useApplication> | null;
  try {
    app = useApplication();
  } catch {
    // No app runs: the page itself holds it.
    app = null;
  }
  if (app) app.layerOf(doc.body, component);
  else pageBody(doc).controls.add(component);
}

/**
 * The component that wraps the app in the window `part` is in, where a mark for the whole page goes (printing one
 * control, a page kept busy): the host of an app window (`app.windows`), the app's shell (the `run()` host) in the
 * page, else, with no app running there, the component standing for that window's body.
 */
export function appRootOf(part: ComponentBase): ComponentBase {
  const app = Application.main as Application | undefined;
  if (app) {
    const own = untracked(() => app.windows.of(part));
    if (own) return own.host;
    if (app.state === 'running' && windowOf(part) === pageWindow()) return app.getAppShell();
  }
  return pageBody(windowOf(part)?.document ?? document);
}

/**
 * The component standing for the body of `doc`, taken in once and shared by all who need the page without an app.
 * It is never disposed: the body is the page's.
 */
export function pageBody(doc: Document): ComponentBase {
  let page = pages.get(doc);
  if (!page || page.isDisposed || page.element !== doc.body) {
    page = new Component<HTMLElement>(doc.body);
    // It places its children only once it is built.
    page.build();
    pages.set(doc, page);
  }
  return page;
}
