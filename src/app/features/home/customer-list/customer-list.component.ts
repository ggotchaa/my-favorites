import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { switchMap, tap, finalize } from 'rxjs/operators';

import { NotificationService } from '../../../core/services/notification.service';
import { HomeFiltersService } from '../services/home-filters.service';
import { PaginationEvent } from '../../../shared/components/pagination/pagination.component';
import { PaginationState } from '../../../shared/utils/query-models';
import { CustomerListFilters, ProductSegment, CustomerListRow, CustomerListColumn } from './customer-list.models';
import { CustomerListDataService, CustomerListData } from './services/customer-list-data.service';
import { CustomerListSortService } from './services/customer-list-sort.service';
import { CustomerListUtils } from './customer-list.utils';
import { CUSTOMER_LIST_COLUMNS, DEFAULT_PAGE_SIZE } from './customer-list.config';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CustomerListSortService],
  standalone: false
})
export class CustomerListComponent implements OnDestroy {
  readonly columns: CustomerListColumn[] = CUSTOMER_LIST_COLUMNS;
  readonly displayedColumns = this.columns.map(c => c.key);

  activeProductSegment: ProductSegment = 'all';
  listFilters: CustomerListFilters = {
    multipleCustomers: [],
    status: [],
    month: [],
    year: [],
    rangeFrom: '',
    rangeTo: '',
    bidderSearch: ''
  };

  readonly months: string[];
  readonly years: number[];
  selectedMonth = '';
  selectedYear!: number | 'All';

  customerListData$!: Observable<CustomerListData>;
  isLoading = false;
  isExporting = false;

  get currentSort() {
    return this.sortService.currentSort;
  }

  private filtersSubject!: BehaviorSubject<CustomerListFilters>;
  private paginationSubject!: BehaviorSubject<PaginationState>;
  private readonly subscription = new Subscription();

  private readonly homeFilters = inject(HomeFiltersService);
  private readonly dataService = inject(CustomerListDataService);
  private readonly sortService = inject(CustomerListSortService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.months = this.homeFilters.months;
    this.years = this.homeFilters.years;
    this.selectedMonth = this.homeFilters.selectedMonth;
    this.selectedYear = this.homeFilters.selectedYear;

    this.initializeSubscriptions();
    this.initializeDataStream();
    this.emitFilters();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.filtersSubject.complete();
    this.paginationSubject.complete();
    this.sortService.destroy();
  }

  updateListFilter<Key extends keyof CustomerListFilters>(key: Key, value: CustomerListFilters[Key]): void {
    this.listFilters[key] = value;
    this.resetToFirstPage();
    this.emitFilters();
  }

  resetListFilter<Key extends keyof CustomerListFilters>(key: Key): void {
    if (key === 'multipleCustomers' || key === 'status' || key === 'month' || key === 'year') {
      (this.listFilters[key] as string[] | (string | number)[]) = [];
    } else {
      (this.listFilters[key] as string) = '';
    }
    this.resetToFirstPage();
    this.emitFilters();
  }

  selectProductSegment(segment: ProductSegment): void {
    this.activeProductSegment = segment;
    this.resetToFirstPage();
    this.emitFilters();
  }

  onPageChange(event: PaginationEvent): void {
    this.paginationSubject.next({ pageNumber: event.pageNumber, pageSize: event.pageSize });
  }

  onSort(column: CustomerListColumn): void {
    this.sortService.toggleSort(column);
    this.resetToFirstPage();
  }

  getSortIcon(column: CustomerListColumn): string {
    return CustomerListUtils.getSortIcon(column, this.sortService.currentSort);
  }

  getSortClass(column: CustomerListColumn): string {
    return CustomerListUtils.getSortClass(column, this.sortService.currentSort);
  }

  ariaSort(column: CustomerListColumn): 'none' | 'ascending' | 'descending' {
    return CustomerListUtils.getAriaSort(column, this.sortService.currentSort);
  }

  getTooltip(row: CustomerListRow, key: keyof CustomerListRow): string {
    return CustomerListUtils.getCellTooltip(row, key);
  }

  exportToExcel(): void {
    this.isExporting = true;
    this.cdr.markForCheck();
    this.dataService.exportCustomers(this.listFilters, this.sortService.currentSort, this.activeProductSegment)
      .pipe(
        finalize(() => {
          this.isExporting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: blob => CustomerListUtils.downloadFile(blob, CustomerListUtils.generateExportFilename()),
        error: error => {
          console.error('Failed to export customers', error);
          this.notificationService.notifyError('Failed to export customers. Please try again.');
        },
      });
  }

  private initializeSubscriptions(): void {
    this.subscription.add(
      this.homeFilters.selectedMonth$.subscribe(month => {
        this.selectedMonth = month;
        if (this.homeFilters.isLoading) this.homeFilters.completeLoading();
      })
    );

    this.subscription.add(
      this.homeFilters.selectedYear$.subscribe(year => {
        this.selectedYear = year;
        if (this.homeFilters.isLoading) this.homeFilters.completeLoading();
      })
    );
  }

  private initializeDataStream(): void {
    this.filtersSubject = new BehaviorSubject<CustomerListFilters>({ ...this.listFilters });
    this.paginationSubject = new BehaviorSubject<PaginationState>({ pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE });

    this.customerListData$ = combineLatest([
      this.filtersSubject,
      this.paginationSubject,
      this.sortService.sort$,
    ]).pipe(
      tap(() => (this.isLoading = true)),
      switchMap(([filters, pagination, sort]) =>
        this.dataService.searchCustomers(filters, pagination, sort, this.activeProductSegment).pipe(
          tap(() => (this.isLoading = false)),
          finalize(() => (this.isLoading = false))
        )
      )
    );
  }

  private emitFilters(): void {
    this.filtersSubject?.next({ ...this.listFilters });
  }

  private resetToFirstPage(): void {
    this.paginationSubject?.next({ ...this.paginationSubject.value, pageNumber: 1 });
  }
}
