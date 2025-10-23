import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { ApiEndpointService } from '../../../core/services/api.service';
import {
  CustomersBiddingDataRequestDto,
  CustomersListDto,
  FilterDescriptor,
  FilterOperator,
} from '../../../core/services/api.types';
import { HomeFiltersService } from '../services/home-filters.service';

interface CustomerListRow {
  bidder: string;
  product: string;
  status: string;
  bidVolume: number | null;
  rollingLiftFactor: number | null;
}

interface CustomerListColumn {
  key: keyof CustomerListRow;
  label: string;
}

interface CustomerListFilters {
  multipleCustomers: string;
  customer: string;
  status: string;
  month: string;
  year: string | number;
  rangeFrom: string;
  rangeTo: string;
}

type ProductSegment = 'all' | 'propane' | 'butane';

const enum FilterOperatorValue {
  Equals = 0,
  Contains = 1,
  Between = 8,
}

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CustomerListComponent implements OnDestroy {
  readonly productSegments: ReadonlyArray<{ id: ProductSegment; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'propane', label: 'Propane' },
    { id: 'butane', label: 'Butane' }
  ];

  activeProductSegment: ProductSegment = 'all';

  readonly columns: CustomerListColumn[] = [
    { key: 'bidder', label: 'Bidder' },
    { key: 'product', label: 'Product' },
    { key: 'status', label: 'Status' },
    { key: 'bidVolume', label: 'Bid Volume' },
    { key: 'rollingLiftFactor', label: 'Rolling Lift Factor' }
  ];

  readonly displayedColumns = this.columns.map((column) => column.key);

  listFilters: CustomerListFilters = {
    multipleCustomers: '',
    customer: '',
    status: '',
    month: '',
    year: '',
    rangeFrom: '',
    rangeTo: ''
  };

  readonly months: string[];
  readonly years: number[];

  selectedMonth = '';
  selectedYear!: number | 'All';
  customers$!: Observable<CustomerListRow[]>;
  isLoading = false;

  private filtersSubject!: BehaviorSubject<CustomerListFilters>;
  private readonly subscription = new Subscription();

  constructor(
    private readonly filters: HomeFiltersService,
    private readonly apiEndpoints: ApiEndpointService
  ) {
    this.months = this.filters.months;
    this.years = this.filters.years;

    this.selectedMonth = this.filters.selectedMonth;
    this.selectedYear = this.filters.selectedYear;

    this.subscription.add(
      this.filters.selectedMonth$.subscribe((month) => {
        this.selectedMonth = month;
        if (this.filters.isLoading) {
          this.filters.completeLoading();
        }
      })
    );

    this.subscription.add(
      this.filters.selectedYear$.subscribe((year) => {
        this.selectedYear = year;
        if (this.filters.isLoading) {
          this.filters.completeLoading();
        }
      })
    );

    this.filtersSubject = new BehaviorSubject<CustomerListFilters>({ ...this.listFilters });

    this.customers$ = this.filtersSubject.pipe(
      switchMap((filters) => {
        this.isLoading = true;

        return this.apiEndpoints.searchCustomers(this.buildSearchPayload(filters)).pipe(
          map((response) => (response.items ?? []).map((item) => this.mapCustomerRow(item))),
          catchError((error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to load customers', error);
            return of<CustomerListRow[]>([]);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        );
      })
    );

    this.emitFilters();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.filtersSubject.complete();
  }

  updateListFilter<Key extends keyof CustomerListFilters>(key: Key, value: CustomerListFilters[Key]): void {
    this.listFilters[key] = value;
    this.emitFilters();
  }

  resetListFilter<Key extends keyof CustomerListFilters>(key: Key): void {
    this.listFilters[key] = '' as CustomerListFilters[Key];
    this.emitFilters();
  }

  selectProductSegment(segment: ProductSegment): void {
    this.activeProductSegment = segment;
    this.emitFilters();
  }

  valueFor(row: CustomerListRow, key: keyof CustomerListRow): string {
    const value = row[key];

    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    return value;
  }

  private emitFilters(): void {
    if (!this.filtersSubject) {
      return;
    }

    this.filtersSubject.next({ ...this.listFilters });
  }

  private buildSearchPayload(filters: CustomerListFilters): CustomersBiddingDataRequestDto {
    const filterDescriptors: FilterDescriptor[] = [];

    if (filters.multipleCustomers) {
      filterDescriptors.push({
        field: 'Bidder',
        operator: FilterOperatorValue.Contains as FilterOperator,
        value: filters.multipleCustomers,
      });
    }

    if (filters.customer) {
      filterDescriptors.push({
        field: 'Bidder',
        operator: FilterOperatorValue.Equals as FilterOperator,
        value: filters.customer,
      });
    }

    if (filters.status) {
      filterDescriptors.push({
        field: 'Status',
        operator: FilterOperatorValue.Equals as FilterOperator,
        value: filters.status,
      });
    }

    if (filters.month) {
      filterDescriptors.push({
        field: 'Month',
        operator: FilterOperatorValue.Equals as FilterOperator,
        value: filters.month,
      });
    }

    if (filters.year) {
      filterDescriptors.push({
        field: 'Year',
        operator: FilterOperatorValue.Equals as FilterOperator,
        value: String(filters.year),
      });
    }

    if (filters.rangeFrom && filters.rangeTo) {
      filterDescriptors.push({
        field: 'RollingLiftFactor',
        operator: FilterOperatorValue.Between as FilterOperator,
        values: [filters.rangeFrom, filters.rangeTo],
      });
    }

    const productSegment = this.productSegmentFilterValue();
    if (productSegment) {
      filterDescriptors.push({
        field: 'Product',
        operator: FilterOperatorValue.Equals as FilterOperator,
        value: productSegment,
      });
    }

    return {
      filter: filterDescriptors.length ? filterDescriptors : undefined,
      sorting: undefined,
      paging: {
        pageNumber: 1,
        pageSize: 25,
        includeTotal: true,
        all: false,
      },
    };
  }

  private productSegmentFilterValue(): string {
    switch (this.activeProductSegment) {
      case 'propane':
        return 'Propane';
      case 'butane':
        return 'Butane';
      default:
        return '';
    }
  }

  private mapCustomerRow(dto: CustomersListDto): CustomerListRow {
    return {
      bidder: dto.bidder ?? '—',
      product: dto.product ?? '—',
      status: dto.status ?? '—',
      bidVolume: dto.bidVolume ?? null,
      rollingLiftFactor: dto.rollingLiftFactor ?? null,
    };
  }
}
