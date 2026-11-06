import { DisposableStore, Emitter, type EventArgs, type IDisposable, type Event as MotifEvent } from '@motifx/core';
import type { GridActionRanEventArgs } from '../grid-action-ran-event-args';
import type { GridAdaptiveDetailRowPreparingEventArgs } from '../grid-adaptive-detail-row-preparing-event-args';
import type { GridAdaptiveRowExpandedEventArgs } from '../grid-adaptive-row-expanded-event-args';
import type { GridAdaptiveRowExpandingEventArgs } from '../grid-adaptive-row-expanding-event-args';
import type { GridActionRunningEventArgs } from '../grid-action-running-event-args';
import type { GridCellClickEventArgs } from '../grid-cell-click-event-args';
import type { GridCellSelectionChangedEventArgs } from '../grid-cell-selection-changed-event-args';
import type { GridCellSelectionChangingEventArgs } from '../grid-cell-selection-changing-event-args';
import type { GridCellPreparedEventArgs } from '../grid-cell-prepared-event-args';
import type { GridContentReadyEventArgs } from '../grid-content-ready-event-args';
import type { GridContextMenuPreparingEventArgs } from '../grid-context-menu-preparing-event-args';
import type { GridCopyingEventArgs } from '../grid-copying-event-args';
import type { GridDataErrorEventArgs } from '../grid-data-error-event-args';
import type { GridEditCanceledEventArgs } from '../grid-edit-canceled-event-args';
import type { GridEditCancelingEventArgs } from '../grid-edit-canceling-event-args';
import type { GridEditingStartEventArgs } from '../grid-editing-start-event-args';
import type { GridEditorPreparedEventArgs } from '../grid-editor-prepared-event-args';
import type { GridEditorPreparingEventArgs } from '../grid-editor-preparing-event-args';
import type { GridExportedEventArgs } from '../grid-exported-event-args';
import type { GridExportingEventArgs } from '../grid-exporting-event-args';
import type { GridFilterChangedEventArgs } from '../grid-filter-changed-event-args';
import type { GridFilterChangingEventArgs } from '../grid-filter-changing-event-args';
import type { GridFilterBuilderClosedEventArgs } from '../grid-filter-builder-closed-event-args';
import type { GridFilterBuilderClosingEventArgs } from '../grid-filter-builder-closing-event-args';
import type { GridFilterBuilderOpenedEventArgs } from '../grid-filter-builder-opened-event-args';
import type { GridFilterBuilderOpeningEventArgs } from '../grid-filter-builder-opening-event-args';
import type { GridFocusedCellChangedEventArgs } from '../grid-focused-cell-changed-event-args';
import type { GridFocusedCellChangingEventArgs } from '../grid-focused-cell-changing-event-args';
import type { GridFocusedRowChangedEventArgs } from '../grid-focused-row-changed-event-args';
import type { GridFocusedRowChangingEventArgs } from '../grid-focused-row-changing-event-args';
import type { GridGroupDroppingEventArgs } from '../grid-group-dropping-event-args';
import type { GridGroupingChangedEventArgs } from '../grid-grouping-changed-event-args';
import type { GridGroupingChangingEventArgs } from '../grid-grouping-changing-event-args';
import type { GridInitNewRowEventArgs } from '../grid-init-new-row-event-args';
import type { GridKeyHandlingEventArgs } from '../grid-key-handling-event-args';
import type { GridLayout } from '../grid-layout';
import type { GridLayoutChangingEventArgs } from '../grid-layout-changing-event-args';
import type { GridMoreRowsLoadedEventArgs } from '../grid-more-rows-loaded-event-args';
import type { GridMoreRowsLoadingEventArgs } from '../grid-more-rows-loading-event-args';
import type { GridOptionChangedEventArgs } from '../grid-option-changed-event-args';
import type { GridPageChangedEventArgs } from '../grid-page-changed-event-args';
import type { GridPageChangingEventArgs } from '../grid-page-changing-event-args';
import type { GridPageSizeChangedEventArgs } from '../grid-page-size-changed-event-args';
import type { GridPageSizeChangingEventArgs } from '../grid-page-size-changing-event-args';
import type { GridPastingEventArgs } from '../grid-pasting-event-args';
import type { GridRowClickEventArgs } from '../grid-row-click-event-args';
import type { GridRowExpandedEventArgs } from '../grid-row-expanded-event-args';
import type { GridRowExpandingEventArgs } from '../grid-row-expanding-event-args';
import type { GridRowInsertedEventArgs } from '../grid-row-inserted-event-args';
import type { GridRowInsertingEventArgs } from '../grid-row-inserting-event-args';
import type { GridRowPreparedEventArgs } from '../grid-row-prepared-event-args';
import type { GridRowRemovedEventArgs } from '../grid-row-removed-event-args';
import type { GridRowRemovingEventArgs } from '../grid-row-removing-event-args';
import type { GridRowUpdatedEventArgs } from '../grid-row-updated-event-args';
import type { GridRowUpdatingEventArgs } from '../grid-row-updating-event-args';
import type { GridRowValidatingEventArgs } from '../grid-row-validating-event-args';
import type { GridSavedEventArgs } from '../grid-saved-event-args';
import type { GridSavingEventArgs } from '../grid-saving-event-args';
import type { GridSearchTextChangedEventArgs } from '../grid-search-text-changed-event-args';
import type { GridSearchTextChangingEventArgs } from '../grid-search-text-changing-event-args';
import type { GridSelectionChangedEventArgs } from '../grid-selection-changed-event-args';
import type { GridSelectionChangingEventArgs } from '../grid-selection-changing-event-args';
import type { GridSortChangedEventArgs } from '../grid-sort-changed-event-args';
import type { GridSortChangingEventArgs } from '../grid-sort-changing-event-args';
import type { GridSummaryChangedEventArgs } from '../grid-summary-changed-event-args';
import type { GridToolbarPreparingEventArgs } from '../grid-toolbar-preparing-event-args';

