import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { PullDownEventArgs } from './pull-down-event-args';
import type { ReachBottomEventArgs } from './reach-bottom-event-args';
import type { ScrollEventArgs } from './scroll-event-args';
import type { ScrollViewBars } from './scroll-view-bars';
import type { ScrollViewDirection } from './scroll-view-direction';

/** Props of `ScrollView`. Each one is also a settable property; a function is followed. */
export interface ScrollViewProps extends ControlProps {
    /** Default `'vertical'`. */
    direction?: Bind<ScrollViewDirection>;
    /** When the scrollbars show. Default `'onScroll'`. */
    showScrollbar?: Bind<ScrollViewBars>;
    /** Pulling the content down from the top asks `onPullDown` for what is new. Default `false`. */
    pullToRefresh?: Bind<boolean>;
    /** Scrolling near the end asks `onReachBottom` for more. Default `false`. */
    loadOnReachBottom?: Bind<boolean>;
    /** Pixels from the end at which `onReachBottom` is asked. Default `100`. */
    reachBottomOffset?: Bind<number>;
    /** The texts of the pull-down panel; the kit's when not given. */
    pullDownText?: Bind<string>;
    releaseText?: Bind<string>;
    refreshingText?: Bind<string>;
    /** The text under the content while more is loading; the kit's "Loading…" when not given. */
    reachBottomText?: Bind<string>;
    /** What screen readers call the scrolling region. */
    label?: Bind<string>;
    onPullDown?: (e: PullDownEventArgs) => void;
    onReachBottom?: (e: ReachBottomEventArgs) => void;
    onScrolled?: (e: ScrollEventArgs) => void;
}
