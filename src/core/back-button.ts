// The browser's back (Android's back button, the back gesture, Alt+Left) closing what is open on
// top of the page: a sheet, a drawer, a list. Each holder adds one entry to the session history
// (same address, the state it had plus a mark); going back takes that entry away and closes the
// holder on top. A holder closed some other way takes its entry back with `history.back()`, so no
// stray entry is left. The entries all look the same: going back closes the holder of the highest
// layer, the last one held first.

interface Holder {
  onBack: () => void;
  layer: number;
  order: number;
}

interface Session {
  view: Window;
  holders: Holder[];
  /** How many of our entries the history holds; the current one is the last. */
  depth: number;
  /** `history.back()` calls of ours whose popstate has not come yet. */
  skips: number;
  /** Entries to add once those popstates have come (adding one before would land after the entry going away). */
  waiting: number;
}

const MARK = 'mxBack';
const sessions = new Map<Window, Session>();
let order = 0;

/** What `holdBackButton` returns: lets go (taking its history entry back), or `raise()` makes it the last one held. */
export type BackButtonHold = (() => void) & { raise(): void };

/**
 * Lets the browser's back close something: `onBack` runs when the user goes back while it is the
 * holder of the highest `layer` (the last one held, or raised, among equals). Returns the function
 * that lets go when it closes some other way: its history entry is taken back. A page whose address
 * changed in the meantime keeps the entry (going back then just returns to it).
 */
export function holdBackButton(view: Window | null, onBack: () => void, layer = 1): BackButtonHold {
  if (!view?.history || typeof view.history.pushState !== 'function') return Object.assign(() => {}, { raise: () => {} });
  const session = sessionOf(view);
  const holder: Holder = { onBack, layer, order: ++order };
  session.holders.push(holder);
  push(session);
  return Object.assign(() => release(session, holder), { raise: () => void (holder.order = ++order) });
}

/** How many holders there are now in a window: for tests and diagnostics. */
export function backButtonHolders(view: Window): number {
  return sessions.get(view)?.holders.length ?? 0;
}

function sessionOf(view: Window): Session {
  let session = sessions.get(view);
  if (session) return session;
  session = { view, holders: [], depth: 0, skips: 0, waiting: 0 };
  const s = session;
  view.addEventListener('popstate', () => popped(s));
  sessions.set(view, session);
  return session;
}

function push(session: Session): void {
  if (session.skips) {
    session.waiting++;
    return;
  }
  const history = session.view.history;
  const state = history.state && typeof history.state === 'object' ? history.state : {};
  session.depth++;
  history.pushState({ ...state, [MARK]: session.depth }, '');
}

function release(session: Session, holder: Holder): void {
  const at = session.holders.indexOf(holder);
  if (at < 0) return;
  session.holders.splice(at, 1);
  if (session.waiting) {
    session.waiting--;
    return;
  }
  const history = session.view.history;
  if (session.depth > 0 && history.state?.[MARK] === session.depth) {
    session.depth--;
    session.skips++;
    history.back();
  } else {
    // The page went somewhere else meanwhile: the entry stays where it is.
    session.depth = Math.max(0, session.depth - 1);
  }
}

function popped(session: Session): void {
  const now = Number(session.view.history.state?.[MARK]) || 0;
  if (session.skips) {
    session.skips--;
    if (!session.skips) {
      session.depth = now;
      while (session.waiting) {
        session.waiting--;
        push(session);
      }
    }
    return;
  }
  if (now > session.depth) {
    // Forward onto an entry whose holder is gone: back again, quietly.
    session.skips++;
    session.view.history.go(session.depth - now);
    return;
  }
  let gone = session.depth - now;
  session.depth = now;
  while (gone-- > 0 && session.holders.length) {
    const top = session.holders.reduce((a, b) => (b.layer > a.layer || (b.layer === a.layer && b.order > a.order) ? b : a));
    session.holders.splice(session.holders.indexOf(top), 1);
    top.onBack();
  }
}
