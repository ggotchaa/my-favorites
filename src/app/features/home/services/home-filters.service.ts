import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeFiltersService {
  private static readonly STORAGE_KEY = 'home-filters-selection';

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

  constructor() {
    const stored = this.loadPersistedFilters();

    if (stored) {
      this.selectedMonthSubject.next(stored.month);
      this.selectedYearSubject.next(stored.year);
    }
  }

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
      this.persistFilters(month, year);
      return;
    }

    this.loadingSubject.next(true);
    this.selectedMonthSubject.next(month);
    this.selectedYearSubject.next(year);
    this.persistFilters(month, year);
  }

  completeLoading(): void {
    this.loadingSubject.next(false);
  }

  reset(): void {
    this.applyFilters('All', 'All');
  }

  private loadPersistedFilters(): { month: string; year: number | 'All' } | null {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }

    try {
      const stored = window.sessionStorage.getItem(HomeFiltersService.STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored) as { month?: unknown; year?: unknown };
      const month = this.isValidMonth(parsed.month) ? parsed.month : 'All';
      const year = this.isValidYear(parsed.year) ? parsed.year : 'All';

      return { month, year };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load persisted home filters', error);
      return null;
    }
  }

  private persistFilters(month: string, year: number | 'All'): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      const payload = { month, year };
      window.sessionStorage.setItem(
        HomeFiltersService.STORAGE_KEY,
        JSON.stringify(payload)
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to persist home filters', error);
    }
  }

  private isValidMonth(value: unknown): value is string {
    if (typeof value !== 'string') {
      return false;
    }

    return value === 'All' || this.months.includes(value);
  }

  private isValidYear(value: unknown): value is number | 'All' {
    if (value === 'All') {
      return true;
    }

    return typeof value === 'number' && this.years.includes(value);
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
