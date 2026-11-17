import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { PullDownEventArgs } from './pull-down-event-args';
import type { ReachBottomEventArgs } from './reach-bottom-event-args';
import type { ScrollEndChangedEventArgs } from './scroll-end-changed-event-args';
import type { ScrollEventArgs } from './scroll-event-args';
import type { ScrollViewBars } from './scroll-view-bars';
import type { ScrollViewDirection } from './scroll-view-direction';

/** Props of `ScrollView`. Each prop is also a settable property, and a function is tracked. */
export interface ScrollViewProps extends ControlProps {
    /** The scroll direction. The default is `'vertical'`. */
    direction?: Bind<ScrollViewDirection>;
    /** When the scrollbars appear. The default is `'onScroll'`. */
    showScrollbar?: Bind<ScrollViewBars>;
    /** Pulling the content down from the top raises `onPullDown`. The default is `false`. */
    pullToRefresh?: Bind<boolean>;
    /** Scrolling near the end raises `onReachBottom`. The default is `false`. */
    loadOnReachBottom?: Bind<boolean>;
    /** The distance from the end, in pixels, at which `onReachBottom` is raised. The default is `100`. */
    reachBottomOffset?: Bind<number>;
    /** The text of the pull-down panel. When omitted, the kit strings are used. */
    pullDownText?: Bind<string>;
    releaseText?: Bind<string>;
    refreshingText?: Bind<string>;
    /** The text below the content while more data loads. When omitted, the kit's "Loading…" string is used. */
    reachBottomText?: Bind<string>;
    /** The accessible name of the scrolling region. */
    label?: Bind<string>;
    /**
     * While the view stands at the end, content that grows keeps it at the end (a log, a chat); scrolled away, it stays
     * where it is until it comes back to the end. The default is `false`.
     */
    stickToEnd?: Bind<boolean>;
    /** How near the end, in pixels, counts as at the end. The default is `24`. */
    endOffset?: Bind<number>;
    onPullDown?: (e: PullDownEventArgs) => void;
    onReachBottom?: (e: ReachBottomEventArgs) => void;
    onScrolled?: (e: ScrollEventArgs) => void;
    onAtEndChanged?: (e: ScrollEndChangedEventArgs) => void;
}