/**
 * Every event of the grid, by name: `grid.onX` is `events.x.event`, the `onX` prop listens to it.
 * Each event counts its listeners, so the grid skips the work of one nobody listens to (a row
 * drawn while scrolling).
 */
export class GridEvents<T> {
  readonly selectionChanging = new Emitter<GridSelectionChangingEventArgs>();
  readonly selectionChanged = new Emitter<GridSelectionChangedEventArgs>();
  readonly cellSelectionChanging = new Emitter<GridCellSelectionChangingEventArgs>();
  readonly cellSelectionChanged = new Emitter<GridCellSelectionChangedEventArgs>();
  readonly editorPreparing = new Emitter<GridEditorPreparingEventArgs<T>>();
  readonly editorPrepared = new Emitter<GridEditorPreparedEventArgs<T>>();
  readonly rowValidating = new Emitter<GridRowValidatingEventArgs<T>>();
  readonly searchTextChanging = new Emitter<GridSearchTextChangingEventArgs>();
  readonly searchTextChanged = new Emitter<GridSearchTextChangedEventArgs>();
  readonly rowExpanding = new Emitter<GridRowExpandingEventArgs>();
  readonly rowExpanded = new Emitter<GridRowExpandedEventArgs>();
  readonly rowCollapsing = new Emitter<GridRowExpandingEventArgs>();
  readonly rowCollapsed = new Emitter<GridRowExpandedEventArgs>();
  readonly groupingChanging = new Emitter<GridGroupingChangingEventArgs>();
  readonly groupingChanged = new Emitter<GridGroupingChangedEventArgs>();
  readonly groupDropping = new Emitter<GridGroupDroppingEventArgs>();
  readonly cellClick = new Emitter<GridCellClickEventArgs<T>>();
  readonly cellDblClick = new Emitter<GridCellClickEventArgs<T>>();
  readonly rowClick = new Emitter<GridRowClickEventArgs<T>>();
  readonly rowDblClick = new Emitter<GridRowClickEventArgs<T>>();
  readonly cellPrepared = new Emitter<GridCellPreparedEventArgs<T>>();
  readonly rowPrepared = new Emitter<GridRowPreparedEventArgs<T>>();
  readonly contentReady = new Emitter<GridContentReadyEventArgs>();
  readonly dataErrorOccurred = new Emitter<GridDataErrorEventArgs<T>>();
  readonly editingStart = new Emitter<GridEditingStartEventArgs<T>>();
  readonly initNewRow = new Emitter<GridInitNewRowEventArgs<T>>();
  readonly rowInserting = new Emitter<GridRowInsertingEventArgs<T>>();
  readonly rowInserted = new Emitter<GridRowInsertedEventArgs<T>>();
  readonly rowUpdating = new Emitter<GridRowUpdatingEventArgs<T>>();
  readonly rowUpdated = new Emitter<GridRowUpdatedEventArgs<T>>();
  readonly rowRemoving = new Emitter<GridRowRemovingEventArgs<T>>();
  readonly rowRemoved = new Emitter<GridRowRemovedEventArgs<T>>();
  readonly saving = new Emitter<GridSavingEventArgs<T>>();
  readonly saved = new Emitter<GridSavedEventArgs<T>>();
  readonly editCanceling = new Emitter<GridEditCancelingEventArgs<T>>();
  readonly editCanceled = new Emitter<GridEditCanceledEventArgs<T>>();
  readonly focusedCellChanging = new Emitter<GridFocusedCellChangingEventArgs<T>>();
  readonly focusedCellChanged = new Emitter<GridFocusedCellChangedEventArgs<T>>();
  readonly focusedRowChanging = new Emitter<GridFocusedRowChangingEventArgs<T>>();
  readonly focusedRowChanged = new Emitter<GridFocusedRowChangedEventArgs<T>>();
  readonly keyHandling = new Emitter<GridKeyHandlingEventArgs>();
  readonly optionChanged = new Emitter<GridOptionChangedEventArgs>();
  readonly exporting = new Emitter<GridExportingEventArgs>();
  readonly exported = new Emitter<GridExportedEventArgs>();
  readonly contextMenuPreparing = new Emitter<GridContextMenuPreparingEventArgs<T>>();
  readonly toolbarPreparing = new Emitter<GridToolbarPreparingEventArgs>();
  readonly sortChanging = new Emitter<GridSortChangingEventArgs>();
  readonly sortChanged = new Emitter<GridSortChangedEventArgs>();
  readonly filterChanging = new Emitter<GridFilterChangingEventArgs>();
  readonly filterChanged = new Emitter<GridFilterChangedEventArgs>();
  readonly filterBuilderOpening = new Emitter<GridFilterBuilderOpeningEventArgs>();
  readonly filterBuilderOpened = new Emitter<GridFilterBuilderOpenedEventArgs>();
  readonly filterBuilderClosing = new Emitter<GridFilterBuilderClosingEventArgs>();
  readonly filterBuilderClosed = new Emitter<GridFilterBuilderClosedEventArgs>();
  readonly pageChanging = new Emitter<GridPageChangingEventArgs>();
  readonly pageChanged = new Emitter<GridPageChangedEventArgs>();
  readonly pageSizeChanging = new Emitter<GridPageSizeChangingEventArgs>();
  readonly pageSizeChanged = new Emitter<GridPageSizeChangedEventArgs>();
  readonly moreRowsLoading = new Emitter<GridMoreRowsLoadingEventArgs>();
  readonly moreRowsLoaded = new Emitter<GridMoreRowsLoadedEventArgs>();
  readonly layoutChanging = new Emitter<GridLayoutChangingEventArgs>();
  readonly layoutChanged = new Emitter<GridLayout>();
  readonly copying = new Emitter<GridCopyingEventArgs>();
  readonly pasting = new Emitter<GridPastingEventArgs>();
  readonly summaryChanged = new Emitter<GridSummaryChangedEventArgs>();
  readonly actionRunning = new Emitter<GridActionRunningEventArgs<T>>();
  readonly actionRan = new Emitter<GridActionRanEventArgs<T>>();
  readonly adaptiveDetailRowPreparing = new Emitter<GridAdaptiveDetailRowPreparingEventArgs<T>>();
  readonly adaptiveDetailRowExpanding = new Emitter<GridAdaptiveRowExpandingEventArgs<T>>();
  readonly adaptiveDetailRowExpanded = new Emitter<GridAdaptiveRowExpandedEventArgs<T>>();
  readonly adaptiveDetailRowCollapsing = new Emitter<GridAdaptiveRowExpandingEventArgs<T>>();
  readonly adaptiveDetailRowCollapsed = new Emitter<GridAdaptiveRowExpandedEventArgs<T>>();

