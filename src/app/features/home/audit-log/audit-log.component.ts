import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs';
import { switchMap, tap, finalize, debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';

import { ApiEndpointService } from '../../../core/services/api.service';
import { AuditLogDtoPagedResult, AuditLogSearchRequestDto } from '../../../core/services/api.types';
import { NotificationService } from '../../../core/services/notification.service';
import { HomeFiltersService } from '../services/home-filters.service';
import { PaginationEvent, PaginationInfo } from '../../../shared/components/pagination/pagination.component';
import { PaginationState } from '../../../shared/utils/query-models';
import { AuditLogFilters, AuditLogRow, AuditLogColumn } from './audit-log.models';
import { AUDIT_LOG_COLUMNS, DEFAULT_PAGE_SIZE } from './audit-log.config';
import { SortDescriptor } from '../../../core/services/api.types';
import { MaterializeConfirmationDialogComponent } from './materialize-confirmation-dialog/materialize-confirmation-dialog.component';

interface AuditLogData {
  rows: AuditLogRow[];
  paginationInfo: PaginationInfo;
}

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'hidden' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AuditLogComponent implements OnDestroy {
  readonly columns: AuditLogColumn[] = AUDIT_LOG_COLUMNS;
  readonly displayedColumns = this.columns.map(c => c.key);

  auditLogFilters: AuditLogFilters = {
    searchValue: '',
    logDateFrom: null,
    logDateTo: null
  };

  auditLogData$!: Observable<AuditLogData>;
  isLoading = false;
  isMaterializing = false;
  currentSort: SortDescriptor = { field: null, direction: undefined };

  private filtersSubject!: BehaviorSubject<AuditLogFilters>;
  private paginationSubject!: BehaviorSubject<PaginationState>;
  private sortSubject!: BehaviorSubject<SortDescriptor>;
  private readonly subscription = new Subscription();

  private readonly apiEndpoints = inject(ApiEndpointService);
  private readonly homeFilters = inject(HomeFiltersService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);

  constructor() {
    this.subscription.add(
      this.homeFilters.selectedMonth$.subscribe(() => {
        if (this.homeFilters.isLoading) {
          this.homeFilters.completeLoading();
        }
      })
    );

    this.subscription.add(
      this.homeFilters.selectedYear$.subscribe(() => {
        if (this.homeFilters.isLoading) {
          this.homeFilters.completeLoading();
        }
      })
    );

    this.initializeDataStream();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.filtersSubject.complete();
    this.paginationSubject.complete();
    this.sortSubject.complete();
  }

  updateFilter<Key extends keyof AuditLogFilters>(key: Key, value: AuditLogFilters[Key]): void {
    this.auditLogFilters[key] = value;
    this.paginationSubject.next({ ...this.paginationSubject.value, pageNumber: 1 });
    this.filtersSubject.next({ ...this.auditLogFilters });
  }

  resetFilters(): void {
    this.auditLogFilters = {
      searchValue: '',
      logDateFrom: null,
      logDateTo: null
    };
    this.paginationSubject.next({ ...this.paginationSubject.value, pageNumber: 1 });
    this.filtersSubject.next({ ...this.auditLogFilters });
  }

  onPageChange(event: PaginationEvent): void {
    this.paginationSubject.next({ pageNumber: event.pageNumber, pageSize: event.pageSize });
  }

  onSort(column: AuditLogColumn): void {
    if (!column.sortable || !column.sortField) return;

    const { field, direction } = this.currentSort;

    if (field === column.sortField) {
      if (direction === 0) {
        this.currentSort = { field: column.sortField, direction: 1 };
      } else if (direction === 1) {
        this.currentSort = { field: null, direction: undefined };
      } else {
        this.currentSort = { field: column.sortField, direction: 0 };
      }
    } else {
      this.currentSort = { field: column.sortField, direction: 0 };
    }

    this.paginationSubject.next({ ...this.paginationSubject.value, pageNumber: 1 });
    this.sortSubject.next(this.currentSort);
  }

  toggleRowExpansion(row: AuditLogRow, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    row.isExpanded = !row.isExpanded;
    this.cdr.markForCheck();
  }

  getSortIcon(column: AuditLogColumn): string {
    if (!column.sortable || !column.sortField || this.currentSort.field !== column.sortField) {
      return 'unfold_more';
    }
    return 'keyboard_arrow_up';
  }

  getSortClass(column: AuditLogColumn): string {
    if (!column.sortable || !column.sortField || this.currentSort.field !== column.sortField) {
      return '';
    }
    if (this.currentSort.direction === 0) return 'sort-active sort-asc';
    if (this.currentSort.direction === 1) return 'sort-active sort-desc';
    return '';
  }

  getActionLabel(actionType: string | null | undefined): string {
    const action = actionType?.toUpperCase();
    switch (action) {
      case 'I': return 'Insert';
      case 'U': return 'Update';
      case 'D': return 'Delete';
      default: return action || 'Unknown';
    }
  }

  getChangedFieldsCount(row: AuditLogRow): number {
    return row.changes?.length ?? 0;
  }

  onMaterializeAuditLogs(): void {
    const dialogRef = this.dialog.open(MaterializeConfirmationDialogComponent, {
      width: '500px',
      disableClose: false
    });

    this.subscription.add(
      dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          this.executeMaterialize();
        }
      })
    );
  }

  private executeMaterialize(): void {
    this.isMaterializing = true;
    this.cdr.markForCheck();

    this.subscription.add(
      this.apiEndpoints.materializeAuditLogs().subscribe({
        next: (response) => {
          this.isMaterializing = false;
          this.cdr.markForCheck();

          const message = response.status || 'Audit logs materialized successfully';

          this.notificationService['snackBar'].open(message, 'Dismiss', {
            duration: 6000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar'],
          });

          this.filtersSubject.next({ ...this.auditLogFilters });
        },
        error: (error) => {
          this.isMaterializing = false;
          this.cdr.markForCheck();

          console.error('Failed to materialize audit logs', error);
          this.notificationService.notifyError('Failed to materialize audit logs. Please try again.');
        }
      })
    );
  }

  private initializeDataStream(): void {
    this.filtersSubject = new BehaviorSubject<AuditLogFilters>({ ...this.auditLogFilters });
    this.paginationSubject = new BehaviorSubject<PaginationState>({ pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE });
    this.sortSubject = new BehaviorSubject<SortDescriptor>(this.currentSort);

    this.auditLogData$ = combineLatest([
      this.filtersSubject,
      this.paginationSubject,
      this.sortSubject
    ]).pipe(
      debounceTime(0),
      distinctUntilChanged((prev, curr) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      }),
      tap(() => {
        this.isLoading = true;
        this.cdr.markForCheck();
      }),
      switchMap(([filters, pagination, sort]) =>
        this.searchAuditLog(filters, pagination, sort).pipe(
          tap(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }),
          finalize(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          })
        )
      )
    );
  }

  private searchAuditLog(
    filters: AuditLogFilters,
    pagination: PaginationState,
    sort: SortDescriptor
  ): Observable<AuditLogData> {
    let formattedDateFrom: string | null = null;
    let formattedDateTo: string | null = null;

    if (filters.logDateFrom) {
      const date = filters.logDateFrom;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDateFrom = `${year}-${month}-${day}T00:00:00.000Z`;
    }

    if (filters.logDateTo) {
      const date = filters.logDateTo;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDateTo = `${year}-${month}-${day}T23:59:59.999Z`;
    }

    const payload: AuditLogSearchRequestDto = {
      searchValue: filters.searchValue || null,
      logDateFrom: formattedDateFrom,
      logDateTo: formattedDateTo,
      sorting: sort.field ? [sort] : [],
      paging: {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        includeTotal: true
      }
    };

    return this.apiEndpoints.searchAuditLog(payload).pipe(
      switchMap((response: AuditLogDtoPagedResult) => {
        const rows: AuditLogRow[] = (response.items ?? []).map(item => ({
          ...item,
          isExpanded: false
        }));

        const paginationInfo: PaginationInfo = {
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalCount: response.totalCount ?? 0,
          totalPages: response.totalPages,
          hasPrevious: response.hasPrevious,
          hasNext: response.hasNext
        };

        return of({ rows, paginationInfo });
      }),
      catchError((error) => {
        console.error('Failed to search audit log', error);
        this.notificationService.notifyError('Failed to load audit log data. Please try again.');

        return of({
          rows: [],
          paginationInfo: {
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            totalCount: 0,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false
          }
        });
      })
    );
  }
}
