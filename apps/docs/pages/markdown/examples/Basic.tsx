import { Markdown } from '@motifx-community/ui';

const TEXT = `## Release notes

The grid now **remembers** each user's columns, and the *filter row* keeps its values.

- Faster scrolling on large sources
- New \`selectAll()\` method
  - also from the keyboard: Ctrl+A
- [x] Tested in every design language
- [ ] Documented in the migration guide

> Upgrading needs no code changes.

| Version | Date | Status |
|:--------|:----:|-------:|
| 1.4 | May | released |
| 1.5 | June | beta |

Read more at https://motifjs.com.`;

/** Markdown given at once: headings, lists, tasks, a quote, a table and a bare address. */
export default function Basic() {
  return <Markdown text={TEXT} />;
}
