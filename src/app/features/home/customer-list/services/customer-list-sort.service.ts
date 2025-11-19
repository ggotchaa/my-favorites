import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CustomerListColumn } from '../customer-list.models';
import { SortState, SortDirectionValue } from '../../../../shared/utils/query-models';
import { SortDirection } from '../../../../core/services/api.types';

@Injectable()
export class CustomerListSortService {
  private sortSubject = new BehaviorSubject<SortState>({ field: null, direction: null });
  readonly sort$ = this.sortSubject.asObservable();

  get currentSort(): SortState {
    return this.sortSubject.value;
  }

  toggleSort(column: CustomerListColumn): void {
    if (!column.sortable || !column.sortField) return;

    const { field, direction } = this.currentSort;

    if (field === column.sortField) {
      if (direction === SortDirectionValue.Asc) {
        this.sortSubject.next({ field: column.sortField, direction: SortDirectionValue.Desc as SortDirection });
      } else if (direction === SortDirectionValue.Desc) {
        this.sortSubject.next({ field: null, direction: null });
      } else {
        this.sortSubject.next({ field: column.sortField, direction: SortDirectionValue.Asc as SortDirection });
      }
    } else {
      this.sortSubject.next({ field: column.sortField, direction: SortDirectionValue.Asc as SortDirection });
    }
  }

  reset(): void {
    this.sortSubject.next({ field: null, direction: null });
  }

  destroy(): void {
    this.sortSubject.complete();
  }
}
