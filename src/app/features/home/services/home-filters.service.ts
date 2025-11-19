import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeFiltersService {
  readonly months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  readonly years: number[] = this.createYearsRange();

  private readonly selectedMonthSubject = new BehaviorSubject<string>('All');
  private readonly selectedYearSubject = new BehaviorSubject<number | 'All'>(
    'All'
  );
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly selectedMonth$ = this.selectedMonthSubject.asObservable();
  readonly selectedYear$ = this.selectedYearSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  get selectedMonth(): string {
    return this.selectedMonthSubject.value;
  }

  get selectedYear(): number | 'All' {
    return this.selectedYearSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  applyFilters(month: string, year: number | 'All'): void {
    const hasMonthChanged = this.selectedMonthSubject.value !== month;
    const hasYearChanged = this.selectedYearSubject.value !== year;

    if (!hasMonthChanged && !hasYearChanged) {
      return;
    }

    this.loadingSubject.next(true);
    this.selectedMonthSubject.next(month);
    this.selectedYearSubject.next(year);
  }

  completeLoading(): void {
    this.loadingSubject.next(false);
  }

  reset(): void {
    this.applyFilters('All', 'All');
  }

  private createYearsRange(): number[] {
    const startYear = 2020;
    const now = new Date();
    const currentYear = now.getFullYear() + (now.getMonth() >= 11 ? 1 : 0);
    return Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => startYear + i
    );
  }
}
