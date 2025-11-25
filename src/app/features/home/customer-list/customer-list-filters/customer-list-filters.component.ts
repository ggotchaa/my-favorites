import { ChangeDetectionStrategy, Component, OnDestroy, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ApiEndpointService } from '../../../../core/services/api.service';
import { CustomerListFilters, ProductSegment } from '../customer-list.models';

@Component({
  selector: 'app-customer-list-filters',
  templateUrl: './customer-list-filters.component.html',
  styleUrls: ['./customer-list-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class CustomerListFiltersComponent implements OnDestroy {
  filters = input.required<CustomerListFilters>();
  months = input.required<string[]>();
  years = input.required<number[]>();
  activeProductSegment = input.required<ProductSegment>();
  isExporting = input<boolean>(false);

  filterChange = output<{ key: keyof CustomerListFilters; value: CustomerListFilters[keyof CustomerListFilters] }>();
  filterReset = output<keyof CustomerListFilters>();
  productSegmentChange = output<ProductSegment>();
  exportClick = output<void>();

  readonly productSegments: ReadonlyArray<{ id: ProductSegment; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'propane', label: 'Propane' },
    { id: 'butane', label: 'Butane' },
  ];

  readonly statusOptions: ReadonlyArray<string> = [
    'Not nominated',
    'Partially Nominated',
    'Not Proposed',
    'Nominated',
    'Accepted',
    'Suspended',
    'Deactivated'
  ];

  filtersForm: FormGroup;
  bidderOptions: string[] = [];
  private bidderSearch$ = new Subject<string>();
  private readonly subscription = new Subscription();

  private readonly apiEndpoints = inject(ApiEndpointService);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.filtersForm = this.fb.group({
      bidderSearch: [''],
      multipleCustomers: [[]],
      status: [[]],
      month: [[]],
      year: [[]],
      rangeFrom: [''],
      rangeTo: ['']
    });

    effect(() => {
      const currentFilters = this.filters();
      this.filtersForm.patchValue(currentFilters, { emitEvent: false });
    });

    this.subscription.add(
      this.filtersForm.get('multipleCustomers')?.valueChanges.subscribe((value) => {
        this.filterChange.emit({ key: 'multipleCustomers', value });
      })
    );

    this.subscription.add(
      this.filtersForm.get('status')?.valueChanges.subscribe((value) => {
        this.filterChange.emit({ key: 'status', value });
      })
    );

    this.subscription.add(
      this.filtersForm.get('month')?.valueChanges.subscribe((value) => {
        this.filterChange.emit({ key: 'month', value });
      })
    );

    this.subscription.add(
      this.filtersForm.get('year')?.valueChanges.subscribe((value) => {
        this.filterChange.emit({ key: 'year', value });
      })
    );

    this.subscription.add(
      this.filtersForm.get('rangeFrom')?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((value) => {
        this.filterChange.emit({ key: 'rangeFrom', value });
      })
    );

    this.subscription.add(
      this.filtersForm.get('rangeTo')?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((value) => {
        this.filterChange.emit({ key: 'rangeTo', value });
      })
    );

    this.subscription.add(
      this.filtersForm.get('bidderSearch')?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((value) => {
        this.filterChange.emit({ key: 'bidderSearch', value });
      })
    );

    this.setupBidderLookup();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.bidderSearch$.complete();
  }

  resetFilter(key: keyof CustomerListFilters): void {
    const control = this.filtersForm.get(key);
    if (key === 'rangeFrom' || key === 'rangeTo' || key === 'bidderSearch') {
      control?.setValue('');
    } else {
      control?.setValue([]);
    }
    this.filterReset.emit(key);
  }

  selectProductSegment(segment: ProductSegment): void {
    this.productSegmentChange.emit(segment);
  }

  onExportClick(): void {
    this.exportClick.emit();
  }

  private setupBidderLookup(): void {
    this.subscription.add(
      this.apiEndpoints.lookupCustomers().subscribe({
        next: (options) => (this.bidderOptions = options),
        error: (err) => console.error('Failed initial bidder lookup', err),
      })
    );
  }
}