  private readonly counts = new Map<Emitter<any>, number>();
  private readonly events = new Map<Emitter<any>, MotifEvent<any>>();

  /** The event of an emitter of this set, counting who listens. */
  event<A>(emitter: Emitter<A>): MotifEvent<A> {
    let event = this.events.get(emitter) as MotifEvent<A> | undefined;
    if (!event) {
      event = (listener, thisArgs, disposables) => {
        const sub = emitter.event(listener, thisArgs);
        this.counts.set(emitter, (this.counts.get(emitter) ?? 0) + 1);
        let done = false;
        const handle: IDisposable = {
          dispose: () => {
            if (done) return;
            done = true;
            this.counts.set(emitter, (this.counts.get(emitter) ?? 1) - 1);
            sub.dispose();
          },
        };
        if (disposables instanceof DisposableStore) disposables.add(handle);
        else disposables?.push(handle);
        return handle;
      };
      this.events.set(emitter, event);
    }
    return event;
  }

  /** Whether someone listens to the emitter. */
  listened(emitter: Emitter<any>): boolean {
    return (this.counts.get(emitter) ?? 0) > 0;
  }

  /** Fires a cancelable event; whether it may go on (nobody listens, or nobody canceled). */
  ask<A extends EventArgs>(emitter: Emitter<A>, args: () => A): boolean {
    if (!this.listened(emitter)) return true;
    const e = args();
    emitter.fire(e);
    return !e.cancel;
  }

  /** Fires an event when someone listens; the args are created only then. */
  tell<A>(emitter: Emitter<A>, args: () => A) {
    if (this.listened(emitter)) emitter.fire(args());
  }

  dispose() {
    for (const value of Object.values(this)) if (value instanceof Emitter) value.dispose();
  }
}
