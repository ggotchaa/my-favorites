import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { HomeFiltersService } from '../services/home-filters.service';

interface CustomerListRow {
  bidder: string;
  region: string;
  status: string;
  volume: number;
  contract: string;
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

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    { key: 'region', label: 'Region' },
    { key: 'status', label: 'Status' },
    { key: 'volume', label: 'Volume' },
    { key: 'contract', label: 'Contract' }
  ];

  readonly displayedColumns = this.columns.map((column) => column.key);

  readonly listTableData: CustomerListRow[] = [
    {
      bidder: 'Ken Parker',
      region: 'North',
      status: 'Active',
      volume: 420,
      contract: 'RLF-1043'
    },
    {
      bidder: 'Jane Smith',
      region: 'East',
      status: 'Pending',
      volume: 310,
      contract: 'RLF-1056'
    },
    {
      bidder: 'Bob Johnson',
      region: 'West',
      status: 'Complete',
      volume: 515,
      contract: 'RLF-1021'
    }
  ];

  readonly listFilters: CustomerListFilters = {
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
  selectedYear!: number;

  private readonly subscription = new Subscription();

  constructor(private readonly filters: HomeFiltersService) {
    this.months = this.filters.months;
    this.years = this.filters.years;

    this.selectedMonth = this.filters.selectedMonth;
    this.selectedYear = this.filters.selectedYear;

    this.subscription.add(
      this.filters.selectedMonth$.subscribe((month) => (this.selectedMonth = month))
    );

    this.subscription.add(
      this.filters.selectedYear$.subscribe((year) => (this.selectedYear = year))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateListFilter<Key extends keyof CustomerListFilters>(key: Key, value: CustomerListFilters[Key]): void {
    this.listFilters[key] = value;
  }

  resetListFilter<Key extends keyof CustomerListFilters>(key: Key): void {
    this.listFilters[key] = '' as CustomerListFilters[Key];
  }

  selectProductSegment(segment: ProductSegment): void {
    this.activeProductSegment = segment;
  }

  valueFor(row: CustomerListRow, key: keyof CustomerListRow): string | number {
    return row[key];
  }
}
