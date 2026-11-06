import { Component, reactive, untracked, useNavigation } from '@motifx/core';
import { Button, Tab, Tabs } from '@motifx-community/ui';
import { ISSUES_URL, loadIssues, newIssueUrl, type PageIssue } from '../app/issues';
import { PAGES } from '../app/pages';
import { tx } from '../app/texts';

function dateText(text: string, date: string): string {
  const formatted = new Intl.DateTimeFormat(document.documentElement.lang || 'en', { dateStyle: 'medium' }).format(new Date(date));
  return tx(text).replace('{date}', formatted);
}

function IssueRow(props: { issue: PageIssue }) {
  const { issue } = props;
  return (
    <li class="docs-feedback__issue">
      <a class="docs-feedback__link" href={issue.url} target="_blank" rel="noopener">
        {issue.text}
      </a>
      <small>
        <a href={issue.url} target="_blank" rel="noopener">
          #{issue.number}
        </a>{' '}
        {() => dateText(issue.open ? 'opened on {date}' : 'closed on {date}', issue.date)}
      </small>
    </li>
  );
}

/** The foot of every page: a button that opens an issue for the page, and the issues already filed for it. */
export class PageFeedback extends Component<HTMLElement> {
  static override elementTag = 'section';

  private readonly nav = useNavigation();
  private readonly state = reactive({
    all: [] as PageIssue[],
    open: [] as PageIssue[],
    closed: [] as PageIssue[],
    status: 'waiting' as 'waiting' | 'ready' | 'failed',
  });

  /** The name issues of this page carry in their title: a topic of a larger component counts as that component. */
  private get tag(): string {
    return PAGES.find((p) => p.id === this.nav.meta.page)?.title.split(':')[0] ?? '';
  }

  override onConfigured(): void {
    this.class.add('docs-feedback');
    this.bindings.watch(() => {
      const tag = this.tag.toLowerCase();
      const all = this.state.all;
      untracked(() => {
        this.state.open = all.filter((issue) => issue.tag === tag && issue.open);
        this.state.closed = all.filter((issue) => issue.tag === tag && !issue.open);
      });
    });
  }

  override onMounted(): void {
    // Requested only when a reader reaches the foot of a page.
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      loadIssues().then(
        (issues) => {
          this.state.all = issues;
          this.state.status = 'ready';
        },
        () => {
          this.state.status = 'failed';
        },
      );
    });
    observer.observe(this.element);
    this.motif.setDisposable(() => observer.disconnect());
  }

  override view() {
    const { state } = this;
    return (
      <>
        <h2>{() => tx('Feedback')}</h2>
        <Button
          class="docs-feedback__submit"
          text={() => tx('Submit GitHub Issue')}
          tone="accent"
          onclick={() => window.open(newIssueUrl(this.tag), '_blank', 'noopener')}
        />
        <p class="docs-feedback__status" role="status" x-wait={() => state.status !== 'waiting'}>
          {() => tx('Loading issues…')}
        </p>
        <p class="docs-feedback__status" role="status" x-wait={() => state.status !== 'failed'}>
          {() => tx('Issues could not be loaded.')}{' '}
          <a href={ISSUES_URL} target="_blank" rel="noopener">
            {() => tx('View all issues')}
          </a>
        </p>
        <Tabs class="docs-feedback__tabs" label={() => tx('Issues for this page')} x-wait={() => state.status !== 'ready'}>
          <Tab key="open" title={() => tx('Open Issues')}>
            <ul class="docs-feedback__list">
              {state.open.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </ul>
            <p class="docs-feedback__status" x-wait={() => state.open.length > 0}>
              {() => tx('No open issues for this page.')}
            </p>
          </Tab>
          <Tab key="closed" title={() => tx('Closed Issues')}>
            <ul class="docs-feedback__list">
              {state.closed.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </ul>
            <p class="docs-feedback__status" x-wait={() => state.closed.length > 0}>
              {() => tx('No closed issues for this page.')}
            </p>
          </Tab>
        </Tabs>
      </>
    );
  }
}
