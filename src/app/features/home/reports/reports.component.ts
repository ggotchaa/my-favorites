import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';

import { ApiEndpointService } from '../../../core/services/api.service';
import { HomeFiltersService } from '../services/home-filters.service';
import { BiddingReport } from './bidding-report.interface';
import { ReportDetailsDialogComponent } from './report-details-dialog/report-details-dialog.component';

interface ReportsRow {
  id: number;
  name: string;
  totalBidVolume: number;
  totalBidVolumePr: number;
  totalBidVolumePp: number;
  weightedAvgPr: number | null;
  weightedAvgPp: number | null;
  month: string;
  year: number;
  historyFiles: string[];
  reportFile: string;
  reportLink: string;
  status: string;
  locked: boolean;
  exception: boolean;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit, OnDestroy {
  private static readonly MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ] as const;

  selectedMonth = '';
  selectedYear!: number;

  reports$!: Observable<ReportsRow[]>;

  private readonly subscription = new Subscription();

  constructor(
    private readonly apiEndpoints: ApiEndpointService,
    private readonly filters: HomeFiltersService,
    private readonly dialog: MatDialog
  ) {
    this.selectedMonth = this.filters.selectedMonth;
    this.selectedYear = this.filters.selectedYear;

    this.subscription.add(
      this.filters.selectedMonth$.subscribe((month) => (this.selectedMonth = month))
    );
    this.subscription.add(
      this.filters.selectedYear$.subscribe((year) => (this.selectedYear = year))
    );
  }

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  statusClass(status: string | null | undefined): string {
    const normalized = String(status ?? '').toLowerCase();
    switch (normalized) {
      case 'active':
        return 'status status--active';
      case 'pending':
        return 'status status--pending';
      case 'complete':
      case 'completed':
      case 'closed':
        return 'status status--complete';
      default:
        return 'status';
    }
  }

  exceptionClass(hasException: boolean): string {
    return hasException ? 'exception-chip exception-chip--active' : 'exception-chip';
  }

  trackByReportId(_: number, row: ReportsRow): number {
    return row.id;
  }

  openReportDetails(row: ReportsRow): void {
    const loadReport$ = this.apiEndpoints
      .getBiddingReport(row.id)
      .pipe(take(1))
      .subscribe({
        next: (report) => {
          this.dialog.open(ReportDetailsDialogComponent, {
            data: report,
            maxWidth: '900px',
            width: '90vw'
          });
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load bidding report details', error);
        }
      });

    this.subscription.add(loadReport$);
  }

  // data
  private loadReports(): void {
    this.reports$ = combineLatest([this.filters.selectedMonth$, this.filters.selectedYear$]).pipe(
      switchMap(([monthName, year]) => {
        const month = this.toMonthNumberForFilter(monthName);
        const numericYear = this.toNumericYear(year);

        if (month !== null && numericYear !== null) {
          return this.apiEndpoints.getBiddingReports({ month, year: numericYear });
        }

        return this.apiEndpoints.getBiddingReports();
      }),
      map((reports) => reports.map((report) => this.mapReport(report))),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private mapReport(report: BiddingReport): ReportsRow {
    return {
      id: report.id,
      name: report.reportName,
      totalBidVolume: report.totalVolume,
      totalBidVolumePr: report.totalPropaneVolume,
      totalBidVolumePp: report.totalButaneVolume,
      weightedAvgPr: report.weightedAvgPropanePrice,
      weightedAvgPp: report.weightedAvgButanePrice,
      month: this.toMonthName(report.reportMonth),
      year: report.reportYear,
      historyFiles: report.previousReportLink ? [report.previousReportLink] : [],
      reportFile: report.fileName,
      reportLink: report.filePath,
      status: report.status,
      locked: this.isLocked(report.status),
      exception: report.reportName.toLowerCase().includes('exception')
    };
  }

  private toMonthName(monthIndex: string): string {
    const monthNumber = Number(monthIndex);
    if (!Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return monthIndex;
    }
    return ReportsComponent.MONTH_NAMES[monthNumber - 1] ?? monthIndex;
  }

  private toMonthNumberForFilter(monthName: string | null | undefined): number | null {
    if (!monthName) {
      return null;
    }

    const normalized = monthName.trim().toLowerCase();
    if (!normalized || normalized === 'all' || normalized === 'all months') {
      return null;
    }

    const index = ReportsComponent.MONTH_NAMES.findIndex(
      (name) => name.toLowerCase() === normalized
    );

    return index >= 0 ? index + 1 : null;
  }

  private toNumericYear(year: number | string | null | undefined): number | null {
    if (typeof year === 'number' && Number.isFinite(year)) {
      return year;
    }

    if (typeof year === 'string') {
      const trimmed = year.trim().toLowerCase();
      if (!trimmed || trimmed === 'all years' || trimmed === 'all') {
        return null;
      }

      const parsed = Number(year);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private isLocked(status: string | null | undefined): boolean {
    const normalized = String(status ?? '').toLowerCase();
    return normalized === 'active' || normalized === 'pending';
  }
}
