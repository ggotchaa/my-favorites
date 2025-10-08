import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
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

  readonly years: number[] = this.createYearsRange(5);

  private readonly selectedMonthSubject = new BehaviorSubject<string>(
    this.months[new Date().getMonth()]
  );
  private readonly selectedYearSubject = new BehaviorSubject<number>(this.years[0]);

  readonly selectedMonth$ = this.selectedMonthSubject.asObservable();
  readonly selectedYear$ = this.selectedYearSubject.asObservable();

  get selectedMonth(): string {
    return this.selectedMonthSubject.value;
  }

  get selectedYear(): number {
    return this.selectedYearSubject.value;
  }

  setSelectedMonth(month: string): void {
    this.selectedMonthSubject.next(month);
  }

  setSelectedYear(year: number): void {
    this.selectedYearSubject.next(year);
  }

  private createYearsRange(totalYears: number): number[] {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: totalYears }, (_, index) => currentYear - index);
  }
}
