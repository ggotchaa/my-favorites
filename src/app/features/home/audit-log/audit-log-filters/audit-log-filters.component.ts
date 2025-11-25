import { ChangeDetectionStrategy, Component, OnDestroy, effect, input, output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AuditLogFilters } from '../audit-log.models';

@Component({
  selector: 'app-audit-log-filters',
  templateUrl: './audit-log-filters.component.html',
  styleUrls: ['./audit-log-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AuditLogFiltersComponent implements OnDestroy {
  filters = input.required<AuditLogFilters>();

  filterChange = output<{ key: keyof AuditLogFilters; value: AuditLogFilters[keyof AuditLogFilters] }>();

  filtersForm: FormGroup;
  private readonly subscription = new Subscription();

  constructor(private readonly fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      searchValue: [''],
      logDate: [null]
    });

    effect(() => {
      const currentFilters = this.filters();
      this.filtersForm.patchValue(currentFilters, { emitEvent: false });
    });

    this.subscription.add(
      this.filtersForm.get('searchValue')?.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe((value) => {
        this.filterChange.emit({ key: 'searchValue', value });
      })
    );

    this.subscription.add(
      this.filtersForm.get('logDate')?.valueChanges.subscribe((value) => {
        this.filterChange.emit({ key: 'logDate', value });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  resetFilter(key: keyof AuditLogFilters): void {
    const control = this.filtersForm.get(key);
    if (key === 'searchValue') {
      control?.setValue('');
    } else {
      control?.setValue(null);
    }
  }
}
