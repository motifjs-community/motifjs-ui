/** A GitHub issue about a page of the site. */
export interface PageIssue {
  id: number;
  number: number;
  /** The title without its `[Page]` tag. */
  text: string;
  open: boolean;
  url: string;
  /** When it was opened, or closed if it is closed. */
  date: string;
  tag: string;
}

interface IssueRow {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  closed_at: string | null;
  pull_request?: unknown;
}

const REPOSITORY = 'https://github.com/motifjs-community/motifjs-ui';
const REQUEST = 'https://api.github.com/repos/motifjs-community/motifjs-ui/issues?state=all&per_page=100';
const STORAGE_KEY = 'mx-docs-issues';
const LIFETIME = 10 * 60 * 1000;

export const ISSUES_URL = `${REPOSITORY}/issues`;

/** The address that opens a new issue with the page's tag in its title. */
export function newIssueUrl(tag: string): string {
  return `${REPOSITORY}/issues/new?template=bug.yml&title=${encodeURIComponent(`[${tag}] `)}`;
}

function toIssue(row: IssueRow): PageIssue {
  const tag = /^\[([^\]]+)\]/.exec(row.title)?.[1] ?? '';
  return {
    id: row.id,
    number: row.number,
    text: row.title.replace(/^\[[^\]]+\]\s*/, ''),
    open: row.state === 'open',
    url: row.html_url,
    date: row.closed_at ?? row.created_at,
    tag: tag.toLowerCase(),
  };
}

let pending: Promise<PageIssue[]> | null = null;

/** One request serves every page: the anonymous API allows 60 an hour, so the list is kept for ten minutes. */
export function loadIssues(): Promise<PageIssue[]> {
  const kept = sessionStorage.getItem(STORAGE_KEY);
  if (kept) {
    const { time, issues } = JSON.parse(kept) as { time: number; issues: PageIssue[] };
    if (Date.now() - time < LIFETIME) return Promise.resolve(issues);
  }
  pending ??= fetch(REQUEST, { headers: { Accept: 'application/vnd.github+json' } })
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json() as Promise<IssueRow[]>;
    })
    .then((rows) => {
      const issues = rows.filter((row) => !row.pull_request).map(toIssue);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ time: Date.now(), issues }));
      return issues;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}
